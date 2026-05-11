const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
// const path = require('path');

const { connectDB, sequelize } = require('./config/db');
const { User, Attendance } = require('./models/index');
const userRouter = require('./router/userRouter');
const attendanceRouter = require('./router/attendanceRouter');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

app.use('/user', userRouter);
app.use('/attendance', attendanceRouter);

app.get('/', (req, res) => {
    res.send('server is running');
});

const startapp = async () => {

    await connectDB();
    sequelize.sync({ alter: true });

    app.listen(PORT, (req, res) => {
        console.log(`http://localhost:${PORT}`);
    });
};

startapp();