const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/orders  — create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'customer') {
      return res.status(403).json({ success: false, message: 'Customers only' });
    }
    const { vendorId, vendorName, items, total, paymentMethod, customerLocation } = req.body;
    if (!vendorId || !items || !total || !paymentMethod || !customerLocation) {
      return res.status(400).json({ success: false, message: 'Missing required order fields' });
    }
    const status = paymentMethod === 'UPI' ? 'Payment Submitted' : 'Pending';
    const order = await Order.create({
      customerId: req.user._id,
      customerName: req.user.name,
      customerPhone: req.user.phone,
      customerLocation,
      vendorId,
      vendorName,
      items,
      total,
      paymentMethod,
      status,
    });
    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/orders/customer/:id  — get customer orders
router.get('/customer/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const orders = await Order.find({ customerId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Get customer orders error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/orders/vendor/:id  — get vendor orders
router.get('/vendor/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const orders = await Order.find({ vendorId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Get vendor orders error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/orders/:id/status  — update order status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const { status } = req.body;
    order.status = status;
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/orders/:id/confirm  — vendor confirm payment
router.put('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    order.status = 'Confirmed';
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    console.error('Confirm order error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
