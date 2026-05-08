const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

const authUser = async (req, res, next) => {
    try {
        const authHeaders = req.headers.authorization;

        if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
            return res.status(403).json({ success: false, message: "Authorization Header Missing" });
        };

        const token = authHeaders.split(" ")[1];

        if (!token) {
            return res.status(403).json({ success: false, message: "Token is Missing" });
        };

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decodedToken.id, { attributes: { exclude: ["password"] } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        };

        res.locals.user = user;
        next();

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

const authResetPassword = async (req, res, next) => {
    try {
        // const { token } = req.body || {};
        const { token } = req.query || {};

        if (!token) {
            return res.status(400).json({ success: false, message: "Reset Token Missing" });
        };

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({ where: { resetToken: hashedToken } });

        if (!user) {
            return res.status(404).json({ success: false, message: "Unable to find the user" });
        };

        res.locals.user = user;
        next();

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

module.exports = { authUser, authResetPassword };