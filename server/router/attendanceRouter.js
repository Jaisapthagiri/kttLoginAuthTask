const attendanceRouter = require('express').Router();
const checkeInOut = require('../controllers/attendanceController');
const { authUser } = require('../middleware/auth');

attendanceRouter.post('/check-in-out', authUser, checkeInOut);

module.exports = attendanceRouter;
