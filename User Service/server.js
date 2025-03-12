const express = require('express');
const db = require('./db');  // Import kết nối MySQL
const app = express();

app.use(express.json());  // Cho phép xử lý JSON từ request body

// API kiểm tra kết nối MySQL
app.get('/ping', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ success: true, result: rows[0].result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API lấy danh sách user
app.get('/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API thêm user mới
app.post('/users', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Thiếu dữ liệu đầu vào!' });
    }
    try {
        const [result] = await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
        res.json({ success: true, userId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ User Service đang chạy trên http://localhost:${PORT}`);
});
