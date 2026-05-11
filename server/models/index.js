const User = require('./User')
const Attendance = require('./Attendance');

User.hasMany(Attendance, { foreignKey: "userId" });
Attendance.belongsTo(User, { foreignKey: "userId" });

module.exports = { User, Attendance };