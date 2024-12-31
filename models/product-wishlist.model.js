const mongoose = require("mongoose");

const productWishlistSchema = new mongoose.Schema({
  userId: String,
  products: [
    {
      productId: String
    }
  ]
}, {
  timestamps: true
});

const ProductWishlist = mongoose.model("ProductWishlist", productWishlistSchema, "products-wishlist");

module.exports = ProductWishlist;