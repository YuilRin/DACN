// user-service/index.js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db'); 
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();



const app = express();
const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

// Kết nối MySQL với Sequelize
const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'mysql'
});
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },  // Bổ sung email
    password: { type: DataTypes.STRING, allowNull: false }
}, {
    timestamps: false
});

sequelize.sync();

const cors = require('cors')
app.use(cors())

app.use(bodyParser.json());

// Lấy danh sách tất cả user (chỉ hiển thị id, username, email)
app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email'] // Chỉ lấy các cột cần thiết
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Đăng ký
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body; // Lấy email từ request
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });
        res.status(201).json({ message: 'User registered', user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Đăng nhập
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ 
            token, 
            user: { id: user.id, username: user.username } // Trả về userId
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Lấy thông tin user
app.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });
        
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findByPk(decoded.id, { attributes: ['id', 'username'] });
        res.json(user);
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});
