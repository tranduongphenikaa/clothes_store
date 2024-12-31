const Advert = require("../../models/advert.model");
const systemConfig = require("../../config/system");

// [GET] /admin/adverts
module.exports.index = async(req, res) => {
    const records = await Advert.find({
        deleted: false
    });
    
    res.render("admin/pages/adverts/index", {
        pageTitle: "Quảng cáo",
        records: records
    });
}

// [GET] /admin/adverts/create
module.exports.create = async(req, res) => {
    res.render("admin/pages/adverts/create", {
        pageTitle: "Tạo quảng cáo"
    });
}

// [POST] /admin/adverts/create
module.exports.createPost = async(req, res) => {
    const advert = new Advert(req.body);
    await advert.save();

    req.flash("success", "Tạo quảng cáo thành công!");

    res.redirect(`/${systemConfig.prefixAdmin}/adverts`);
}

// [GET] /admin/adverts/edit/:id
module.exports.edit = async(req, res) => {
    try {
        const id = req.params.id;

        const advert = await Advert.findOne({
            _id: id,
            deleted: false
        });
        
        res.render("admin/pages/adverts/edit", {
            pageTitle: "Chỉnh sửa quảng cáo",
            advert: advert
    });
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/adverts`);
    }
}

// [PATCH] /admin/adverts/edit/:id
module.exports.editPatch = async(req, res) => {
    try {
        const id = req.params.id;

        await Advert.updateOne({
            _id: id,
            deleted: false
        }, req.body);

        req.flash("success", "Cập nhật thành công!");
    } catch (error) {
        req.flash("error", "ID không hợp lệ!");
    }
    
    res.redirect("back");
}

// [GET] /admin/adverts/detail/:id
module.exports.detail = async(req, res) => {
    try {
        const id = req.params.id;
    
        const advert = await Advert.findOne({
            _id: id,
            deleted: false
        });

        res.render("admin/pages/adverts/detail", {
            pageTitle: "Chi tiết quảng cáo",
            advert: advert
        })
    } catch (error) {
        res.redirect(`/${systemConfig.prefixAdmin}/adverts`);
    }
}

// [PATCH] /admin/adverts/change-status/:statusChange/:id
module.exports.changeStatus = async(req, res) => {
    const {id, statusChange} = req.params;

    await Advert.updateOne({
        _id: id
    }, {
        status: statusChange
    });

    req.flash("success", "Cập nhật trạng thái thành công!");

    res.json({
        code: 200
    });
}