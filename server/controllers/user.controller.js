const db = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../services/log.service');

// ดึงรายชื่อพนักงานทั้งหมด
exports.getAllUsers = (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, name, role, created_at FROM users ORDER BY id DESC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// เพิ่มพนักงานใหม่
exports.createUser = (req, res) => {
  const { username, password, name, role } = req.body;
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  const imagePath = req.file ? `${serverUrl}/uploads/${req.file.filename}` : null;

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    
    const stmt = db.prepare('INSERT INTO users (username, password, name, role, image) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(username, hash, name, role || 'staff', imagePath);

    // [เพิ่ม] เรียกใช้ Logger
    logger.log(req.user?.id || 0, req.user?.name || 'System', 'USER_CREATED', `เพิ่มพนักงานใหม่: ${username}`, req);
    
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.log("err = ", err);
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ success: false, message: `Username "${username}" มีอยู่ในระบบแล้ว` });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ลบพนักงาน
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    logger.log(req.user?.id || 0, req.user?.name || 'System', 'USER_DELETED', `ลบพนักงาน ID: ${id}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};