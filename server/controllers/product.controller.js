// server/controllers/product.controller.js
const ProductService = require('../services/product.service');
const logger = require('../services/log.service');

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