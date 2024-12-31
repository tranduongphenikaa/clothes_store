const Order = require("../../models/order.model");
const Product = require("../../models/product.model");

const moment = require("moment");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /admin/orders
module.exports.index = async(req, res) => {
    const find = {
        deleted: false
    };

    // Phân trang
    const pagination = await paginationHelper.order(req, find);
    // Hết Phân trang

    const records = await Order.find(find).limit(pagination.limitItems).skip(pagination.skip).sort({_id: "desc"});;

    for(const item of records){
        item.createdAtFormat = moment(item.createdAt).format("DD/MM/YY HH:mm:ss")
    }
    
    res.render("admin/pages/orders/index", {
        pageTitle: "Quản lý đơn hàng",
        records: records,
        pagination: pagination
    });
}

// [PATCH] /admin/orders/changeStatus/:id
module.exports.changeStatus = async(req, res) => {
    if(res.locals.role.permissions.includes("orders_edit")){
        const id = req.params.id;
        const newStatus = req.body.status;
        
        await Order.updateOne({
            _id: id
        }, {
            status: newStatus
        })

        if(newStatus == "Giao thành công"){
            console.log("Ok");
            await Order.updateOne({
                _id: id
            }, {
                is_payment: true
            })
        }

        req.flash("success", "Cập nhật trạng thái thành công!");

        res.json({
            code: 200
        });
    }
}

// [PATCH] /admin/orders/delete/:id
module.exports.delete = async(req, res) => {
    if(res.locals.role.permissions.includes("orders_delete")) {
        const id = req.params.id;

        await Order.updateOne({
            _id: id
        }, {
            deleted: true
        })
        
        req.flash("success", "Xóa thành công!");

        res.json({
            code: 200
        });
    } 
}

// [GET] /admin/orders/detail/:id
module.exports.detail = async(req, res) => {
    const id = req.params.id;

    const order = await Order.findOne({
        _id: id
    })

    for(const item of order.products){
        const product = await Product.findOne({
            _id: item.productId
        });

        item.title = product.title;
        item.image = product.thumbnail[0];
    }

    res.render("admin/pages/orders/detail", {
        pageTitle: "Chi tiết đơn hàng",
        order: order
    });
}