// server/controllers/auth.controller.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../services/log.service");

// Secret Key สำหรับสร้าง Token (ควรเก็บใน .env แต่เพื่อความง่ายเราใส่ตรงนี้ก่อน)
const JWT_SECRET = "racha-weed-secret-key-2026";

exports.login = (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. ค้นหา User จาก Database
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "ไม่พบผู้ใช้งานนี้" });
    }

    // 2. ตรวจสอบรหัสผ่าน (เทียบ Hash)
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      logger.log(0, username, "LOGIN_FAIL", "พยายามเข้าสู่ระบบแต่รหัสผิด", req);
      return res
        .status(401)
        .json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });
    } else {
      logger.log(user.id, user.username, "LOGIN", "เข้าสู่ระบบสำเร็จ", req);
    }

    // 3. สร้าง Token (ตั๋วเข้างาน)
    // ฝังข้อมูล id, role, name เข้าไปใน Token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" } // Token อายุ 24 ชั่วโมง
    );

    // 4. บันทึก Log ว่า Login สำเร็จ (Optional: ถ้าทำ table logs แล้ว)
    try {
      const insertLog = db.prepare(
        "INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)"
      );
      insertLog.run(user.id, "LOGIN", "User logged in successfully", req.ip);
    } catch (logErr) {
      console.error("Log Error:", logErr);
    }

    // 5. ส่ง Token กลับไปให้หน้าบ้าน
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
