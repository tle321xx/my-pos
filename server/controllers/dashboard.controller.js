const db = require('../config/database');

exports.getStats = (req, res) => {
  try {
    // 1. ยอดขายวันนี้
    const todaySales = db.prepare(`
      SELECT SUM(total_price) as total, COUNT(id) as bills 
      FROM orders 
      WHERE date(created_at) = date('now', 'localtime')
    `).get();

    // 2. สินค้าทั้งหมด
    const totalProducts = db.prepare('SELECT COUNT(id) as count FROM products WHERE active = 1').get();

    // 3. สินค้าใกล้หมด (Stock <= 10)
    // หมายเหตุ: สินค้าเก่าที่เพิ่มคอลัมน์ stock ทีหลัง ค่าจะเป็น 0 (ถือว่าใกล้หมด)
    const lowStockItems = db.prepare(`
      SELECT id, name, stock, unit, min_stock 
      FROM products 
      WHERE active = 1 AND stock <= min_stock 
      ORDER BY stock ASC
    `).all();

    res.json({
      sales: todaySales.total || 0,
      bills: todaySales.bills || 0,
      products: totalProducts.count || 0,
      lowStock: lowStockItems || []
    });
  } catch (err) {
    console.error("Dashboard Error:", err); // เพิ่ม Log ให้เห็น error ใน Terminal
    res.status(500).json({ error: err.message });
  }
};

exports.getChartData = (req, res) => {
  try {
    // 1. กราฟเส้น: ยอดขายรายชั่วโมง (เฉพาะวันนี้)
    // ใช้ strftime('%H', ...) ของ SQLite เพื่อดึงชั่วโมง (00-23)
    const hourlyData = db.prepare(`
      SELECT strftime('%H', created_at) as hour, SUM(total_price) as total
      FROM orders
      WHERE date(created_at) = date('now', 'localtime')
      GROUP BY hour
    `).all();

    // แปลงข้อมูลให้เป็น Array 24 ช่อง (0-23 นาฬิกา)
    const salesByHour = new Array(24).fill(0);
    hourlyData.forEach(item => {
      const h = parseInt(item.hour);
      salesByHour[h] = item.total;
    });

    // 2. กราฟโดนัท: ยอดขายตามหมวดหมู่ (ขายดี)
    // ต้อง Join กับ products หรือดูจาก order_items ถ้าเก็บ category ไว้
    // เนื่องจาก order_items เราเก็บ product_name แต่ไม่ได้เก็บ category ไว้ตรงๆ 
    // เราจึงต้อง JOIN กลับไปหาตาราง products
    const categoryData = db.prepare(`
      SELECT p.category, SUM(oi.total_line_price) as total
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.category
    `).all();

    res.json({
      hourlySales: salesByHour,
      categorySales: categoryData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSummary = (req, res) => {
  try {
    // 1. ยอดขายตามช่วงเวลา
    const today = db.prepare(`SELECT SUM(total_price) as total FROM orders WHERE date(created_at) = date('now', 'localtime')`).get().total || 0;
    
    // สัปดาห์นี้ (ใช้ strftime %W)
    const week = db.prepare(`SELECT SUM(total_price) as total FROM orders WHERE strftime('%Y-%W', created_at) = strftime('%Y-%W', 'now', 'localtime')`).get().total || 0;
    
    // เดือนนี้ (ใช้ strftime %m)
    const month = db.prepare(`SELECT SUM(total_price) as total FROM orders WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')`).get().total || 0;
    
    // ทั้งหมด
    const lastMonth = db.prepare(`
      SELECT SUM(total_price) as total 
      FROM orders 
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'start of month', '-1 month', 'localtime')
    `).get().total || 0;

    // 2. สรุปยอดขายสินค้ากัญชาวันนี้ (แยกตามสายพันธุ์/ชื่อ)
    // ดึงเฉพาะ unit='g' หรือ category='weed'
    const weedSummary = db.prepare(`
      SELECT 
        oi.product_name, 
        oi.strain, 
        SUM(oi.quantity) as total_qty, 
        SUM(oi.total_line_price) as total_sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE date(o.created_at) = date('now', 'localtime')
      AND (oi.strain IS NOT NULL OR oi.product_name IN (SELECT name FROM products WHERE unit = 'g'))
      GROUP BY oi.product_name
      ORDER BY total_qty DESC
    `).all();

    res.json({
      sales: {
        today,
        week,
        month,
        lastMonth
      },
      weedDaily: weedSummary
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};