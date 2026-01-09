// server/routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// 1. นำเข้า Middleware ที่เราเพิ่งสร้าง
const upload = require('../middlewares/upload.middleware');

router.get('/', productController.getProducts);

// 2. เรียกใช้แบบสั้นๆ สะอาดตา
router.post('/', upload.single('imageFile'), productController.createProduct);
router.put('/:id', upload.single('imageFile'), productController.updateProduct);

router.delete('/:id', productController.deleteProduct);

module.exports = router;