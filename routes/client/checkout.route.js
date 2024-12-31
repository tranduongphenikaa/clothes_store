const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/checkout.controller");

router.get("/", controller.index);

router.post("/order", controller.orderPost);

router.get("/success/:orderId", controller.success);

router.get('/create_payment_url', controller.create_url_payment);
  
router.get('/vnpay_return', controller.vnpay_return);
  
module.exports = router;