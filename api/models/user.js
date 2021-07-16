require("dotenv").config();

const mongoose = require("mongoose"),
    { ObjectId } = require("mongodb"),
    jwt = require("jsonwebtoken"),
    Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        _id: {
            type: ObjectId,
            required: true,
        },

        username: {
            type: String,
            required: true,
            index: true
        },

        email: {
            type: String,
            required: true,
        },

        password: {
            type: String,
            required: true,
        },

        coupons: [
            {
                type: mongoose.Types.ObjectId,
                ref: "coupon",
            }
        ]
    },
    {
        autoCreate: true,
        strict: false,
        timestamps: true,
    }
);

UserSchema.statics.generateAuthToken = (id) => {
    let token = jwt
        .sign(
            {
                _id: id,
            },
            process.env.ACCESS_SECRET,
            {
                expiresIn: "5m",
            }
        )
        .toString();

    return token;
}

UserSchema.statics.generateRefreshToken = (id) => {
    let refresh = jwt
        .sign(
            {
                _id: id,
            },
            process.env.REFRESH_SECRET,
            {
                expiresIn: "7d",
            }
        )
        .toString();

    return refresh;
}

const User = mongoose.model("user", UserSchema);

module.exports = { User };
