module.exports.register = async (req, res, next) => {
    if(!req.body.fullName){
        req.flash("error", "Họ tên không được để trống!");
        res.redirect("back");
        return;
    }
    
    if(!req.body.email){
        req.flash("error", "Email không được để trống!");
        res.redirect("back");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(req.body.email)){
        req.flash("error", "Email không hợp lệ!");
        res.redirect("back");
        return;
    }

    if(!req.body.password){
        req.flash("error", "Mật khẩu không được để trống!");
        res.redirect("back");
        return;
    }

    if(req.body.password.length < 6){
        req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự!");
        res.redirect("back");
        return;
    }

    next();
}

module.exports.login = async (req, res, next) => {
    if(!req.body.email){
        req.flash("error", "Email không được để trống!");
        res.redirect("back");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(req.body.email)){
        req.flash("error", "Email không hợp lệ!");
        res.redirect("back");
        return;
    }

    if(!req.body.password){
        req.flash("error", "Mật khẩu không được để trống!");
        res.redirect("back");
        return;
    }

    if(req.body.password.length < 6){
        req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự!");
        res.redirect("back");
        return;
    }

    next();
}

module.exports.forgotPassword = async (req, res, next) => {
    if(!req.body.email){
        req.flash("error", "Email không được để trống!");
        res.redirect("back");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(req.body.email)){
        req.flash("error", "Email không hợp lệ!");
        res.redirect("back");
        return;
    }

    next();
}

module.exports.changePass = async (req, res, next) => {
    if(!req.body.password){
        req.flash("error", "Mật khẩu không được để trống!");
        res.redirect("back");
        return;
    }

    if(!req.body.cpassword){
        req.flash("error", "xác nhận mật khẩu không được để trống!");
        res.redirect("back");
        return;
    }

    if(req.body.password.length < 6){
        req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự!");
        res.redirect("back");
        return;
    }

    if(req.body.password != req.body.cpassword){
        req.flash("error", "Mật khẩu và xác nhận mật khẩu phải trùng nhau!");
        res.redirect("back");
        return;
    }

    next();
}
