const Role = require("../../models/role.model");
const Account = require("../../models/account.model");
const md5 = require('md5');

const generateHelper = require("../../helpers/generate.helper");
const systemConfig = require("../../config/system");

// [GET] /admin/accounts
module.exports.index = async(req, res) => {
    const records = await Account.find({
        deleted: false
    });

    for(const record of records){
        const role = await Role.findOne({
            _id: record.role_id,
            deleted: false
        });
        record.roleTitle = role.title;
    }
    
    res.render("admin/pages/accounts/index", {
        pageTitle: "Tài khoản admin",
        records: records
    });
}

// [GET] /admin/accounts/create
module.exports.create = async(req, res) => {
    const roles = await Role.find({
        deleted: false
    }).select("title");

    res.render("admin/pages/accounts/create", {
        pageTitle: "Tạo tài khoản admin",
        roles: roles
    });
}

// [POST] /admin/accounts/create
module.exports.createPost = async(req, res) => {
    if(res.locals.role.permissions.includes("accounts_create")){
        req.body.password = md5(req.body.password);

        req.body.token = generateHelper.generateRandomString(30);
        
        const account = new Account(req.body);
        await account.save();

        req.flash("success", "Tạo tài khoản thành công!");

        res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
    }
    else{
        res.send(`403`);
    }
}

// [GET] /admin/accounts/edit/:id
module.exports.edit = async(req, res) => {
    try {
        const id = req.params.id;

        const account = await Account.findOne({
            _id: id,
            deleted: false
        });

        const roles = await Role.find({
            deleted: false
        }).select("title");
        
        res.render("admin/pages/accounts/edit", {
            pageTitle: "Chỉnh sửa tài khoản admin",
            roles: roles,
            account: account
    });
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
    }
}

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async(req, res) => {
    if(res.locals.role.permissions.includes("accounts_edit")){
        try {
            const id = req.params.id;
    
            if(req.body.password == ""){
                delete req.body.password;
            }
            else{
                req.body.password = md5(req.body.password);    
            }
    
            await Account.updateOne({
                _id: id,
                deleted: false
            }, req.body);
    
            req.flash("success", "Cập nhật thành công!");
        } catch (error) {
            req.flash("error", "ID không hợp lệ!");
        }
        
        res.redirect("back");
    }
    else{
        res.send(`403`);
    }
}

// [GET] /admin/accounts/detail/:id
module.exports.detail = async(req, res) => {
    try {
        const id = req.params.id;
    
        const account = await Account.findOne({
            _id: id,
            deleted: false
        });
        
        const role = await Role.findOne({
            _id: account.role_id
        });

        let roleAccount = "";
        if(role){
            roleAccount = role.title;
        }

        res.render("admin/pages/accounts/detail", {
            pageTitle: "Chi tiết tài khoản",
            account: account,
            roleAccount: roleAccount
        })
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
    }
}

// [PATCH] /admin/accounts/delete/:id
module.exports.deletePatch = async(req, res) => {
    if(res.locals.role.permissions.includes("accounts_delete")){
        try {
            const id = req.params.id;
        
            await Account.updateOne({
                _id: id
            }, {
                deleted: true
            });
    
            req.flash("success", "Xóa tài khoản thành công!");
    
            res.json({
                code: 200
            });
        } catch (error) {
            res.redirect(`/${systemConfig.prefixAdmin}/accounts`);
        }
    }
    else{
        res.send(`403`);
    }
}

// [PATCH] /admin/accounts/change-status/:statusChange/:id
module.exports.changeStatus = async(req, res) => {
    if(res.locals.role.permissions.includes("accounts_edit")){
        const {id, statusChange} = req.params;

        await Account.updateOne({
            _id: id
        }, {
            status: statusChange
        });

        req.flash("success", "Cập nhật trạng thái thành công!");

        res.json({
            code: 200
        });
    }
    else{
        res.send(`403`);
    }
}