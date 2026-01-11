// server/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// 1. Import Routes เดิม
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// 2. [เพิ่มใหม่] Import Controllers และ Upload Middleware
const userController = require('./controllers/user.controller');
const customerController = require('./controllers/customer.controller');
const upload = require('./middlewares/upload.middleware'); 

const checkAuth = require('./middlewares/auth.middleware');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// เปิดให้เข้าถึงโฟลเดอร์ uploads ผ่าน Browser
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. ใช้งาน Routes เดิม
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/auth', authRoutes);

// 4. [เพิ่มใหม่] Routes สำหรับ Users และ Customers
// สังเกตว่าต้องมี upload.single('imageFile') เพื่อให้รับ FormData (รูป+ข้อความ) ได้
app.get('/api/users', checkAuth, userController.getAllUsers);
app.post('/api/users', checkAuth, upload.single('imageFile'), userController.createUser); // <--- จุดสำคัญที่แก้ Error
app.delete('/api/users/:id', checkAuth, userController.deleteUser);

app.get('/api/customers', checkAuth, customerController.getAllCustomers);
app.post('/api/customers', checkAuth, upload.single('imageFile'), customerController.createCustomer); // <--- จุดสำคัญที่แก้ Error
app.get('/api/customers/:id/history', customerController.getCustomerHistory);

app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes); // อันนี้มีอยู่แล้ว รองรับ /recent ที่เพิ่งเติมไป
app.use('/api/auth', authRoutes);

// [เพิ่ม] Routes ของ Dashboard
app.use('/api/dashboard', dashboardRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});