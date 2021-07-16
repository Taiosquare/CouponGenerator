const express = require("express"),
    router = express.Router(),
    userController = require("../controllers/user"),
    isAuth = require("../middlewares/isAuth");

router.route("/addUser").put(userController.addUser);

router.route("/login").post(userController.loginUser);

router.route("/getUser/:id").get(isAuth, userController.getUser);

router.route("/getUsers").get(isAuth, userController.getUsers);

module.exports = router;
