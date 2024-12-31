const Blog = require("../../models/blog.model");
const BlogCategory = require("../../models/blog-category.model");
const BlogComment = require("../../models/blog-comment.model");
const User = require("../../models/user.model");
const moment = require("moment");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /blogs/
module.exports.index = async(req, res) => {
    const find = {
        status: "active",
        deleted: false
    };

    let allBlogs = await Blog.find(find).sort({ position: "desc" });

    // Danh mục
    const categories = await BlogCategory.find({
        status: "active",
        deleted: false,
    }).select("slug title");

    let filterCategory = "";

    if(req.query.category){
        const categoryFilter = req.query.category;

        const category = await BlogCategory.findOne({
            status: "active",
            deleted: false,
            slug: categoryFilter
        });

        filterCategory = category.title;

        allBlogs = allBlogs.filter(blog => {
            return [
                category.id
            ].includes(blog.blog_category_id);
        });
    }
    // Hêt Danh mục

    const pagination = await paginationHelper.blogClient(req, allBlogs);

    const paginatedBlogs = allBlogs.slice(pagination.skip, pagination.skip + pagination.limitItems);

    res.render("client/pages/blogs/index", {
        pageTitle: "Danh sách bài viết",
        blogs: paginatedBlogs,
        categories: categories,
        filterCategory: filterCategory,
        pagination: pagination
    });
}

// [GET] /blogs/:slugCategory
module.exports.category = async(req, res) => {
    const slugCategory = req.params.slugCategory;

    const category = await BlogCategory.findOne({
        slug: slugCategory,
        status: "active",
        deleted: false
    });

    const blogs = await Blog.find({
        blog_category_id: category.id,
        status: "active", 
        deleted: false
    }).sort({ position: "desc" });

    const pagination = await paginationHelper.blogClient(req, blogs);

    const paginatedBlogs = blogs.slice(pagination.skip, pagination.skip + pagination.limitItems);

    res.render("client/pages/blogs/index", {
        pageTitle: category.title,
        blogs: paginatedBlogs,
        slug: slugCategory,
        category: category,
        pagination: pagination
    });
}

// [GET] /blogs/detail/:slug
module.exports.detail = async (req, res) => {
    const slug = req.params.slug;

    const blog = await Blog.findOne({
       slug: slug,
       deleted: false,
       status: "active" 
    });

    if(blog){
        const category = await BlogCategory.findOne({
            _id: blog.blog_category_id
        }).select("title slug");

        if(category){
            blog.category = category
        }

        blog.createdAtFormat = moment(blog.createdAt).format("DD/MM/YYYY");

        const similarBlogs = await Blog.find({
            _id: {$ne: blog.id},
            blog_category_id: blog.blog_category_id,
            status: "active",
            deleted: false
        }).select("-description");

        for(const item of similarBlogs){
            const category = await BlogCategory.findOne({
                _id: item.blog_category_id
            }).select("title slug");

            if(category){
                item.category = category;
            }

            item.createdAtFormat = moment(item.createdAt).format("DD/MM/YYYY");

            const comments = await BlogComment.find({
                blogId: item.id
            }).select("blogId");
            item.comments = comments.length;
        }

        const comments = await BlogComment.find({
            blogId: blog.id
        });

        for(const item of comments){
            const userInfo = await User.findOne({
                _id: item.userId,
                status: "active",
                deleted: false
            }).select("fullName avatar");

            item.userInfo = userInfo;
            item.createdAtFormat = moment(item.createdAt).format("DD/MM/YYYY");
        }

        const allCategory = await BlogCategory.find({
            status: "active",
            deleted: false
        }).select("title slug");

        const recentBlogs = await Blog.find({
            status: "active",
            deleted: false
        }).sort({ position : "desc" }).limit(5).select("title slug thumbnail");

        for(const item of recentBlogs){
            item.createdAtFormat = moment(item.createdAt).format("DD/MM/YYYY");
        }

        res.render("client/pages/blogs/detail", {
            pageTitle: "Chi tiết bài viết",
            blog: blog,
            similarBlogs: similarBlogs,
            comments: comments,
            allCategory: allCategory,
            recentBlogs: recentBlogs
        });
    }
    else{
        res.redirect("/");
    }
}

// [POST] /blogs/comment
module.exports.comment = async (req, res) => {
    const commentData = {
        userId: res.locals.user.id,
        blogId: req.body.blogId,
        comment: req.body.message
    };

    const comment = new BlogComment(commentData);
    await comment.save();

    req.flash("success", "Cảm ơn bình luận của bạn!!!")
    res.redirect("back");
}