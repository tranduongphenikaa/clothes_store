const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const blogSchema = new mongoose.Schema({
    title: String,
    blog_category_id: String,
    description: String,
    status: String,
    thumbnail: String,
    position: Number,
    createdBy: String,
    updatedBy: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedBy: String,
    slug:{
        type: String,
        slug: "title",
        unique: true
    }
}, {
    timestamps: true
});

const Blog = mongoose.model("Blog", blogSchema, "blogs");

module.exports = Blog;