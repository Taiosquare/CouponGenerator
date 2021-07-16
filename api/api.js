const express = require("express"),
    api = express.Router(),
    userRouter = require("./routers/user"),
    couponRouter = require("./routers/coupon");

api.use("/user", userRouter);
api.use("/coupon", couponRouter);

module.exports = api;
