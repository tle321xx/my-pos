const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const checkAuth = require('../middlewares/auth.middleware');

// เส้นทางเฉพาะ (Specific Routes) ต้องมาก่อน
router.get('/recent', checkAuth, orderController.getRecentOrders);
router.get('/', checkAuth, orderController.getAllOrders); // (API ที่ทำไปรอบที่แล้ว)

// เส้นทางรับ Parameter (Dynamic Routes) ต้องอยู่หลังสุด
router.get('/:id', checkAuth, orderController.getOrderById); // <--- [เพิ่มบรรทัดนี้]
router.post('/', checkAuth, orderController.createOrder);

module.exports = router;