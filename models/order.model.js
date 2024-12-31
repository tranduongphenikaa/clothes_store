const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: String,
    userInfo: {
        fullName: String,
        phone: String,
        address: String
    },
    products: [
        {
            productId: String,
            price: Number,
            discountPercentage: Number,
            quantity: Number
        }
    ],
    status: String,
    payment_method: String,
    totalPrice: Number,
    is_payment: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
  timestamps: true
});

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;