const Role = require("../../models/role.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");

const moment = require('moment');

// [GET] /admin/roles/
module.exports.index = async (req, res) => {
    const records = await Role.find({
        deleted: false
    });

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
    
        item.createdAtFormat = moment(item.createdAt).format("DD/MM/YY HH:mm:ss");
      
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

    res.render("admin/pages/roles/index", {
        pageTitle: "Nhóm quyền",
        records: records
    });
}

// [GET] /admin/roles/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/roles/create", {
        pageTitle: "Thêm mới nhóm quyền",
    });
}

// [POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
    if(res.locals.role.permissions.includes("roles_create")){
        req.body.createdBy = res.locals.account.id;
        
        const record = new Role(req.body);
        await record.save();

        res.redirect(`/${systemConfig.prefixAdmin}/roles`);
    }
    else{
        res.send(`403`);
    }
}

// [GET] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const record = await Role.findOne({
            _id: id,
            deleted: false
        });
        res.render("admin/pages/roles/edit", {
            pageTitle: "Chỉnh sửa nhóm quyền",
            record: record
        });
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/roles`);
    }
}

// [PATCH] /admin/roles/edit/:id
module.exports.editPatch = async (req, res) => {
    if(res.locals.role.permissions.includes("roles_edit")){
        try {
            const id = req.params.id;
            const data = req.body;

            data.updatedBy = res.locals.account.id;
    
            await Role.updateOne({
                _id: id,
                deleted: false
            }, data);
    
            req.flash("success", "Cập nhật thành công!");
            res.redirect("back");
        } catch (error) {
            req.flash("error", "Cập nhật thất bại!");
            res.redirect(`/${systemConfig.prefixAdmin}/roles`);
        }
    }
    else{
        res.send(`403`);
    }
}

// [GET] /admin/roles/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const role = await Role.findOne({
            _id: id,
            deleted: false
        });

        res.render("admin/pages/roles/detail", {
            pageTitle: "Chi tiết nhóm quyền",
            role: role
        })
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/roles`);
    }
}

// [PATCH] /admin/roles/delete/:id
module.exports.deletePatch = async (req, res) => {
    try {
        const id = req.params.id;

        await Role.updateOne({
            _id: id
        }, {
            deleted: true,
            deletedBy: res.locals.account.id
        });

        req.flash("success", "Xóa nhóm quyền thành công!");

        res.json({
            code: 200
        });
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/roles`);
    }
}

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
    const records = await Role.find({
        deleted: false
    });

    res.render("admin/pages/roles/permissions", {
        pageTitle: "Phân quyền",
        records: records
    });
}

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
    if(res.locals.role.permissions.includes("roles_permissions")){
        const roles = req.body;
        for(const role of roles){
            await Role.updateOne({
                _id: role.id,
                deleted: false
            }, {
                permissions: role.permissions
            });
        }

        res.json({
            code: 200,
            message: "Cập nhật thành công"
        });  
    }
    else{
        res.send(`403`);
    }
}