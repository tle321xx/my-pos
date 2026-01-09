const multer = require('multer');
const path = require('path');

// ตั้งค่าที่เก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // เก็บในโฟลเดอร์ uploads (ต้องมั่นใจว่ามีโฟลเดอร์ server/uploads อยู่จริง)
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // ตั้งชื่อไฟล์: เวลาปัจจุบัน + นามสกุลเดิม
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// เพิ่มตัวกรองไฟล์ (File Filter) เพื่อความปลอดภัย
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // ยอมรับไฟล์
  } else {
    cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น!'), false); // ปฏิเสธ
  }
};

const uploadMiddleware = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // จำกัดขนาด 5MB
});

module.exports = uploadMiddleware;