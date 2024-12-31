const ProductWishlist = require("../../models/product-wishlist.model");

module.exports = async (req, res, next) => {
    if(res.locals.user){
        const userId = res.locals.user.id;

        const wishlist = await ProductWishlist.findOne({
            userId: userId
        });

        if(!wishlist){
            const data = {
                userId: userId,
                products: []
            }
            const productWishlist = new ProductWishlist(data);
            await productWishlist.save();

            res.locals.wishlistTotal = productWishlist.products.length || 0;
        }
        else{
            res.locals.wishlistTotal = wishlist.products.length || 0;
        }
    }
    next();
}