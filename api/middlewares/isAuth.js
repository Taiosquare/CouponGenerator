const { User } = require("../models/user"),
    functions = require("../functions");

require("dotenv").config();

module.exports = async (req, res, next) => {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
        res.status(400).json({ error: "No Authentication Header" });
    } else {
        try {
            const token = authHeader.split(" ")[1],
                refresh = req.headers['refresh-token'];

            const decodedToken = await functions.decodeToken(token, process.env.ACCESS_SECRET, refresh);

            if (decodedToken.error) {
                res.status(400).json({ error: decodedToken.error });
            } else if (decodedToken.state == "non-existent") {
                res.status(400).json({ error: "Non-Existent User" });
            } else if (decodedToken.state == "expired") {
                res.status(400).json({ message: "Token Expired, Login" });
            } else if (decodedToken.state == "active") {
                try {
                    const user = await User.findById(decodedToken.token._id);

                    req.user = user;
                    req.token = decodedToken.newToken;
                    next();
                } catch (error) {
                    res.status(400).json({ error: "User not Found" });
                }
            }
        } catch (error) {
            res.status(400).json({ error: "Error authenticating user" });
        }
    }
};
