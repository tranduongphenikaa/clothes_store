const Blog = require("../../models/blog.model");
const BlogCategory = require("../../models/blog-category.model");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");
const moment = require('moment');
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /admin/blogs/
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    };

    // Phân trang
    const pagination = await paginationHelper.blog(req, find);
    // Hết Phân trang

    const records = await Blog
      .find(find)
      .limit(pagination.limitItems)
      .skip(pagination.skip);

    for(const item of records){
        // Người tạo
        if(item.createdBy){
          const accountCreated = await Account.findOne({
            _id: item.createdBy
          });
          item.createdByFullName = accountCreated.fullName;
        }
        else{
          item.createdByFullName = "";
        }
    
        item.createdAtFormat = moment(item.createdAt).format("DD/MM/YY HH:mm:ss")
    
        // Người cập nhật
        if(item.updatedBy) {
          const accountUpdated = await Account.findOne({
            _id: item.updatedBy
          });
          item.updatedByFullName = accountUpdated.fullName;
        } else {
          item.updatedByFullName = "";
        }
    
        item.updatedAtFormat = moment(item.updatedAt).format("DD/MM/YY HH:mm:ss");
      }

    res.render("admin/pages/blogs/index", {
        pageTitle: "Trang bài viết",
        records: records,
        pagination: pagination
    });
}

// [GET] /admin/blogs/create
module.exports.create = async (req, res) => {
    const blogCategory = await BlogCategory.find({
        deleted: false
    });

    res.render("admin/pages/blogs/create", {
        pageTitle: "Thêm mới bài viết",
        categories: blogCategory
    });
}

// [POST] /admin/blogs/create
module.exports.createPost = async (req, res) => {
    if(res.locals.role.permissions.includes("blogs_create")) {
        if(req.body.position) {
            req.body.position = parseInt(req.body.position);
        } else {
            const countBlog = await Blog.countDocuments({});
            req.body.position = countBlog + 1;
        }
      
        req.body.createdBy = res.locals.account.id;
        
        const newBlog = new Blog(req.body);
        await newBlog.save();
    
        req.flash("success", "Tạo mới bài viết thành công!");
    
        res.redirect(`/${systemConfig.prefixAdmin}/blogs`);
    }
}

// [GET] /admin/blogs/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const blog = await Blog.findOne({
            _id: id,
            deleted: false
        });


        const blogCategory = await BlogCategory.find({
            deleted: false
        });

        res.render("admin/pages/blogs/edit", {
            pageTitle: "Chỉnh sửa bài viết",
            blog: blog,
            categories: blogCategory
        });
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/blogs`);
    }
}

// [PATCH] /admin/blogs/edit/:id
module.exports.editPatch = async (req, res) => {
    if(res.locals.role.permissions.includes("blogs_edit")) {
        const id = req.params.id;

        req.body.updatedBy = res.locals.account.id;
    
        await Blog.updateOne({
            _id: id
        }, req.body);
    
        req.flash("success", "Cập nhật thành công!");
    
        res.redirect(`/${systemConfig.prefixAdmin}/blogs`);
    }
}

// [PATCH] /admin/blogs/change-status/:statusChange/:id
module.exports.changeStatus = async (req, res) => {
    if(res.locals.role.permissions.includes("blogs_edit")) {
        const {statusChange, id} = req.params;

        await Blog.updateOne({
            _id: id
        }, {
            status: statusChange,
            updatedBy: res.locals.account.id
        })
    
        req.flash("success", "Cập nhật trạng thái thành công!");
    
        res.json({
            code: 200
        });
    }
}

// [PATCH] /admin/blogs/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        const blog = await Blog.findOne({
            _id: id,
            deleted: false
        });

        const category = await BlogCategory.findOne({
            _id: blog.blog_category_id,
            deleted: false
        })

        if(category){
            blog.category = category.title;
        }

        res.render("admin/pages/blogs/detail", {
            pageTitle: "Chi tiết bài viết",
            blog: blog
        });
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/blogs`);
    }
}

// [PATCH] /admin/blogs/delete/:id
module.exports.delete = async (req, res) => {
    if(res.locals.role.permissions.includes("blogs_delete")) {
        try {
            const id = req.params.id;
    
            await Blog.updateOne({
                _id: id
            }, {
                deleted: true,
                deletedBy: res.locals.account.id
            });
    
            req.flash("success", "Xóa thành công!");
    
            res.json({
                code: 200
            });
    
        } catch (error) {
            res.redirect(`/${systemConfig.prefixAdmin}/blogs`);
        }
    }
}



