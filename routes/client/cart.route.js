const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/cart.controller");

const validate = require("../../validates/client/cart.validate");

router.get("/", controller.index);

router.post("/add/:productId", validate.size ,controller.addPost);

router.post("/addIcon/:productId", controller.addIconPost);

router.get("/delete/:productId", controller.delete);

router.get("/update/:productId/:quantity/:sizeName", controller.update);

router.get("/update/:productId/size/:sizeName/:sizeChange", controller.updateSize);

router.post("/apply-discount", controller.applyDiscount);

module.exports = router;