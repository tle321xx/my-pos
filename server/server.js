// server/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import Routes
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes'); // (ถ้ามี)
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// *** สำคัญ: เปิดให้เข้าถึงโฟลเดอร์ uploads ผ่าน Browser ได้ ***
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ใช้งาน Routes
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/auth', authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});