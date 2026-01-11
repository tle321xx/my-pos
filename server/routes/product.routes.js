// server/routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const upload = require('../middlewares/upload.middleware');
const checkAuth = require('../middlewares/auth.middleware');

router.get('/',checkAuth, productController.getProducts);

// 2. เรียกใช้แบบสั้นๆ สะอาดตา
router.post('/',checkAuth, upload.single('imageFile'), productController.createProduct);
router.put('/:id',checkAuth, upload.single('imageFile'), productController.updateProduct);

router.delete('/:id', checkAuth, productController.deleteProduct);

module.exports = router;