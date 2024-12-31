const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");

const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');

const sendEmailHelper = require("../../helpers/sendEmail.helper");

// [GET] /checkout/
module.exports.index = async (req, res) => {
    // Cart
    const cartId = req.cookies.cartId;

    const cart = await Cart.findOne({ 
        _id: cartId 
    });

    cart.totalPrice = 0;

    if (cart.products.length > 0) {
        for (const product of cart.products) {
            const productInfo = await Product.findOne({
                _id: product.productId
            }).select("title thumbnail slug price discountPercentage");
            
            productInfo.priceNew = (1 - productInfo.discountPercentage / 100) * productInfo.price;
            
            product.totalPrice = 0;
            product.totalQuantity = 0;
            for (const size of product.size) {
                size.totalPrice = productInfo.priceNew * size.quantity;
                product.totalPrice += size.totalPrice;
                product.totalQuantity += size.quantity;
            }

            cart.totalPrice += product.totalPrice;

            product.productInfo = productInfo;
        }
    }

    if(req.query.totalPrice){
        cart.totalPrice = Number(req.query.totalPrice);
    }
    else{
        cart.totalPrice = parseFloat(cart.totalPrice.toFixed(2));
    }
    
    // End Cart

    const user = res.locals.user;
    
    res.render("client/pages/checkout/index", {
        pageTitle: "Đặt hàng",
        cartDetail: cart,
        user: user
      });
}

// [POST] /checkout/order
module.exports.orderPost = async (req, res) => {
    const cartId = req.cookies.cartId;
    const userInfo = {
        fullName: req.body.fullName,
        phone: req.body.phone,
        address: req.body.address,
    };

    const orderData = {
        userInfo: userInfo,
        products: [],
        payment_method: req.body.payment_method,
        totalPrice: Number(req.body.totalPrice)
    };

    const cart = await Cart.findOne({
        _id: cartId
    });

    for(const item of cart.products){
        const productInfo = await Product.findOne({
            _id: item.productId
        }).select("title thumbnail slug price discountPercentage");

        item.totalQuantity = 0;

        for (const size of item.size) {
            item.totalQuantity += size.quantity;
        }
    
        orderData.products.push({
            productId: item.productId,
            price: productInfo.price,
            discountPercentage: productInfo.discountPercentage,
            quantity: item.totalQuantity
        });
    }

    orderData.userId = res.locals.user.id;

    const order = new Order(orderData);
    await order.save();

    await Cart.updateOne({
        _id: cartId
    }, {
        products: []
    });

    if(order.payment_method == "cash"){
        res.redirect(`/checkout/success/${order.id}`);
    }
    else{
        res.redirect(`/checkout/create_payment_url?orderId=${order.id}&amount=${order.totalPrice}`);
    }
}

// [GET] /checkout/success/:orderId
module.exports.success = async (req, res) => {
    const orderId = req.params.orderId;

    const order = await Order.findOne({
        _id: orderId
    }); 

    for(const item of order.products){
        const productInfo = await Product.findOne({
            _id: item.productId
        });

        item.thumbnail = productInfo.thumbnail;
        item.title = productInfo.title;
        item.priceNew = (1 - item.discountPercentage/100) * item.price;
        item.totalPrice = item.priceNew * item.quantity;

        await Product.updateOne({
            _id: item.productId
        }, {
            stock: productInfo.stock - item.quantity
        });
    }

    totalPrice = order.totalPrice;

    if(order.payment_method == "vnpay"){
        await Order.updateOne({
            _id: orderId
        }, {
            is_payment: true
        })
    }

    await Order.updateOne({
        _id: orderId
    }, {
        status: "Đang xử lý"
    });

    const subject = "Thông tin đơn hàng đã đặt thành công";
    const htmlSendMail = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <h2 style="color: #333;">Thông tin đơn hàng đã đặt thành công</h2>
    <p>Xin chào,</p>
    <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Dưới đây là thông tin về đơn hàng của bạn:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Hình ảnh</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Sản phẩm</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Giá</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Số lượng</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tổng giá</th>
        </tr>
      </thead>
      <tbody>
        ${order.products.map(item => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">
              <img src="${item.thumbnail[0]}" alt="${item.title}" style="width: 80px; height: 80px;">
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.title}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.priceNew.toLocaleString()} ₫</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.totalPrice.toLocaleString()} ₫</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3 style="margin-top: 20px;">Tổng giá trị đơn hàng: ${totalPrice.toLocaleString()} ₫</h3>

    <p>Cảm ơn bạn đã mua sắm với chúng tôi!</p>
    <p>Trân trọng,</p>
    <p>Đội ngũ hỗ trợ khách hàng.</p>
  </div>
`;

    const email = res.locals.user.email;
    sendEmailHelper.sendEmail(email, subject, htmlSendMail);

    res.render("client/pages/checkout/success", {
        pageTitle: "Đặt hàng thành công",
        order: order,
        totalPrice: totalPrice
    });
}


module.exports.create_url_payment = async (req, res) => {
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_Url = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    let tmnCode = process.env.VNP_TMN_CODE;
    let date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    let secretKey = vnp_HashSecret;

    const orderId = req.query.orderId;
    let amount = req.query.amount;
    
    const locale = 'vn';
    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = Number(amount) * 100;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_CreateDate'] = createDate;

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;
    
    const vnpUrl = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

    res.redirect(vnpUrl);
}

module.exports.vnpay_return = async (req, res) => {
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    let vnp_Params = req.query;
    let secretKey = vnp_HashSecret;

    let secureHash = vnp_Params['vnp_SecureHash'];

    const orderId = vnp_Params.vnp_TxnRef;

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
        const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
        if (vnp_ResponseCode === '00') {
            req.flash("success", "Thanh toán thành công!");
            res.redirect(`/checkout/success/${orderId}`);
        } else {
            res.send('Thanh toán không thành công');
        }
    } else {
        res.send('Chữ ký không hợp lệ');
    }
}

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}