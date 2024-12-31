const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Discount = require("../../models/discount.model");

// [GET] /cart
module.exports.index = async (req, res) => {
    const cartId = req.cookies.cartId;

    const cart = await Cart.findOne({ _id: cartId });

    cart.totalPrice = 0;

    if (cart.products.length > 0) {
        for (const product of cart.products) {
            const productInfo = await Product.findOne({
                _id: product.productId
            }).select("title thumbnail slug price discountPercentage");
            
            productInfo.priceNew = (1 - productInfo.discountPercentage / 100) * productInfo.price;
            product.totalPrice = 0;

            for (const size of product.size) {
                size.totalPrice = productInfo.priceNew * size.quantity;
                product.totalPrice += size.totalPrice;
            }

            cart.totalPrice += product.totalPrice;

            product.productInfo = productInfo;
        }
    }

    cart.totalPrice = parseFloat(cart.totalPrice.toFixed(2));

    res.render("client/pages/cart/index", {
        pageTitle: "Giỏ hàng",
        cartDetail: cart
    });
};


// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity);

    const sizeName = req.body.size; 

    const cart = await Cart.findOne({ _id: cartId });

    const existProductInCart = cart.products.find(
        item => item.productId == productId
    );

    if (existProductInCart) {
        const existSizeInProduct = existProductInCart.size.find(
            s => s.name == sizeName
        );

        if (existSizeInProduct) {
            await Cart.updateOne({
                _id: cartId,
                'products.productId': productId,
                'products.size.name': sizeName
            }, {
                $set: {
                    'products.$[p].size.$[s].quantity': quantity + existSizeInProduct.quantity
                }
            }, {
                arrayFilters: [
                    { 'p.productId': productId },
                    { 's.name': sizeName }
                ]
            });
        } else {
            await Cart.updateOne({
                _id: cartId,
                'products.productId': productId
            }, {
                $push: {
                    'products.$.size': {
                        name: sizeName,
                        quantity: quantity
                    }
                }
            });
        }
    } else {
        await Cart.updateOne({
            _id: cartId
        }, {
            $push: {
                products: {
                    productId: productId,
                    size: [{
                        name: sizeName,
                        quantity: quantity
                    }]
                }
            }
        });
    }

    req.flash("success", "Thêm vào giỏ hàng thành công!");
    res.redirect("back");
};


// [POST] /cart/addIcon/:productId
module.exports.addIconPost = async (req, res) => {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    const quantity = 1;
    const sizeName = "m"; 
    const cart = await Cart.findOne({ _id: cartId });

    const existProductInCart = cart.products.find(
        item => item.productId == productId
    );

    if (existProductInCart) {
        const existSizeInProduct = existProductInCart.size.find(
            s => s.name == sizeName
        );

        if (existSizeInProduct) {
            await Cart.updateOne({
                _id: cartId,
                'products.productId': productId,
                'products.size.name': sizeName
            }, {
                $set: {
                    'products.$[p].size.$[s].quantity': quantity + existSizeInProduct.quantity
                }
            }, {
                arrayFilters: [
                    { 'p.productId': productId },
                    { 's.name': sizeName }
                ]
            });
        } else {
            await Cart.updateOne({
                _id: cartId,
                'products.productId': productId
            }, {
                $push: {
                    'products.$.size': {
                        name: sizeName,
                        quantity: quantity
                    }
                }
            });
        }
    } else {
        await Cart.updateOne({
            _id: cartId
        }, {
            $push: {
                products: {
                    productId: productId,
                    size: [{
                        name: sizeName,
                        quantity: quantity
                    }]
                }
            }
        });
    }

    req.flash("success", "Thêm vào giỏ hàng thành công!");

    res.json({
        code: 200
    });
};


// [GET] /cart/delete/:productId
module.exports.delete = async (req, res) => {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    
    await Cart.updateOne({
        _id: cartId
    }, {
        $pull: {
            products: {
                productId: productId
            }
        }
    });

    res.redirect("back");
}

// [GET] /cart/update/:productId/:quantity/:sizeName
module.exports.update = async (req, res) => {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    const sizeName = req.params.sizeName;
    const quantity = parseInt(req.params.quantity);

    await Cart.updateOne({
        _id: cartId,
        'products.productId': productId,
        'products.size.name': sizeName
    }, {
        $set: {
            'products.$[p].size.$[s].quantity': quantity
        }
    }, {
        arrayFilters: [
            { 'p.productId': productId },
            { 's.name': sizeName }
        ]
    });

    res.redirect("back");
};

// [GET] /cart/update/:productId/size/:sizeName/:sizeChange
module.exports.updateSize = async (req, res) => {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    const sizeName = req.params.sizeName;
    const sizeChange = req.params.sizeChange;

    await Cart.updateOne({
        _id: cartId,
        'products.productId': productId,
        'products.size.name': sizeName
    }, {
        $set : {
            'products.$[p].size.$[s].name': sizeChange
        }
    }, {
        arrayFilters: [
            { 'p.productId': productId },
            { 's.name': sizeName }
        ]
    })

    res.redirect("back");
}

// [POST] /cart/apply-discount
module.exports.applyDiscount = async (req, res) => {
    const discountCode = req.body.discountCode;

    const discount = await Discount.findOne({
        name: discountCode,
        deleted: false,
        status: "active"
    });

    if(!discount){
        return res.json({
            errorDiscount: "Không đúng mã giảm giá!!!"
        })
    }

    const cartId = req.cookies.cartId;

    const cart = await Cart.findOne({ _id: cartId });

    cart.totalPrice = 0;

    if (cart.products.length > 0) {
        for (const product of cart.products) {
            const productInfo = await Product.findOne({
                _id: product.productId
            }).select("title thumbnail slug price discountPercentage");
            
            productInfo.priceNew = (1 - productInfo.discountPercentage / 100) * productInfo.price;
            product.totalPrice = 0;

            for (const size of product.size) {
                size.totalPrice = productInfo.priceNew * size.quantity;
                product.totalPrice += size.totalPrice;
            }

            cart.totalPrice += product.totalPrice;

            product.productInfo = productInfo;
        }
    }

    discount.amountDiscount = cart.totalPrice * (discount.amount / 100);
    cart.totalPrice -= discount.amountDiscount;

    res.json({
        discount: {
            amountDiscount: discount.amountDiscount
        },
        cart: {
            totalPrice: cart.totalPrice
        }
    });
}