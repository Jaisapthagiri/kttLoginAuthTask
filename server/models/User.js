const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false, unique: true },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetOtp: { type: DataTypes.STRING, allowNull: true },
    otpExpiry: { type: DataTypes.DATE, allowNull: true }
});

module.exports = User;