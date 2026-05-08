const bcryptjs = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodeMailer = require('nodemailer');

const registerUser = async (req, res) => {
    try {
        let { firstName, lastName, email, password, phone } = req.body || {};

        if (!firstName || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: "Missing Inputs" });
        };

        firstName = firstName.trim();
        lastName = lastName ? lastName.trim() : null;
        phone = String(phone).trim();

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (firstName.length > 20) {
            return res.status(400).json({ success: false, message: "Name does not exceeds more than 20 characters" });
        };

        if (!passwordRegex.test(password)) {
            return res.status(400).json({ success: false, message: "The password must include one letter, one number, one special character and minimum 8 characters" });
        };

        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid Email format" });
        };

        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: "Invalid Phone number format" });
        };

        const existingUser = await User.findOne({
            where: {
                $or: [
                    { email },
                    { phone }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ success: false, message: "User is already registered" });
            };

            if (existingUser.phone === phone) {
                // return res.status(400).json({ success: false, message: "User is already registered" });
                return res.status(400).json({ success: false, message: "Phone is already Found" });
            };
        };

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const user = await User.create({ firstName, lastName, email, password: hashedPassword, phone });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "12h" });

        return res.status(201).json({ success: true, message: "User Created successfully", token });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Missing Inputs" });
        };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(401).json({ success: false, message: "Invalid Email format" });
        };

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: "Email or password does not match" });
        };

        const isValidPassword = await bcryptjs.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(400).json({ success: false, message: "Email or password does not match" });
        };

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "12h" });

        return res.status(200).json({ success: true, message: "Logged in successfully", token, user: { id: user.id, firstName: user.firstName, email: user.email } });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body || {};

        email = email.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ success: false, message: "Missing Input" });
        };

        const validUser = await User.findOne({ where: { email } });

        if (!validUser) {
            // return res.status(404).json({ success: false, message: "Email does not Found" });
            return res.status(200).json({ success: true, message: "If this email exists, a reset link has been sent" });
        };

        const resetTokener = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetTokener).digest('hex');

        validUser.resetToken = hashedToken;
        await validUser.save();

        const resetURL = `http://localhost:3000/user/reset-password?token=${resetTokener}`;

        const transporter = nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: email,
            subject: "Password Reset",
            text: `click the following link to reset the password ${resetURL}`
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Check your email for instructions on resetting your password' });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

const updatePassword = async (req, res) => {
    try {
        const { password } = req.body || {};
        const user = res.locals.user;

        if (!password) {
            return res.status(400).json({ success: false, message: "Missing Password" });
        };

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({ success: false, message: "The password must include one letter, one number, one special character and minimum 8 characters" });
        };

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        user.password = hashedPassword;
        user.resetToken = null;

        await user.save();
        return res.status(200).json({ success: true, message: "User Password Updated successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

const handleOtpSend = async (req, res) => {
    try {
        let { email } = req.body;

        email = email.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ success: false, message: "Missing Input" });
        };

        const otp = crypto.randomInt(100000, 999999).toString();
        const hasedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        };

        user.resetOtp = hasedOTP;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        await user.save();

        const transporter = nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: email,
            subject: "OTP to Reset password",
            text: `Your OTP for password reset is: <b>${otp}</b>.
            Do not share your OTP with anyone else. Validity 5 Mins`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: false, message: "OTP sent successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

const handleVerifyOtpAndResetPassword = async (req, res) => {
    try {
        let { otp, newPassword, confirmPassword } = req.body || {};

        if (!otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "Missing Inputs" });
        };

        otp = String(otp).trim();

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ success: false, message: "Invalid OTP Format" });
        };

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ success: false, message: "The password must include one letter, one number, one special character and minimum 8 characters" });
        };

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: true, message: "Passwords do not match" });
        };

        const user = res.locals.user;

        if (!user) {
            return res.status(400).json({ success: false, message: "Email Not Found" });
        };

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetOtp = null;
        user.otpExpiry = null;

        await user.save();

        return res.status(200).json({ success: true, message: "Password Updated Successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

const getUserProfile = async (req, res) => {
    try {
        const user = res.locals.user || {};
        return res.status(200).json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

module.exports = { registerUser, loginUser, forgotPassword, updatePassword, handleOtpSend, handleVerifyOtpAndResetPassword, getUserProfile };