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

const authResetPasswordUsingOTP = async (req, res, next) => {
    try {
        let { otp } = req.body || {};

        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is Missing" });
        };

        otp = String(otp).trim();

        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({ where: { resetOtp: hashedOTP } });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid OTP or Expired" });
        };

        if (!user.otpExpiry || user.otpExpiry < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        };

        res.locals.user = user;
        next();

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

module.exports = { authUser, authResetPassword, authResetPasswordUsingOTP };