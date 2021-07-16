const { replaceKeyValue } = require('../services/cache'),
    { User } = require('../models/user'),
    argon2 = require("argon2"),
    mongoose = require('mongoose');

exports.addUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = await User.findOne({
            userame: username
        });

        if (user) {
            return res.status(400).json({
                error: "Username already registered",
            });
        }

        user = await User.findOne({
            email: email
        });

        if (user) {
            return res.status(400).json({
                error: "Email Address already registered",
            });
        }

        const hashedPassword = await argon2.hash(password);

        const newUser = await User.create({
            _id: mongoose.Types.ObjectId(),
            username: username,
            email: email,
            password: hashedPassword,
            coupons: []
        })

        res.status(201).json({
            message: "User successfully created",
            user: newUser
        });

        const users = await User.find();

        replaceKeyValue(
            "users",
            users
        );
    } catch (error) {
        res.status(400).json({
            error: "User could not be registered",
        });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(400).json({
                error: "Invalid Username or Password"
            });
        }

        if (!(await argon2.verify(user.password, password))) {
            return res.status(400).json({
                error: "Invalid Username or Password"
            });
        }

        const access = await User.generateAuthToken(user._id);
        const refresh = await User.generateRefreshToken(user._id);

        res.status(200).json({
            message: "User Login Successful",
            user: {
                _id: user._id,
                username: user.username,
            },
            token: {
                access: {
                    token: access,
                    expiresIn: "5m",
                },
                refresh: {
                    token: refresh,
                    expiresIn: "7d"
                }
            },
        });
    } catch (error) {
        res.status(400).json({
            error: "User could not be logged in",
        });
    }
}

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        res.status(200).json({
            user: user
        });
    } catch (error) {
        res.status(400).json({
            error: "User could not be fetched",
        });
    }
}

exports.getUsers = async (req, res) => {
    try {
        const users = await User
            .find()
            .cache({ key: "users" });

        res.status(200).json({
            users: users
        });
    } catch (error) {
        res.status(400).json({
            error: "User's Details could not be fetched",
        });
    }
}