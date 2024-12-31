const md5 = require("md5");
const moment = require("moment");
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Review = require("../../models/product-review.model");

const generateHelper = require("../../helpers/generate.helper");
const sendEmailHelper = require("../../helpers/sendEmail.helper");


// [GET] /user/register
module.exports.register = async (req, res) => {
    res.render("client/pages/user/register", {
        pageTitle: "Đăng ký tài khoản",
    });
}

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
    const existUser = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if(existUser){
        req.flash("error", "Email đã tồn tại!");
        res.redirect("back");
        return;
    }

    const userData = {
        fullName: req.body.fullName,
        email: req.body.email,
        password: md5(req.body.password),
        tokenUser: generateHelper.generateRandomString(30)
    };

    const user = new User(userData);
    await user.save();

    res.cookie("tokenUser", user.tokenUser);

    req.flash("success", "Đăng ký tài khoản thành công!");
    
    res.redirect("/");
}

// [GET] /user/login
module.exports.login = async (req, res) => {
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập tài khoản",
    });
}

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if(!user){
        req.flash("error", "Email không tồn tại!");
        res.redirect("back");
        return;
    }

    if(md5(req.body.password) != user.password){
        req.flash("error", "Sai mật khẩu!");
        res.redirect("back");
        return;
    }

    if(user.status != "active"){
        req.flash("error", "Tài khoản đang bị khóa!");
        res.redirect("back");
        return;
    }

    res.cookie("tokenUser", user.tokenUser);

    req.flash("success", "Đăng nhập thành công!");
    res.redirect("/");
}

// [GET] /user/logout
module.exports.logout = async (req, res) => {
    res.clearCookie("tokenUser");
    req.flash("success", "Đăng xuất thành công");
    res.redirect("/user/login");
}

// [GET] /user/profile
module.exports.profile = async (req, res) => {
    res.render("client/pages/user/profile", {
        pageTitle: "Thông tin cá nhân",
    });
}

// [GET] /user/profile/edit
module.exports.editProfile = async (req, res) => {
    res.render("client/pages/user/editProfile", {
        pageTitle: "Sửa thông tin cá nhân",
    });
}

// [PATCH] /user/profile/edit
module.exports.editPatch = async (req, res) => {
    await User.updateOne({
        _id: res.locals.user.id
    }, req.body);

    req.flash("success", "Cập nhật thành công!");

    res.redirect("back");
}

// [GET] /user/profile/changePassword
module.exports.changePassword = async (req, res) => {
    res.render("client/pages/user/change-password", {
        pageTitle: "Đổi mật khẩu"
    });
}

// [PATCH] /user/profile/changePassword
module.exports.changePassPatch = async (req, res) => {
    const password = req.body.password;
    const tokenUser = req.cookies.tokenUser;

    await User.updateOne({
        tokenUser: tokenUser,
    }, {
        password: md5(password)
    });

    req.flash("success", "Đổi mật khẩu thành công!");

    res.redirect("/user/profile");
}

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
    res.render("client/pages/user/forgot-password", {
        pageTitle: "Lấy lại mật khẩu",
    });
}

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if(!user){
        req.flash("error", "Email không tồn tại trong hệ thống!");
        res.redirect("back");
        return;
    }

    const otp = generateHelper.generateRandomNumber(6);

    // Việc 1: Lưu email, OTP vào database
    const forgotPasswordData = {
        email: email,
        otp: otp,
        expireAt: Date.now() + 3 * 60 * 1000
    };

    const forgotPassword = new ForgotPassword(forgotPasswordData);
    await forgotPassword.save();

    // Việc 2: Gửi mã OTP qua email của user
    const subject = "Mã OTP lấy lại mật khẩu.";
    const htmlSendMail = `Mã OTP xác thực của bạn là <b style= "color: green;">${otp}</b>. Mã OTP có hiệu lực trong 3 phút. Vui lòng không cung cấp mã OTP cho người khác.`
    sendEmailHelper.sendEmail(email, subject, htmlSendMail);

    res.redirect(`/user/password/otp?email=${email}`);
}

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.query.email;

    res.render("client/pages/user/otp-password", {
        pageTitle: "Xác thực OTP",
        email: email
    });
}

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    });

    if(!result){
        req.flash("error", "OTP không hợp lệ!");
        res.redirect("back");
        return;
    }

    const user = await User.findOne({
        email: email
    });

    res.cookie("tokenUser", user.tokenUser);

    res.redirect("/user/password/reset");
}


// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
    res.render("client/pages/user/reset-password", {
        pageTitle: "Đổi mật khẩu mới",
    });
}

