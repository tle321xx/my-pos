// server/config/database.js
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

// สร้างไฟล์ database ชื่อ pos.db ไว้ที่โฟลเดอร์ server (ถอยออกมา 1 ชั้นจาก config)
const dbPath = path.join(__dirname, '../pos.db');
const db = new Database(dbPath, { verbose: console.log });

// สร้างตาราง products ถ้ายังไม่มี
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    weight REAL DEFAULT 0,
    unit TEXT DEFAULT 'g',
    category TEXT,
    strain TEXT,
    tags TEXT,
    image TEXT,
    active INTEGER DEFAULT 1,
    thc REAL DEFAULT 0,
    ratio TEXT,
    scent TEXT
  )
`);

// 2. [ใหม่] ตารางลูกค้า (เก็บข้อมูล พท.33 และ CRM)
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    id_card TEXT,       -- เลขบัตรประชาชน/Passport (สำหรับรายงาน)
    gender TEXT,        -- เพศ
    age INTEGER,        -- อายุ
    phone TEXT,
    line_id TEXT,
    is_member INTEGER DEFAULT 0, -- 0=ลูกค้าทั่วไป, 1=สมาชิก
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 3. [ใหม่] ตารางออเดอร์ (หัวบิล)
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_no TEXT NOT NULL, -- เลขที่ใบเสร็จ (Running No.)
    customer_id INTEGER,
    total_price REAL,
    payment_method TEXT DEFAULT 'cash',
    staff_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
  )
`);

// 4. [ใหม่] ตารางรายการในออเดอร์ (ไส้ในบิล - เก็บว่าซื้อสายพันธุ์อะไรไปบ้าง)
db.exec(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    product_name TEXT, -- เก็บชื่อตอนขาย (เผื่อเปลี่ยนชื่อทีหลัง)
    strain TEXT,       -- เก็บสายพันธุ์ (สำคัญสำหรับ Report)
    quantity REAL,
    price_per_unit REAL,
    total_line_price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,       -- เก็บแบบ Hash (ไม่ใช่ตัวหนังสือธรรมดา)
    name TEXT NOT NULL,           -- ชื่อพนักงานที่แสดงในบิล
    role TEXT DEFAULT 'staff',    -- 'admin' หรือ 'staff'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 6. [ใหม่] ตารางเก็บ Log (Audit Trail)
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,        -- ทำอะไร เช่น 'LOGIN', 'DELETE_PRODUCT', 'SELL'
    description TEXT,   -- รายละเอียด เช่น 'Deleted product ID 5'
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

// [SEED DATA] เช็คว่ามีข้อมูลไหม ถ้าไม่มีให้เพิ่มข้อมูลตั้งต้น
const count = db.prepare('SELECT count(*) as count FROM products').get().count;

if (count === 0) {
  console.log('Seeding initial data...');
  const insert = db.prepare(`
    INSERT INTO products (name, price, weight, unit, category, strain, tags, image, active, thc, ratio, scent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seeds = [
    ['Purple Punch', 450, 1, 'g', 'weed', 'Indica', '["top-shelf"]', 'https://img.freepik.com/free-photo/dried-cannabis-buds_23-2151636886.jpg?semt=ais_hybrid', 1, 25, 'Indica 90/10', 'Grape, Berry'],
    ['Sour Diesel', 400, 1, 'g', 'weed', 'Sativa', '[]', 'https://img.freepik.com/free-photo/cannabis-bud-isolated-white-background_1258-109278.jpg', 1, 22, 'Sativa 90/10', 'Diesel, Earthy'],
    ['Grinder', 350, 0, 'pcs', 'instrument', null, '["accessory"]', 'https://img.freepik.com/premium-photo/metal-grinder-marijuana-isolated-white-background_1258-25656.jpg', 1, 0, '', '']
  ];

  seeds.forEach(p => insert.run(...p));
  console.log('Seeded 3 products.');
}

const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
if (userCount === 0) {
  console.log('Creating default Admin user...');
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('admin1234', salt); // รหัสผ่านเริ่มต้น: admin1234 (เปลี่ยนทีหลังได้)
  
  const insertUser = db.prepare(`
    INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)
  `);
  insertUser.run('admin', hash, 'Super Admin', 'admin');
  console.log('Default Admin created: username=admin, password=admin1234');
}

console.log('Connected to SQLite Database at', dbPath);

module.exports = db;