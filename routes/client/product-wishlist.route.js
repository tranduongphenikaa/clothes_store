const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/product-wishlist.controller");

router.get("/", controller.index);

router.post("/add/:productId", controller.addPost);

router.delete("/delete/:productId", controller.delete);

module.exports = router;