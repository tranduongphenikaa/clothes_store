const express = require("express");
const multer = require('multer');
const router = express.Router();

const controller = require("../../controllers/admin/blog.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

const upload = multer();

router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
    "/create", 
    upload.single('thumbnail'),
    uploadCloud.uploadSingle,
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
    "/edit/:id",
    upload.single('thumbnail'),
    uploadCloud.uploadSingle,
    controller.editPatch
);

router.get("/detail/:id", controller.detail);

router.patch("/delete/:id", controller.delete);

router.patch("/change-status/:statusChange/:id", controller.changeStatus);

module.exports = router;