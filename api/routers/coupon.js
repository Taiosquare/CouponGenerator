const express = require("express"),
    router = express.Router(),
    couponController = require("../controllers/coupon"),
    isAuth = require("../middlewares/isAuth");

router
    .route("/generateCoupon")
    .post(isAuth, couponController.generateCoupon);

router.route("/getCoupon/:id").get(isAuth, couponController.getCoupon);

router.route("/getCoupons").get(isAuth, couponController.getCoupons);

module.exports = router;