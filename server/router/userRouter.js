const userRouter = require('express').Router();
const { registerUser, loginUser, forgotPassword, updatePassword, getUserProfile } = require('../controllers/userController');
const { authUser, authResetPassword } = require('../middleware/auth')

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', authResetPassword, updatePassword);
userRouter.get('/me', authUser, getUserProfile);

module.exports = userRouter;