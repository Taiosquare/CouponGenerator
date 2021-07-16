const jwt = require("jsonwebtoken"),
    { User } = require("../api/models/user");

const refreshToken = async (token) => {
    let tok = '';
    let decodedToken;

    try {
        decodedToken = await jwt.verify(token, process.env.REFRESH_SECRET);

        tok = await User.generateAuthToken(decodedToken._id);
    } catch (err) {
        if (err.message == "jwt expired") {
            tok = "expired";
        }
    }

    return tok;
}

module.exports.decodeToken = async (token, secret, refresh) => {
    let decodedToken = {};

    try {
        decodedToken.token = await jwt.verify(token, secret);

        const now = Date.now().valueOf() / 1000;

        if (typeof decodedToken.token.exp !== "undefined" && decodedToken.token.exp > now) {
            decodedToken.state = "active";
            decodedToken.newToken = token;
        }
        if (typeof decodedToken.token.exp == "undefined") {
            decodedToken.state = "non-existent";
        }
    } catch (err) {
        if (err.message == "jwt expired") {
            let newToken = "";

            newToken = await refreshToken(refresh);

            if (newToken == "expired") {
                decodedToken.state = "expired";
            } else {
                decodedToken.state = "active";
                decodedToken.token = await jwt.verify(newToken, process.env.ACCESS_SECRET);
                decodedToken.newToken = newToken;
            }
        } else {
            decodedToken.error = "Error Decoding Token";
        }
    }

    return decodedToken;
}
