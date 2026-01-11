// server/controllers/order.controller.js
const printer = require('../config/printer.config');
const db = require('../config/database'); // <--- อย่าลืมบรรทัดนี้ ต้อง import database มาด้วย
const logger = require('../services/log.service');

exports.createOrder = async (req, res) => {
  // รับค่า items, total, customer, paymentMethod จากหน้าบ้าน
  const { items, total, customer, paymentMethod } = req.body; 

  try {
    // --- 1. บันทึกลง Database ---
    
    // สร้างเลขที่ใบเสร็จ (Format: RW-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    
    // ดึงออเดอร์ล่าสุดเพื่อหา running number
    const lastOrder = db.prepare('SELECT id FROM orders ORDER BY id DESC LIMIT 1').get();
    const runningNo = (lastOrder ? lastOrder.id + 1 : 1).toString().padStart(4, '0');
    const receiptNo = `RW-${dateStr}-${runningNo}`;

    // เตรียมคำสั่ง SQL
    const insertOrder = db.prepare(`
      INSERT INTO orders (receipt_no, customer_id, total_price, payment_method)
      VALUES (?, ?, ?, ?)
    `);
    
    // *** [จุดที่เกิด Error แก้ตรงนี้ครับ] ***
    // แยกบรรทัดออกมาให้ชัดเจน ไม่ให้โดน Comment บัง
    const orderResult = insertOrder.run(
      receiptNo, 
      customer?.id || null, 
      total, 
      paymentMethod || 'cash'
    );
    
    // ตอนนี้ orderResult จะมีค่าแล้ว บรรทัดนี้จะทำงานได้
    const newOrderId = orderResult.lastInsertRowid;

    // บันทึกรายการสินค้า (Loop insert)
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, strain, quantity, price_per_unit, total_line_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    items.forEach(item => {
      insertItem.run(
        newOrderId, 
        item.id, 
        item.name, 
        item.strain || null, 
        item.quantity || 1, 
        item.price, 
        (item.price * (item.quantity || 1))
      );
    });

    console.log(`Order Saved: ${receiptNo}`);

    // สมมติว่า req.user มาจาก Token (เดี๋ยวเราต้องแก้ Middleware ให้แปะ user มาด้วย)
    const userId = req.user ? req.user.id : 0; 
    const username = req.user ? req.user.name : 'System';

    logger.log(userId, username, 'SALE', `เปิดบิลเลขที่ ${receiptNo} ยอด ${total} บาท`, req);

    // --- 2. สั่งพิมพ์ใบเสร็จ (โค้ดเดิม) ---
    printer.clear();
    printer.alignCenter();
    printer.println("Racha Weed");
    printer.println("Cannabis Dispensary");
    printer.println("--------------------------------");
    
    printer.alignLeft();
    printer.println(`Receipt ID: ${receiptNo}`);
    printer.println(`Date: ${new Date().toLocaleString('th-TH')}`);
    printer.println("--------------------------------");

    // พิมพ์รายการสินค้า
    printer.tableCustom([
      { text: "Item", align: "LEFT", width: 0.50 },
      { text: "Qty", align: "CENTER", width: 0.15 },
      { text: "Amt", align: "RIGHT", width: 0.35 }
    ]);

    items.forEach(item => {
      printer.tableCustom([
        { text: item.name, align: "LEFT", width: 0.50 },
        { text: `${item.quantity}`, align: "CENTER", width: 0.15 },
        { text: (item.price * (item.quantity || 1)).toFixed(2), align: "RIGHT", width: 0.35 }
      ]);
    });

    printer.println("--------------------------------");
    printer.alignRight();
    printer.println(`TOTAL: ${total} THB`);
    printer.alignCenter();
    printer.println("--------------------------------");
    printer.println("Thank you");
    //printer.openCashDrawer();
    printer.cut();

    try {
      await printer.execute(); 
      console.log("Print Command Sent");
      res.json({ success: true, receiptNo });
    } catch (error) {
      console.error("Printer Error:", error);
      // ถึงพิมพ์ไม่ออก แต่บันทึกลง DB สำเร็จแล้ว ก็ถือว่าขายได้
      res.json({ success: true, receiptNo, warning: "Printer connection failed" });
    }

  } catch (dbError) {
    console.error("Database Error:", dbError);
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
};

exports.getRecentOrders = (req, res) => {
  try {
    // ดึง 5 รายการล่าสุด เรียงจาก id มากไปน้อย (ล่าสุดอยู่บน)
    const orders = db.prepare(`
      SELECT id, receipt_no, total_price, created_at, payment_method 
      FROM orders 
      ORDER BY id DESC 
      LIMIT 5
    `).all();

    // จัด Format วันที่และเวลาให้สวยงามก่อนส่งกลับ (Optional)
    const formattedOrders = orders.map(o => ({
      id: o.id,             // <--- [แก้] ส่ง ID จริงๆ ที่เป็นตัวเลข
      receiptNo: o.receipt_no,
      time: new Date(o.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      staff: 'System', // (ถ้าในอนาคตเก็บ user_id ใน orders ค่อยมาจอยตาราง users)
      items: 0, // (ถ้าอยากได้จำนวนชิ้น ต้อง count จาก order_items เพิ่ม)
      total: o.total_price
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = (req, res) => {
  try {
    // 1. รับค่าจาก Frontend (ถ้าไม่ส่งมา ให้ใช้ค่า Default)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // รับค่า Sort (ป้องกัน SQL Injection โดยการเช็คค่าที่ส่งมา)
    const validSortCols = ['id', 'receipt_no', 'total_price', 'created_at', 'payment_method'];
    const sortBy = validSortCols.includes(req.query.sortBy) ? req.query.sortBy : 'id';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    // 2. Query ข้อมูล
    const orders = db.prepare(`
      SELECT o.*, u.name as staff_name 
      FROM orders o
      LEFT JOIN users u ON o.staff_name = u.username -- (สมมติว่ามีการเก็บ staff)
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    // 3. นับจำนวนทั้งหมด (เพื่อทำ Pagination)
    const countResult = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const totalItems = countResult.count;

    res.json({
      data: orders,
      totalItems: totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = (req, res) => {
  try {
    const { id } = req.params;

    // 1. ดึงข้อมูลหัวบิล + Join ตารางลูกค้า
    const order = db.prepare(`
      SELECT o.*, 
             c.name as customer_name, 
             c.phone as customer_phone, 
             c.line_id as customer_line
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `).get(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 2. ดึงรายการสินค้าในบิลนั้น
    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).all(id);

    // ส่งข้อมูลกลับไปเป็นก้อนเดียว
    res.json({
      ...order,
      items: items
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};