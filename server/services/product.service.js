// server/services/product.service.js
const ProductDAO = require('../daos/product.dao');

// Helper: แปลงข้อมูลจาก DB (เช่น active 1 -> true) เพื่อส่งกลับไปให้ Controller
const formatProductOutput = (row) => {
  if (!row) return null;
  return {
    ...row,
    active: row.active === 1,
    tags: row.tags ? JSON.parse(row.tags) : []
  };
};

// Helper: เตรียมข้อมูลก่อนลง DB (เช่น true -> 1)
const prepareProductInput = (data, file, serverUrl) => {
  return {
    name: data.name,
    price: parseFloat(data.price),
    // Logic: ถ้ามีไฟล์ใหม่ใช้ไฟล์ใหม่ ถ้าไม่มีใช้ของเดิม (ต้องจัดการใน update อีกที)
    image: file ? `${serverUrl}/uploads/${file.filename}` : (data.image || ''),
    category: data.category,
    strain: data.strain || null,
    unit: data.unit,
    weight: data.unit === 'g' ? parseFloat(data.weight) : 0,
    active: data.active === 'true' || data.active === true ? 1 : 0, // แปลงเป็น Int
    tags: JSON.stringify(data.tags || []),
    thc: data.thc ? parseFloat(data.thc) : 0,
    ratio: data.ratio || '',
    scent: data.scent || ''
  };
};

exports.getAllProducts = () => {
  const products = ProductDAO.getAll();
  return products.map(formatProductOutput);
};

exports.createProduct = (body, file, protocol, host) => {
  const serverUrl = `${protocol}://${host}`;
  
  // เรียกใช้ Logic เตรียมข้อมูล
  const productData = prepareProductInput({ ...body, active: true }, file, serverUrl);
  
  const newProduct = ProductDAO.create(productData);
  return formatProductOutput(newProduct);
};

exports.updateProduct = (id, body, file, protocol, host) => {
  const serverUrl = `${protocol}://${host}`;
  
  // 1. เช็คว่ามีสินค้าไหม
  const oldProduct = ProductDAO.getById(id);
  if (!oldProduct) return null;

  // 2. เตรียมข้อมูล (Logic: ถ้าไม่ส่งรูปใหม่มา ให้ใช้รูปเดิม)
  const currentImage = file ? `${serverUrl}/uploads/${file.filename}` : oldProduct.image;
  
  // ผสมข้อมูลเก่า + ข้อมูลใหม่
  const productData = {
    ...oldProduct, // เอาค่าเก่ามาตั้งต้น
    ...body,       // ทับด้วยค่าใหม่ที่ส่งมา
    id: id,        // ย้ำ ID
    price: parseFloat(body.price),
    weight: body.unit === 'g' ? parseFloat(body.weight) : 0,
    active: body.active !== undefined ? (body.active ? 1 : 0) : oldProduct.active,
    image: currentImage,
    tags: JSON.stringify(body.tags || []) // ถ้ามี tag ต้องแปลง
  };

  const updated = ProductDAO.update(productData);
  return formatProductOutput(updated);
};

exports.deleteProduct = (id) => {
  return ProductDAO.remove(id);
};