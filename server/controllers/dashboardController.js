const db = require('../config/database');

exports.getStats = (req, res) => {
  try {
    // 1. ยอดขายวันนี้
    const todaySales = db.prepare(`
      SELECT SUM(total_price) as total 
      FROM orders 
      WHERE date(created_at) = date('now', 'localtime')
    `).get();

    // 2. จำนวนบิลวันนี้
    const totalOrders = db.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE date(created_at) = date('now', 'localtime')
    `).get();

    // 3. สินค้าใกล้หมด (สมมติว่าน้อยกว่า 10 ชิ้น)
    const lowStock = db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE quantity < 10 AND active = 1
    `).get();

    // 4. สมาชิกใหม่เดือนนี้ (ตัวอย่าง)
    const newMembers = db.prepare(`
      SELECT COUNT(*) as count FROM customers
    `).get(); // (ของจริงอาจจะ filter created_at)

    res.json({
      todaySales: todaySales.total || 0,
      totalOrders: totalOrders.count || 0,
      lowStock: lowStock.count || 0,
      newMembers: newMembers.count || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChartData = (req, res) => {
    // ... (โค้ดกราฟที่คุณอาจจะทำไว้แล้ว หรือใช้ Logice เดิมที่ผมเคยให้)
    // ถ้ายังไม่มี ให้ใส่ Empty Object ไปก่อนกัน Error
    res.json({ hourlySales: [], categorySales: [] });
};