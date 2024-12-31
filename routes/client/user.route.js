const express = require("express");
const multer = require('multer');
const router = express.Router();

const controller = require("../../controllers/client/user.controller");
const userMiddleware = require("../../middlewares/client/user.middleware");
const validate = require("../../validates/client/user.validate");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

const upload = multer();

//register
router.get("/register", controller.register);

router.post("/register", validate.register, controller.registerPost);
//End register

// Auth
router.get("/login", controller.login);

router.post("/login", validate.login, controller.loginPost);

router.get("/logout", controller.logout);
// End Auth


// Profile
router.get("/profile", userMiddleware.requireAuth, controller.profile);

router.get("/profile/edit", userMiddleware.requireAuth, controller.editProfile);

router.patch(
    "/profile/edit", 
    userMiddleware.requireAuth, 
    upload.single('avatar'), 
    uploadCloud.uploadSingle,
    controller.editPatch
);

router.get("/profile/changePassword", userMiddleware.requireAuth, controller.changePassword);

router.patch("/profile/changePassword", userMiddleware.requireAuth, validate.changePass, controller.changePassPatch);
// End Profile

// Password
router.get("/password/forgot", controller.forgotPassword);

router.post("/password/forgot", validate.forgotPassword, controller.forgotPasswordPost);

router.get("/password/otp", controller.otpPassword);

router.post("/password/otp", controller.otpPasswordPost);

router.get("/password/reset", userMiddleware.requireAuth, controller.resetPassword);

router.patch("/password/reset", userMiddleware.requireAuth, controller.resetPasswordPatch);
// End Password

// Dashboard
router.get("/dashboard", controller.dashboard);

router.get("/orders", controller.orders);

router.get("/orders/detail/:id", controller.ordersDetail);

router.post("/orders/make-review", controller.makeReview);
// End Dashboard

module.exports = router;