const express = require("express");
const multer = require('multer');
const router = express.Router();

const controller = require("../../controllers/admin/product-category.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const validate = require("../../validates/admin/product-category.validate");

const upload = multer();

router.get("/", controller.index);

router.patch("/change-status/:statusChange/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.patch("/change-position/:id", controller.changePosition);

router.get("/create", controller.create);

router.post(
    "/create", 
    upload.single('thumbnail'),
    validate.createPost,
    uploadCloud.uploadSingle,
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
    "/edit/:id", 
    upload.single('thumbnail'),
    validate.createPost,
    uploadCloud.uploadSingle,
    controller.editPatch
);

router.get("/detail/:id", controller.detail);

router.patch("/delete/:id", controller.deletePatch);

module.exports = router;