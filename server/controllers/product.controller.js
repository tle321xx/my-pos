// server/controllers/product.controller.js
const ProductService = require('../services/product.service');

exports.getProducts = (req, res) => {
  try {
    const products = ProductService.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = (req, res) => {
  try {
    const newProduct = ProductService.createProduct(req.body, req.file, req.protocol, req.get('host'));
    res.json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = ProductService.updateProduct(id, req.body, req.file, req.protocol, req.get('host'));
    
    if (updated) {
      res.json({ success: true, product: updated });
    } else {
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = ProductService.deleteProduct(id);
    if (success) {
      res.json({ success: true, message: "Deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};