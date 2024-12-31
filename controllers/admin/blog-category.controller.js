const BlogCategory = require("../../models/blog-category.model");
const Account = require("../../models/account.model");

const systemConfig = require("../../config/system");
const moment = require('moment');
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /admin/blogs-category/
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    };

    // Phân trang
    const pagination = await paginationHelper.blogCategory(req, find);
    // Hết Phân trang

    const records = await BlogCategory
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

    res.render("admin/pages/blogs-category/index", {
        pageTitle: "Danh mục bài viết",
        records: records,
        pagination: pagination
    });
}

// [GET] /admin/blogs-category/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/blogs-category/create", {
        pageTitle: "Thêm mới danh mục bài viết"
    });
}

// [POST] /admin/blogs-category/create
module.exports.createPost = async (req, res) => {
    if(res.locals.role.permissions.includes("blogs-category_create")) {
        if(req.body.position) {
            req.body.position = parseInt(req.body.position);
        } else {
            const countBlogCategory = await BlogCategory.countDocuments({});
            req.body.position = countBlogCategory + 1;
        }
      
        req.body.createdBy = res.locals.account.id;
        
        const newBlogCategory = new BlogCategory(req.body);
        await newBlogCategory.save();
    
        req.flash("success", "Tạo mới danh mục thành công!");
    
        res.redirect(`/${systemConfig.prefixAdmin}/blogs-category`);       
    }
}

// [GET] /admin/blogs-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const category = await BlogCategory.findOne({
            _id: id,
            deleted: false
        });

        res.render("admin/pages/blogs-category/edit", {
            pageTitle: "Chỉnh sửa danh mục bài viết",
            category: category
        });
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/blogs-category`);
    }
}

// [PATCH] /admin/blogs-category/edit/:id
module.exports.editPatch = async (req, res) => {
    if(res.locals.role.permissions.includes("blogs-category_edit")) {
        const id = req.params.id;

        req.body.updatedBy = res.locals.account.id;
    
        await BlogCategory.updateOne({
            _id: id
        }, req.body);
    
        req.flash("success", "Cập nhật thành công!");
    
        res.redirect(`/${systemConfig.prefixAdmin}/blogs-category`);
    }
}

// [PATCH] /admin/blogs-category/change-status/:statusChange/:id
module.exports.changeStatus = async (req, res) => {
    if(res.locals.role.permissions.includes("blogs-category_edit")) {
        const {statusChange, id} = req.params;

        await BlogCategory.updateOne({
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

// [PATCH] /admin/blogs-category/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        
        const category = await BlogCategory.findOne({
            _id: id
        });

        res.render("admin/pages/blogs-category/detail", {
            pageTitle: "Chi tiết danh mục bài viết",
            category: category
        });
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/blogs-category`);
    }
}

// [PATCH] /admin/blogs-category/delete/:id
module.exports.delete = async (req, res) => {
    if(res.locals.role.permissions.includes("blogs-category_delete")) {
        try {
            const id = req.params.id;
    
            await BlogCategory.updateOne({
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
            res.redirect(`/${systemConfig.prefixAdmin}/blogs-category`);
        }
    }
}
