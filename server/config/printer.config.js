// server/config/printer.config.js
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

// ตั้งค่า Printer
let printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: '\\\\localhost\\racha_pos', 
  driver: require('node-thermal-printer').driver,
  
  // ⚠️ แก้ไขจุดนี้: ใส่ // ข้างหน้า หรือลบบรรทัดนี้ทิ้งไปเลย
  // characterSet: 'PC874', 
  
  removeSpecialCharacters: false
});

module.exports = printer;