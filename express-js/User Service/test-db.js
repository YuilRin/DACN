const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',      // Đổi nếu dùng Docker hoặc server khác
    user: 'root',          // Thay bằng user của bạn
    password: 'YuilRin*123',  // Thay bằng password của bạn
    database: 'user_service'   // Thay bằng database bạn muốn kết nối
});

// Kiểm tra kết nối
connection.connect(err => {
    if (err) {
        console.error('❌ Không thể kết nối MySQL:', err);
        return;
    }
    console.log('✅ Kết nối MySQL thành công!');
    connection.end();
});
