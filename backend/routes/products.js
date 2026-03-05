const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/products  — all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/products/vendor/:id  — products by vendor
router.get('/vendor/:id', async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.id });
    res.json({ success: true, products });
  } catch (err) {
    console.error('Get vendor products error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/products  — create product (vendor only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'vendor') {
      return res.status(403).json({ success: false, message: 'Vendors only' });
    }
    const { name, description, price, stock, colors, category, image } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Name, price and stock are required' });
    }
    const product = await Product.create({
      vendorId: req.user._id,
      name: name.trim(),
      description: (description || '').trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      colors: colors || [],
      category: (category || '').trim() || req.user.shopCategory,
      image: image || '',
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/products/:id  — update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const allowed = ['name', 'description', 'price', 'stock', 'colors', 'category', 'image'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/products/:id  — delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
