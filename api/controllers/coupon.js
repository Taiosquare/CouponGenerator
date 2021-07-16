const { replaceHashKeyValue } = require('../services/cache'),
    { Coupon } = require("../models/coupon"),
    { User } = require("../models/user"),
    mongoose = require("mongoose");

exports.generateCoupon = async (req, res) => {
    try {
        const code = Math.random().toString(36).substr(2, 10)

        const newCoupon = await Coupon.create({
            _id: mongoose.Types.ObjectId(),
            couponCode: code,
            user: req.user._id
        })

        res.status(201).json({
            message: "Coupon successfully created",
            coupon: newCoupon
        });

        const userCoupons = await Coupon.find({ user: req.user._id });

        replaceHashKeyValue(
            req.user._id,
            {
                user: req.user._id,
                collection: 'coupons'
            },
            userCoupons
        );

        let user = await User.findById(req.user._id);

        user.coupons.push(newCoupon._id);

        await user.save();
    } catch (error) {
        res.status(400).json({
            error: "User's Coupon could not be generated",
        });
    }
}

exports.getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        res.status(200).json({
            coupon: coupon
        });
    } catch (error) {
        res.status(400).json({
            error: "Coupon could not be fetched",
        });
    }
}

exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon
            .find({ user: req.user._id })
            .cache({ key: req.user._id });

        res.status(200).json({
            coupons: coupons
        });
    } catch (error) {
        res.status(400).json({
            error: "User's Coupons could not be fetched",
        });
    }
}