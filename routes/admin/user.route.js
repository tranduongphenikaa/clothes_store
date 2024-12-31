const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/user.controller");

router.get("/", controller.index);

router.patch("/change-status/:statusChange/:id", controller.changeStatus);

router.patch("/delete/:id", controller.delete);

router.get("/detail/:id", controller.detail);

module.exports = router;