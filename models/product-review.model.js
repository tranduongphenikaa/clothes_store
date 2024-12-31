const mongoose = require("mongoose");

const productReviewSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  orderId: String,
  rating: {
    type: Number,
    min: 1, max: 5
  },
  review: String
}, {
  timestamps: true
});

const ProductReview = mongoose.model("ProductReview", productReviewSchema, "products-review");

module.exports = ProductReview;