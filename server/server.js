const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require('path');

const { connectDB, sequelize } = require('./config/db');
const User = require('./models/User');
const userRouter = require('./router/userRouter');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use('/user', userRouter);

app.get('/', (req, res) => {
    res.send('server is running');
});

const startapp = async () => {

    await connectDB();
    sequelize.sync({ alter: true });

    app.listen(PORT, (req, res) => {
        console.log(`http://localhost:${PORT}`);
    });
}

startapp();