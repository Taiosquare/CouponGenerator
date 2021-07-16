const mongoose = require("mongoose"),
    { ObjectId } = require("mongodb"),
    Schema = mongoose.Schema;

const CouponSchema = new Schema(
    {
        _id: {
            type: ObjectId,
            required: true,
        },

        couponCode: {
            type: String,
            required: true,
        },

        user: {
            type: mongoose.Types.ObjectId,
            ref: "user",
        }
    },
    {
        autoCreate: true,
        strict: false,
        timestamps: true,
    }
);

const Coupon = mongoose.model("coupon", CouponSchema);

module.exports = { Coupon };
