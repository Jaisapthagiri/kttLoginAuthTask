const { Attendance } = require('../models/index');

const checkeInOut = async (req, res) => {
    try {
        const { id } = res.locals.user || {};
        const { time } = req.body || {};

        if (!id) {
            return res.status(401).json({ success: false, message: "Unauthorized Access" });
        };

        const currentTime = new Date();
        // const currentTime = new Date('2026-05-11T09:30:00+05:30');
        // const currentTime = new Date('2026-05-11T18:30:00+05:30');
        // const currentTime = new Date('2026-05-11T18:29:00+05:30');
        // const currentTime = new Date('2026-05-12T20:03:00+05:30');

        if (!time) {
            return res.status(400).json({ success: false, message: "Time is required for checkIn/checkOut" });
        };

        const validTime = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!validTime.test(time)) {
            return res.status(400).json({ success: false, message: "Invalid Time Format" });
        };

        const [hours, minutes] = time.split(":").map(Number);

        currentTime.setHours(hours);
        currentTime.setMinutes(minutes);
        currentTime.setSeconds(0);
        currentTime.setMilliseconds(0);

        // const hours = currentTime.getHours();
        // const minutes = currentTime.getMinutes();

        const totalMinutes = (hours * 60) + minutes;

        const checkInStartTime = 8 * 60;
        const checkInEndTime = 10 * 60;
        const checkOutEndTime = 20 * 60;

        const todayDate = currentTime.toISOString().split("T")[0];

        const attendanceRecord = await Attendance.findOne({
            where: {
                userId: id,
                attendanceDate: todayDate
            }
        });

        if (!attendanceRecord) {
            const validCheckInTime = totalMinutes >= checkInStartTime && totalMinutes <= checkInEndTime;

            if (!validCheckInTime) {
                return res.status(400).json({ success: false, message: "Check-in is allowed only between 8 AM and 10 PM" });
            };

            await Attendance.create({
                userId: id,
                attendanceDate: todayDate,
                checkIn: currentTime,
                present: 0,
                totalWorkingHours: 0,
            });

            return res.status(200).json({ success: true, message: "CheckIn Success" });
        };

        if (attendanceRecord.checkIn && !attendanceRecord.checkOut) {

            if (totalMinutes > checkOutEndTime) {
                return res.status(400).json({ success: false, message: "Check-out is allowed before 8 PM" });
            };

            attendanceRecord.checkOut = currentTime;

            const totalMilliseconds = currentTime - new Date(attendanceRecord.checkIn);

            const totalHours = totalMilliseconds / (1000 * 60 * 60);

            attendanceRecord.totalWorkingHours = Number(totalHours.toFixed(2));

            if (totalHours >= 9) {
                attendanceRecord.present = 1;
            } else if (totalHours >= 4) {
                attendanceRecord.present = 0.5;
            } else {
                attendanceRecord.present = 0;
            };

            attendanceRecord.totalDays += attendanceRecord.present;

            await attendanceRecord.save();

            return res.status(200).json({ success: true, message: "CheckOut Success", totalWorkingHours: attendanceRecord.totalWorkingHours, present: attendanceRecord.present });
        };

        return res.status(400).json({ success: false, message: "Attendance already completed for today" });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    };
};

module.exports = checkeInOut;