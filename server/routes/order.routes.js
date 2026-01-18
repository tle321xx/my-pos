const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const checkAuth = require('../middlewares/auth.middleware');

// เส้นทางเฉพาะ (Specific Routes) ต้องมาก่อน
router.get('/recent', checkAuth, orderController.getRecentOrders);

router.post('/', checkAuth, orderController.createOrder);
router.get('/', checkAuth, orderController.getAllOrders);
router.get('/:id', checkAuth, orderController.getOrderById); // อันนี้ต้องอยู่ล่างสุด

module.exports = router;