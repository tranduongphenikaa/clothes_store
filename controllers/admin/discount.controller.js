const Discount = require("../../models/discount.model");
const systemConfig = require("../../config/system");
const moment = require('moment');

// [GET] /admin/discounts
module.exports.index = async(req, res) => {
    const records = await Discount.find({
        deleted: false
    });

    for(const item of records){
        item.expire_date_format = moment(item.expire_date).format("DD/MM/YYYY");
        item.createdAtFormat = moment(item.createdAt).format("DD/MM/YYYY")
    }
    
    res.render("admin/pages/discounts/index", {
        pageTitle: "Mã giảm giá",
        records: records
    });
}

// [GET] /admin/discounts/create
module.exports.create = async(req, res) => {
    res.render("admin/pages/discounts/create", {
        pageTitle: "Tạo mã giảm giá"
    });
}

// [POST] /admin/discounts/create
module.exports.createPost = async(req, res) => {
    req.body.amount = parseInt(req.body.amount);
    const discount = new Discount(req.body);
    await discount.save();

    req.flash("success", "Tạo mã thành công!");

    res.redirect(`/${systemConfig.prefixAdmin}/discounts`);
}

// [GET] /admin/discounts/edit/:id
module.exports.edit = async(req, res) => {
    try {
        const id = req.params.id;

        const discount = await Discount.findOne({
            _id: id,
            deleted: false
        });
        
        res.render("admin/pages/discounts/edit", {
            pageTitle: "Chỉnh sửa mã giảm giá",
            discount: discount
    });
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/discounts`);
    }
}

// [PATCH] /admin/discounts/edit/:id
module.exports.editPatch = async(req, res) => {
    try {
        const id = req.params.id;

        req.body.amount = parseInt(req.body.amount);

        await Discount.updateOne({
            _id: id,
            deleted: false
        }, req.body);

        req.flash("success", "Cập nhật thành công!");
    } catch (error) {
        req.flash("error", "ID không hợp lệ!");
    }
    
    res.redirect("back");
}

// [PATCH] /admin/discounts/change-status/:statusChange/:id
module.exports.changeStatus = async(req, res) => {
    const {id, statusChange} = req.params;

    await Discount.updateOne({
        _id: id
    }, {
        status: statusChange
    });

    req.flash("success", "Cập nhật trạng thái thành công!");

    res.json({
        code: 200
    });
}

// [PATCH] /admin/discounts/delete/:id
module.exports.deletePatch = async(req, res) => {
    const id = req.params.id;

    await Discount.updateOne({
        _id: id
    }, {
        deleted: true
    });

    req.flash("success", "Xóa thành công!");

    res.json({
        code: 200
    });
}