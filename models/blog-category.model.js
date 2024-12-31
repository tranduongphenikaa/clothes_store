const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const blogCategorySchema = new mongoose.Schema({
    title: String,
    description: String,
    thumbnail: String,
    status: String,
    position: Number,
    createdBy: String,
    updatedBy: String,
    deleted: {
      type: Boolean,
      default: false
    },
    deletedBy: String,
    slug: {
      type: String,
      slug: "title",
      unique: true
    }
  }, {
    timestamps: true
  });
  
  const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema, "blogs-category");
  
  module.exports = BlogCategory;