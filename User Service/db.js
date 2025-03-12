const mysql = require('mysql2');

// Cấu hình kết nối
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'YuilRin*123',  // Thay bằng mật khẩu thực tế
    database: 'user_service',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Tạo kết nối dưới dạng promise để dễ dùng với async/await
const db = pool.promise();

module.exports = db;
