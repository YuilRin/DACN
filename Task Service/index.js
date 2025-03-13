// task-service/index.js
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

// Middleware xác thực người dùng
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

const cors = require('cors')
app.use(cors())

// Áp dụng middleware vào API cần xác thực
app.get('/tasks', authenticate, async (req, res) => {
    const tasks = await Task.findAll({ where: { userId: req.userId } });
    res.json(tasks);
});


const app = express();
const PORT = process.env.TASK_PORT || 5000;

// Kết nối MySQL
const sequelize = new Sequelize(process.env.DB_URL, { dialect: 'mysql' });

// Định nghĩa Model Task
const Task = sequelize.define('Task', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('pending', 'completed'), defaultValue: 'pending' }
});

sequelize.sync();

app.use(bodyParser.json());

// Tạo task mới
app.post('/tasks', async (req, res) => {
    try {
        const { userId, title, description } = req.body;
        const task = await Task.create({ userId, title, description });
        res.status(201).json({ message: 'Task created', task });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Lấy danh sách task của user
app.get('/tasks/:userId', async (req, res) => {
    try {
        const tasks = await Task.findAll({ where: { userId: req.params.userId } });
        res.json(tasks);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Cập nhật trạng thái task
app.put('/tasks/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await Task.update({ status }, { where: { id: req.params.id } });
        res.json({ message: 'Task updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Task Service running on port ${PORT}`);
});
