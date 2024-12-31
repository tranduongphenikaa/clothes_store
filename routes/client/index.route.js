const homeRoute = require("./home.route");
const productRoute = require("./product.route");
const userRoute = require("./user.route");
const cartRoute = require("./cart.route");
const checkoutRoute = require("./checkout.route");
const productwishlistRoute = require("./product-wishlist.route");
const searchRoute = require("./search.route");
const blogRoute = require("./blog.route");

const userMiddleware = require("../../middlewares/client/user.middleware");
const categoryMiddleware = require("../../middlewares/client/category.middleware");
const cartMiddleware = require("../../middlewares/client/cart.middleware");
const wishlistMiddleware = require("../../middlewares/client/wishlist.middleware");
const settingMiddleware = require("../../middlewares/client/setting.middleware");

module.exports.index = (app) => {
    app.use(categoryMiddleware.category);
    app.use(cartMiddleware.cartId);
    app.use(userMiddleware.infoUser);
    app.use(settingMiddleware.setting);
    app.use(wishlistMiddleware);
    
    app.use("/", homeRoute);
    
    app.use("/products", productRoute);

    app.use("/blogs", blogRoute); 

    app.use("/user", userRoute);

    app.use("/search", searchRoute);  

    app.use("/cart", cartRoute);

    app.use("/checkout", userMiddleware.requireAuth, checkoutRoute);

    app.use("/wishlist", userMiddleware.requireAuth , productwishlistRoute);
}