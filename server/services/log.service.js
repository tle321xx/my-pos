// server/services/log.service.js
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// 1. ตั้งค่าโฟลเดอร์เก็บ Log
const logDirectory = path.join(__dirname, '../logs');

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(logDirectory)) {
    console.log("if (!fs.existsSync(logDirectory))");
  fs.mkdirSync(logDirectory, { recursive: true });
}

// 2. ตั้งชื่อไฟล์ Log ตามวัน (เช่น activity-2024-05-20.txt) เพื่อไม่ให้ไฟล์ใหญ่เกินไป
const logFilePath = path.join(logDirectory, 'log.txt');

exports.log = (userId, username, action, description, req = null) => {
  try {
    let ip = 'unknown';
    if (req) {
      ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    }
    if (ip === '::1') ip = '127.0.0.1';

    // 1. ลง DB
    const stmt = db.prepare('INSERT INTO activity_logs (user_id, username, action, description, ip_address) VALUES (?, ?, ?, ?, ?)');
    stmt.run(userId, username, action, description, ip);

    // 2. ลงไฟล์ Text
    const timestamp = new Date().toLocaleString('th-TH');
    const logMessage = `[${timestamp}] [IP:${ip}] [User:${username}] [${action}] ${description}\n`;

    // [แก้ไข] เขียนไฟล์แบบ Sync เพื่อความชัวร์ (Debugging) และแสดง Error ถ้าเขียนไม่ได้
    try {
      fs.appendFileSync(logFilePath, logMessage);
      console.log('✅ Log written to file:', logFilePath);
    } catch (fileErr) {
      console.error('❌ Cannot write log file:', fileErr);
    }

  } catch (err) {
    console.error('Logging System Failed:', err.message);
  }
};