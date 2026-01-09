// server/models/product.model.js

// 1. Mock Database (ข้อมูลชุดเดิมที่คุณต้องการเก็บไว้)
let products = [
  // --- Group 1: Weed ---
  { 
    id: 1, name: 'Purple Punch', price: 450, weight: 1, unit: 'g', 
    category: 'weed', strain: 'Indica', tags: ['top-shelf'],
    image: 'https://img.freepik.com/free-photo/dried-cannabis-buds_23-2151636886.jpg?semt=ais_hybrid',
    active: true,
    // [เพิ่มข้อมูลใหม่]
    thc: 25, 
    ratio: 'Indica 90% / Sativa 10%',
    scent: 'Grape, Berry, Sweet'
  },
  { 
    id: 2, name: 'Sour Diesel', price: 400, weight: 1, unit: 'g', 
    category: 'weed', strain: 'Sativa', tags: [],
    image: 'https://img.freepik.com/free-photo/cannabis-bud-isolated-white-background_1258-109278.jpg',
    active: true,
    // [เพิ่มข้อมูลใหม่]
    thc: 25, 
    ratio: 'Indica 90% / Sativa 10%',
    scent: 'Grape, Berry, Sweet'
  },
  { 
    id: 3, name: 'Runtz', price: 550, weight: 1, unit: 'g', 
    category: 'weed', strain: 'Hybrid', tags: ['special'],
    image: 'https://img.freepik.com/free-photo/close-up-dry-cannabis_23-2151636904.jpg',
    active: true,
    // [เพิ่มข้อมูลใหม่]
    thc: 25, 
    ratio: 'Indica 90% / Sativa 10%',
    scent: 'Grape, Berry, Sweet'
  },
  { 
    id: 4, name: 'Thai Stick', price: 100, weight: 3, unit: 'g', 
    category: 'weed', strain: 'Sativa', tags: ['3g100'],
    image: 'https://img.freepik.com/free-photo/green-dry-cannabis-buds_1150-18451.jpg' ,
    active: true
  },

  // --- Group 2: Instruments ---
  { 
    id: 101, name: 'Grinder', price: 350, unit: 'pcs', category: 'instrument', tags: ['accessory'],
    image: 'https://img.freepik.com/premium-photo/metal-grinder-marijuana-isolated-white-background_1258-25656.jpg',
    active: true
  },
  { 
    id: 103, name: 'Bong Glass', price: 1200, unit: 'pcs', category: 'instrument', tags: ['glass'],
    image: 'https://img.freepik.com/premium-photo/glass-bong-isolated-white-background-smoking-cannabis_1258-109462.jpg',
    active: true
  }
];

// 2. ฟังก์ชันจัดการข้อมูล (CRUD Interface)

const getAll = () => products;

const getById = (id) => products.find(p => p.id === id);

const create = (newProduct) => {
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const productWithId = { ...newProduct, id: newId };
  products.push(productWithId);
  return productWithId;
};

const update = (id, updatedData) => {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedData };
    return products[index];
  }
  return null;
};

const remove = (id) => {
  const initialLength = products.length;
  products = products.filter(p => p.id !== id);
  return products.length < initialLength;
};

module.exports = { getAll, getById, create, update, remove };