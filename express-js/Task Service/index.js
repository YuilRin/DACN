// task-service/index.js
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.TASK_PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

// Kết nối MySQL với Sequelize
const sequelize = new Sequelize(process.env.DB_URL, { dialect: 'mysql' });

// Định nghĩa Model Task
const Task = sequelize.define('Task', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('todo', 'in-progress', 'done'), defaultValue: 'todo' }
});

// Đồng bộ database
sequelize.sync();

// Middleware xác thực người dùng
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id; // Lưu userId vào request
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

// 📌 API: Lấy danh sách task của user hiện tại
app.get('/tasks', authenticate, async (req, res) => {
    try {
        const tasks = await Task.findAll({ where: { userId: req.userId } });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// // 📌 API: Tạo task mới (có xác thực user)
// app.post('/tasks', authenticate, async (req, res) => {
//     try {
//         const { title, description } = req.body;
//         if (!title) return res.status(400).json({ error: "Title is required" });

//         const task = await Task.create({ userId: req.userId, title, description });
//         res.status(201).json({ message: 'Task created', task });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });
app.post("/tasks", async (req, res) => {
    console.log("Received Task Data:", req.body); // Debug log

    const { title, description, status, userId } = req.body; // Chỉnh lại tên trường đúng

    if (!userId) {
        return res.status(400).json({ error: "User ID là bắt buộc" });
    }

    try {
        const newTask = await Task.create({ title, description, status, userId });
        res.json(newTask);
    } catch (error) {
        console.error("Lỗi khi tạo task:", error.message, error.stack); 
        res.status(500).json({ error: "Không thể tạo task" });
    }
});


// 📌 API: Cập nhật trạng thái hoặc nội dung task
app.put('/tasks/:id', authenticate, async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const task = await Task.findOne({ where: { id: req.params.id, userId: req.userId } });

        if (!task) return res.status(404).json({ error: "Task not found" });

        await task.update({ title, description, status });
        res.json({ message: 'Task updated', task });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 📌 API: Xóa task
app.delete('/tasks/:id', authenticate, async (req, res) => {
    try {
        const task = await Task.findOne({ where: { id: req.params.id, userId: req.userId } });

        if (!task) return res.status(404).json({ error: "Task not found" });

        await task.destroy();
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`✅ Task Service running on port ${PORT}`);
});
