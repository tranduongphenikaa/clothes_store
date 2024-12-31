const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  expire_date: Date,
  status: String,
  deleted: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

const Discount = mongoose.model("Discount", discountSchema, "discounts");

module.exports = Discount;