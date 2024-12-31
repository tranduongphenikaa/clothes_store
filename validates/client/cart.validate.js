module.exports.size = async (req, res, next) => {
    if(!req.body.size){
        req.flash("error", "Chưa chọn size cho sản phẩm!");
        res.redirect("back");
        return;
    }

    next();
}