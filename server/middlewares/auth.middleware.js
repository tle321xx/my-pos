// server/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'racha-weed-secret-key-2026'; // ต้องตรงกับที่ใช้ใน auth.controller.js

module.exports = (req, res, next) => {
  try {
    // 1. ดึง Token จาก Header (ส่งมาในรูปแบบ: "Bearer <token>")
    const token = req.headers.authorization.split(" ")[1];
    
    // 2. ถ้าไม่มี Token ให้ไล่กลับไป
    if (!token) {
      return res.status(401).json({ message: "Auth failed: No token provided" });
    }

    // 3. ตรวจสอบ Token ว่าถูกต้องไหม
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 4. ถ้าผ่าน: แปะข้อมูล user ลงใน req เพื่อให้ Controller ใช้งานต่อได้
    req.user = decoded; 
    
    next(); // ปล่อยผ่านไปทำขั้นตอนถัดไป (Controller)

  } catch (error) {
    // ถ้า Token หมดอายุ หรือปลอมแปลง
    return res.status(401).json({ message: "Auth failed: Invalid token" });
  }
};