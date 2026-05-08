const userRouter = require('express').Router();
const { registerUser, loginUser, forgotPassword, updatePassword, getUserProfile, handleOtpSend, handleVerifyOtpAndResetPassword } = require('../controllers/userController');
const { authUser, authResetPassword, authResetPasswordUsingOTP } = require('../middleware/auth')

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', authResetPassword, updatePassword);
userRouter.post('/forgot-password-otp', handleOtpSend);
userRouter.post('/reset-password-otp', authResetPasswordUsingOTP, handleVerifyOtpAndResetPassword);
userRouter.get('/me', authUser, getUserProfile);

module.exports = userRouter;