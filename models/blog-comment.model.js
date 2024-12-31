const mongoose = require("mongoose");

const blogCommentSchema = new mongoose.Schema({
  userId: String,
  blogId: String,
  comment: String
}, {
  timestamps: true
});

const BlogComment = mongoose.model("BlogComment", blogCommentSchema, "blog-comment");

module.exports = BlogComment;