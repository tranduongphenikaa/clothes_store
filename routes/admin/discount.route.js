const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/discount.controller");

router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
    "/create",
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
    "/edit/:id",
    controller.editPatch
);

router.patch("/delete/:id", controller.deletePatch);

router.patch("/change-status/:statusChange/:id", controller.changeStatus);

module.exports = router;