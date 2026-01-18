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

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, role, password } = req.body;
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  
  // ถ้ามีการส่งรูปใหม่มา ให้ใช้ path ใหม่, ถ้าไม่มีให้เป็น null (หรือ logic ตามต้องการ)
  // แต่ปกติการ Update จะซับซ้อนกว่านี้หน่อย (ต้องเช็คว่าถ้าไม่ส่งรูปมา ให้ใช้รูปเดิม)
  // เพื่อความง่ายในขั้นนี้: 
  let imageUpdateSQL = "";
  let params = [name, role, id];

  if (req.file) {
    const imagePath = `${serverUrl}/uploads/${req.file.filename}`;
    imageUpdateSQL = ", image = ?";
    params = [name, role, imagePath, id];
  }

  try {
    // ถ้ามีการเปลี่ยนรหัสผ่าน
    if (password && password.trim() !== "") {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        // กรณีแก้รหัส + ข้อมูลอื่น
        if(req.file) {
            db.prepare(`UPDATE users SET name=?, role=?, password=?, image=? WHERE id=?`).run(name, role, hash, params[2], id);
        } else {
            db.prepare(`UPDATE users SET name=?, role=?, password=? WHERE id=?`).run(name, role, hash, id);
        }
    } else {
        // กรณีไม่แก้รหัส
        if(req.file) {
             db.prepare(`UPDATE users SET name=?, role=? ${imageUpdateSQL} WHERE id=?`).run(...params);
        } else {
             db.prepare(`UPDATE users SET name=?, role=? WHERE id=?`).run(name, role, id);
        }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};