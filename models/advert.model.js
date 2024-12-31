const mongoose = require("mongoose");

const advertSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  status: String,
  deleted: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

const Advert = mongoose.model("Advert", advertSchema, "adverts");

module.exports = Advert;