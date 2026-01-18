const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Routes เดิม
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const authRoutes = require('./routes/auth.routes');
// [ลบ] const dashboardRoutes = ... (ไม่ต้องใช้)

// Controllers
const userController = require('./controllers/user.controller');
const customerController = require('./controllers/customer.controller');
const dashboardController = require('./controllers/dashboard.controller'); // [ต้องมีไฟล์นี้จากข้อ 1]

// Middlewares
const upload = require('./middlewares/upload.middleware'); 
const checkAuth = require('./middlewares/auth.middleware');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ใช้งาน Routes
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/auth', authRoutes);

// Users APIs
app.get('/api/users', checkAuth, userController.getAllUsers);
app.post('/api/users', checkAuth, upload.single('imageFile'), userController.createUser);
app.put('/api/users/:id', checkAuth, upload.single('imageFile'), userController.updateUser);
app.delete('/api/users/:id', checkAuth, userController.deleteUser);

// Customers APIs
app.get('/api/customers', checkAuth, customerController.getAllCustomers);
app.post('/api/customers', checkAuth, upload.single('imageFile'), customerController.createCustomer);
app.put('/api/customers/:id', checkAuth, upload.single('imageFile'), customerController.updateCustomer);
app.get('/api/customers/:id/history', checkAuth, customerController.getCustomerHistory);

// Dashboard API (ใช้ Controller ตรงๆ ไม่ต้องผ่าน Route File)
app.get('/api/dashboard', checkAuth, dashboardController.getStats);
app.get('/api/dashboard/charts', checkAuth, dashboardController.getChartData);
app.get('/api/dashboard/summary', checkAuth, dashboardController.getSummary);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});