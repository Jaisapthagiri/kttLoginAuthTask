// const crypto = require('crypto');

// const token = crypto.randomBytes(20);
// console.log(token);
// console.log(token.toString('hex'));

// const startTime = 8 * 60;
// console.log(startTime);

// const currentTime = new Date();
// const checkIn = new Date("2026-05-11T08:00:00");
// const totalMilliseconds = currentTime - checkIn;
// console.log(totalMilliseconds);
// const totalHours = totalMilliseconds / (1000 * 60 * 60);
// console.log(totalHours);
// const hours = currentTime.getHours();
// const minutes = currentTime.getMinutes();
// const seconds = currentTime.getSeconds();

// console.log(hours + ":" + minutes + ":" + seconds);

// console.log(currentTime.toLocaleTimeString());

// console.log((6.70 * 60) / 60);

// console.log(new Date());

const currentDate = new Date().toLocaleTimeString();
// console.log(currentDate);

// const firstDay = new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth(),
//     1
// );

// const lastDay = new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth() + 1,
//     0
// );

// const totalDays = await Attendance.sum('present', {
//     where: {
//         userId: id,
//         attendanceDate: {
//             [Op.between]: [firstDay, lastDay]
//         }
//     }
// });
