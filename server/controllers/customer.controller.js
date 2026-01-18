const db = require('../config/database');
const logger = require('../services/log.service');

// ดึงลูกค้าทั้งหมด
exports.getAllCustomers = (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers ORDER BY id DESC').all();
    //logger.log(req.user.id, req.user.username, 'GET_ALL_CUSTOMER_VIEWED', `ดึงลูกค้าทั้งหมด ID: ${id}`, req);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// เพิ่มลูกค้าใหม่
// ... imports
exports.createCustomer = (req, res) => {
  const { name, id_card, phone, line_id } = req.body;

  // [เพิ่ม] รับไฟล์รูปภาพ
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  const imagePath = req.file ? `${serverUrl}/uploads/${req.file.filename}` : null;

  try {
    // [แก้ไข] เพิ่ม image เข้าไปใน SQL
    const stmt = db.prepare('INSERT INTO customers (name, id_card, phone, line_id, is_member, image) VALUES (?, ?, ?, ?, 1, ?)');
    const info = stmt.run(name, id_card, phone, line_id, imagePath);
    logger.log(req.user?.id || 0, req.user?.name || 'System', 'CUSTOMER_CREATED', `เพิ่มลูกค้าชื่อ: ${name} (ID: ${info.lastInsertRowid})`, req);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ...

// ดูประวัติการซื้อ (แนวทางเสริมที่คุณต้องการ)
exports.getCustomerHistory = (req, res) => {
  const { id } = req.params;
  try {
    // Join ตาราง orders กับ order_items เพื่อดูรายละเอียด
    const history = db.prepare(`
      SELECT o.id, o.receipt_no, o.total_price, o.created_at,
             (SELECT group_concat(product_name || ' x' || quantity, ', ') 
              FROM order_items WHERE order_id = o.id) as items
      FROM orders o
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `).all(id);
    logger.log(req.user.id, req.user.name, 'PURCHASE_HISTORY_VIEWED', `ดูประวัติการซื้อ ID: ${id}`, req);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = (req, res) => {
  const { id } = req.params;
  const { name, id_card, phone, line_id } = req.body;
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  
  try {
    if (req.file) {
       const imagePath = `${serverUrl}/uploads/${req.file.filename}`;
       db.prepare('UPDATE customers SET name=?, id_card=?, phone=?, line_id=?, image=? WHERE id=?')
         .run(name, id_card, phone, line_id, imagePath, id);
    } else {
       db.prepare('UPDATE customers SET name=?, id_card=?, phone=?, line_id=? WHERE id=?')
         .run(name, id_card, phone, line_id, id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};