// server/controllers/product.controller.js
const ProductService = require('../services/product.service');
const logger = require('../services/log.service');
const db = require('../config/database');

exports.getProducts = (req, res) => {
  try {
    const products = ProductService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// เพิ่ม async ตรงนี้
exports.createProduct = async (req, res) => {
  try {
    // 1. ย้าย Log มาไว้บนสุดเพื่อเช็คว่าเข้ามาในฟังก์ชันจริงไหม
    console.log("Create Product Hit! req.user =", req.user); 

    // 2. เพิ่ม await (เพราะปกติการลง DB ต้องรอ)
    const newProduct = await ProductService.createProduct(req.body, req.file, req.protocol, req.get('host'));
    
    // ... โค้ดส่วนจัดการ User ...
    const userId = req.user ? req.user.id : 0;
    const username = req.user ? req.user.name : 'System';
    
    logger.log(userId, username, 'PRODUCT_CREATED', `สร้างสินค้าชื่อ: ${newProduct.name}`, req);
    res.json({ success: true, product: newProduct });

  } catch (error) {
    console.error("Error in createProduct:", error); // เพิ่ม Log Error ตรงนี้ด้วย
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = (req, res) => {
  try {
    console.log("Update Product Hit! req.user =", req.user); 
    const id = parseInt(req.params.id);
    const updated = ProductService.updateProduct(id, req.body, req.file, req.protocol, req.get('host'));
    
    if (updated) {
      logger.log(req.user.id, req.user.name, 'PRODUCT_UPDATED', `อัพเดทสินค้า ID: ${id}`, req);
      res.json({ success: true, product: updated });
    } else {
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = (req, res) => {
  try {
    console.log("Delete Product Hit! req.user =", req.user); 
    const id = parseInt(req.params.id);
    const success = ProductService.deleteProduct(id);
    if (success) {
      const userId = req.user ? req.user.id : 0;
      const username = req.user ? req.user.name : 'System';
      
      logger.log(userId, username, 'PRODUCT_DELETE', `ลบสินค้า ID: ${id}`, req);
      res.json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStock = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  
  try {
    // 1. ดึงสต็อกเก่ามาก่อน
    const product = db.prepare('SELECT name, stock FROM products WHERE id = ?').get(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // 2. คำนวณสต็อกใหม่
    const newStock = (product.stock || 0) + parseFloat(amount);
    
    // 3. อัปเดตลง DB
    db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, id);

    // 4. บันทึก Log
    // ใช้ req.user?.id เพื่อกัน Error กรณีระบบ Auth มีปัญหา
    logger.log(req.user?.id || 0, req.user?.username || 'System', 'RESTOCK', 
      `เติมสต็อก ${product.name}: ${product.stock} -> ${newStock} (${amount > 0 ? '+' : ''}${amount})`, req);

    res.json({ success: true, newStock });
  } catch (err) {
    console.error(err); // ปริ้น Error ลง Terminal ด้วยจะได้เห็นชัดๆ
    res.status(500).json({ success: false, message: err.message });
  }

};