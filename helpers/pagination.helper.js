const Product = require("../models/product.model");
const ProductCategory = require("../models/product-category.model");
const Blog = require("../models/blog.model.js");
const BlogCategory = require("../models/blog-category.model.js");
const Order = require("../models/order.model.js");
const User = require("../models/user.model.js");
const ProductWishlist = require("../models/product-wishlist.model.js");

module.exports.product = async (req, find) => {
    const pagination = {
        currentPage: 1,
        limitItems: 5
    };

    if(req.query.page){
        pagination.currentPage = parseInt(req.query.page);
    }

    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    const countProducts = await Product.countDocuments(find);
    const totalPage = Math.ceil(countProducts / pagination.limitItems);
    pagination.totalPage = totalPage;

    return pagination;
}

module.exports.productClient = async (req, products) => {
    const pagination = {
        currentPage: 1,
        limitItems: 9
    };

    if(req.query.page){
        pagination.currentPage = parseInt(req.query.page);
    }

    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    const totalItems = products.length;
    const totalPage = Math.ceil(totalItems / pagination.limitItems);
    pagination.totalPage = totalPage;

    return pagination;
};

module.exports.productCategory = async (req, find) => {
    const pagination = {
        currentPage: 1,
        limitItems: 5
    };

    if(req.query.page){
        pagination.currentPage = parseInt(req.query.page);
    }

    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    const countProductCategory = await ProductCategory.countDocuments(find);
    const totalPage = Math.ceil(countProductCategory / pagination.limitItems);
    pagination.totalPage = totalPage;

    return pagination;
}

module.exports.productWishlist = async (req, products) => {
    const pagination = {
        currentPage: 1,
        limitItems: 10
    };

    if(req.query.page){
        pagination.currentPage = parseInt(req.query.page);
    }

    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    const totalItems = products.length;
    const totalPage = Math.ceil(totalItems / pagination.limitItems);
    pagination.totalPage = totalPage;

    return pagination;
}

module.exports.blog = async (req, find) => {
    const pagination = {
        currentPage: 1,
        limitItems: 8
    };

    if(req.query.page){
        pagination.currentPage = parseInt(req.query.page);
    }

    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    const countBlogs = await Blog.countDocuments(find);
    const totalPage = Math.ceil(countBlogs / pagination.limitItems);
    pagination.totalPage = totalPage;

    return pagination;
}

module.exports.blogClient = async (req, blogs) => {
    const pagination = {
        currentPage: 1,
        limitItems: 9
    };

    if(req.query.page){
        pagination.currentPage = parseInt(req.query.page);
    }

    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    const totalItems = blogs.length;
    const totalPage = Math.ceil(totalItems / pagination.limitItems);
    pagination.totalPage = totalPage;

    return pagination;
};

module.exports.blogCategory = async (req, find) => {
    const pagination = {
        currentPage: 1,
        limitItems: 5
    };

    if(req.query.page){
        pagination.currentPage = parseInt(req.query.page);
    }

    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    const countBlogsCategory = await BlogCategory.countDocuments(find);
    const totalPage = Math.ceil(countBlogsCategory / pagination.limitItems);
    pagination.totalPage = totalPage;

    return pagination;
}

module.exports.order = async (req, find) => {
    const pagination = {
        currentPage: 1,
        limitItems: 8
    };

    if(req.query.page){
        pagination.currentPage = parseInt(req.query.page);
    }

    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    const countOrders = await Order.countDocuments(find);
    const totalPage = Math.ceil(countOrders / pagination.limitItems);
    pagination.totalPage = totalPage;

    return pagination;
}

module.exports.user = async (req, find) => {
    const pagination = {
        currentPage: 1,
        limitItems: 8
    };

    if(req.query.page){
        pagination.currentPage = parseInt(req.query.page);
    }

    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    const countUsers = await User.countDocuments(find);
    const totalPage = Math.ceil(countUsers / pagination.limitItems);
    pagination.totalPage = totalPage;

    return pagination;
}