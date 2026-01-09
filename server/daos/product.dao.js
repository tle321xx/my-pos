// server/daos/product.dao.js
const db = require('../config/database');

// DAO มีหน้าที่แค่ยิง SQL และคืนค่า Raw Data
const getAll = () => {
  const stmt = db.prepare('SELECT * FROM products ORDER BY id DESC');
  return stmt.all();
};

const getById = (id) => {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  return stmt.get(id);
};

const create = (p) => {
  const stmt = db.prepare(`
    INSERT INTO products (name, price, weight, unit, category, strain, tags, image, active, thc, ratio, scent)
    VALUES (@name, @price, @weight, @unit, @category, @strain, @tags, @image, @active, @thc, @ratio, @scent)
  `);
  const info = stmt.run(p);
  return getById(info.lastInsertRowid);
};

const update = (p) => {
  const stmt = db.prepare(`
    UPDATE products 
    SET name=@name, price=@price, weight=@weight, unit=@unit, 
        category=@category, strain=@strain, tags=@tags, image=@image, 
        active=@active, thc=@thc, ratio=@ratio, scent=@scent
    WHERE id = @id
  `);
  const info = stmt.run(p);
  return info.changes > 0 ? getById(p.id) : null;
};

const remove = (id) => {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
};

module.exports = { getAll, getById, create, update, remove };