// [PATCH] /user/password/reset
module.exports.resetPasswordPatch = async (req, res) => {
    const password = req.body.password;
    const tokenUser = req.cookies.tokenUser;

    await User.updateOne({
        tokenUser: tokenUser,
        deleted: false
    }, {
        password: md5(password)
    });

    req.flash("success", "Đổi mật khẩu thành công!");

    res.redirect("/");
}

// [GET] /user/dashboard
module.exports.dashboard = async (req, res) => {
    const user = res.locals.user;

    const userId = user.id;

    const TotalOrder = await Order.countDocuments({
        userId: userId,
        deleted: false
    });

    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)); 
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)); 

    const TotalTodayOrder = await Order.countDocuments({
        userId: userId,
        deleted: false,
        createdAt: {
            $gte: startOfDay, 
            $lte: endOfDay    
        }
    });

    const orders = await Order.find({
        userId: userId,
        is_payment: true,
        deleted: false
    });
    
    const TotalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    const ordersToday = await Order.find({
        userId: userId,
        deleted: false,
        is_payment: true,
        createdAt: {
            $gte: startOfDay, 
            $lte: endOfDay    
        }
    });

    const TotalTodayAmount = ordersToday.reduce((acc, order) => acc + order.totalPrice, 0);

    const TotalPending = await Order.countDocuments({
        userId: userId,
        deleted: false,
        status: "Đang xử lý"
    });

    const TotalInProgress = await Order.countDocuments({
        userId: userId,
        deleted: false,
        status: "Đang giao hàng"
    });

    const TotalCompleted = await Order.countDocuments({
        userId: userId,
        deleted: false,
        status: "Giao thành công"
    });

    const TotalCanceled = await Order.countDocuments({
        userId: userId,
        deleted: false,
        status: "Hoãn"
    });

    const userOrder = {
        TotalOrder: TotalOrder,
        TotalTodayOrder: TotalTodayOrder,
        TotalAmount: TotalAmount,
        TotalTodayAmount: TotalTodayAmount,
        TotalPending: TotalPending,
        TotalInProgress: TotalInProgress,
        TotalCompleted: TotalCompleted,
        TotalCanceled: TotalCanceled
    };

    res.render("client/pages/user/dashboard", {
        pageTitle: "Tổng Quan",
        myOrders: userOrder
    });
}

module.exports.orders = async (req, res) => {
    const user = res.locals.user;

    const orders = await Order.find({
        userId: user.id
    });

    for(const order of orders){
        order.createdAtFormat = moment(order.createdAt).format("DD/MM/YYYY");
    }

    res.render("client/pages/user/orders-dashboard", {
        pageTitle: "Đơn hàng",
        orders: orders
    })
}

module.exports.ordersDetail = async (req, res) => {
    const id = req.params.id;
    
    const order = await Order.findOne({
        _id: id,
        deleted: false
    });

    order.createdAtFormat = moment(order.createdAt).format("DD/MM/YYYY");

    const products = order.products;
    
    for(const item of products){
        const productInfo = await Product.findOne({
            _id: item.productId,
            deleted: false,
            status: "active"
        });

        item.image = productInfo.thumbnail[0];
        item.slug = productInfo.slug;
        item.title = productInfo.title;
        item.priceNew = (1 - productInfo.discountPercentage / 100) * productInfo.price;
        item.totalPrice = parseInt(item.priceNew * item.quantity);


        const reviewInfo = await Review.findOne({
            userId: res.locals.user.id,
            orderId: order.id,
            productId: item.productId
        });

        if(reviewInfo){
            item.rating = reviewInfo.rating,
            item.review = reviewInfo.review;
        }
    }
    
    res.render("client/pages/user/orders-detail", {
        pageTitle: "Chi tiết đơn hàng",
        order: order,
        products: products
    })
}

module.exports.makeReview = async (req, res) => {
    const productId = req.body.productId;
    const orderId = req.body.orderId;

    const existReview = await Review.findOne({
        userId: res.locals.user.id,
        orderId: orderId,
        productId: productId
    });

    if(existReview){
        await Review.updateOne({
            userId: res.locals.user.id,
            orderId: orderId,
            productId: productId
        }, {
            rating: parseInt(req.body.rating),
            review: req.body.review
        });
    }
    else{
        const reviewInfo = {
            userId: res.locals.user.id,
            productId: productId,
            orderId: orderId,
            rating: parseInt(req.body.rating),
            review: req.body.review
        };
    
        const review = new Review(reviewInfo);
        await review.save();
    }
    
    req.flash("success", "Cảm ơn bạn đã đánh giá!!");

    res.redirect("back");
}