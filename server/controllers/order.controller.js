// server/controllers/order.controller.js
const printer = require('../config/printer.config');
const db = require('../config/database'); // <--- อย่าลืมบรรทัดนี้ ต้อง import database มาด้วย

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