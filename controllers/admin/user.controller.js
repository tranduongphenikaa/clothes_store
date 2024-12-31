const User = require("../../models/user.model");

const moment = require("moment");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /admin/users
module.exports.index = async(req, res) => {
    const find = {
        deleted: false
    };

    // Phân trang
    const pagination = await paginationHelper.user(req, find);
    // Hết Phân trang

    const records = await User.find(find).limit(pagination.limitItems).skip(pagination.skip);

    for(const item of records){
        item.createdAtFormat = moment(item.createdAt).format("DD/MM/YY HH:mm:ss")
    }
    
    res.render("admin/pages/users/index", {
        pageTitle: "Quản lý người dùng",
        records: records,
        pagination: pagination
    });
}

// [PATCH] /admin/users/change-status/:statusChange/:id
module.exports.changeStatus = async(req, res) => {
    if(res.locals.role.permissions.includes("users_edit")){
        const {id, statusChange} = req.params;
    
        await User.updateOne({
            _id: id
        }, {
            status: statusChange
        })
    
        req.flash("success", "Cập nhật trạng thái thành công!");
    
        res.json({
            code: 200
        })
    }
}

// [PATCH] /admin/users/delete/:id
module.exports.delete = async(req, res) => {
    if(res.locals.role.permissions.includes("users_delete")) {
        const id = req.params.id;

        await User.updateOne({
            _id: id
        }, {
            deleted: true
        })
        
        req.flash("success", "Xóa thành công!");

        res.json({
            code: 200
        })
    }
    
}

// [GET] /admin/users/detail/:id
module.exports.detail = async(req, res) => {
    const id = req.params.id;

    const user = await User.findOne({
        _id: id
    })

    res.render("admin/pages/users/detail", {
        pageTitle: "Chi tiết người dùng",
        user: user
    });
}