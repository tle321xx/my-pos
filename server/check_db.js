// server/check_db.js
const Database = require('better-sqlite3');
const path = require('path');

// ชี้ไปที่ไฟล์ pos.db (ปรับ path ให้ตรงกับตำแหน่งจริง)
const dbPath = path.join(__dirname, 'pos.db'); 
const db = new Database(dbPath);

console.log('--- Checking Database at:', dbPath, '---');

try {
  // 1. เช็ค User
  const userCount = db.prepare('SELECT count(*) as count FROM users').get();
  console.log(`Users count: ${userCount.count}`);
  if (userCount.count > 0) {
      const users = db.prepare('SELECT id, username, role FROM users LIMIT 3').all();
      console.log('Sample Users:', users);
  }

  // 2. เช็ค Products
  const productCount = db.prepare('SELECT count(*) as count FROM products').get();
  console.log(`Products count: ${productCount.count}`);
  
  // 3. เช็ค Orders
  const orderCount = db.prepare('SELECT count(*) as count FROM orders').get();
  console.log(`Orders count: ${orderCount.count}`);

} catch (err) {
  console.error('Error reading DB:', err.message);
}