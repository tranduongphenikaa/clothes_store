const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/role.controller");
const validate = require("../../validates/admin/role.validate");

router.get("/", controller.index);

router.get("/create", controller.create);

router.post("/create", validate.createPost, controller.createPost);

router.get("/edit/:id", controller.edit);

router.patch("/edit/:id", validate.createPost, controller.editPatch);

router.get("/detail/:id", controller.detail);

router.patch("/delete/:id", controller.deletePatch);

router.get("/permissions", controller.permissions);

router.patch("/permissions", controller.permissionsPatch);

module.exports = router;