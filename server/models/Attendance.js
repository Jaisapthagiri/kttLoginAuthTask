const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const Attendance = sequelize.define('Attendance', {
    attendanceDate: { type: DataTypes.DATEONLY, allowNull: false },
    checkIn: { type: DataTypes.DATE, allowNull: true },
    checkOut: { type: DataTypes.DATE, allowNull: true },
    present: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalWorkingHours: { type: DataTypes.FLOAT, defaultValue: 0 },
});

module.exports = Attendance;