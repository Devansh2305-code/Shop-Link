const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/users  — get all vendors (for customer shop browsing)
router.get('/', async (req, res) => {
  try {
    const vendors = await User.find({ type: 'vendor' }).select('-password');
    res.json({ success: true, users: vendors });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/:id  — update user profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const allowed = ['name', 'phone', 'deliveryMode', 'scheduledTime'];
    // Vendor-only fields
    if (req.user.type === 'vendor') {
      allowed.push('shopName', 'shopLocation', 'shopCategory', 'upiId', 'qrCodeImage');
    }
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/:id/shop-status  — toggle shop open/closed
router.put('/:id/shop-status', authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const { shopOpen, deliveryMode, scheduledTime } = req.body;
    const updates = {};
    if (shopOpen !== undefined) updates.shopOpen = shopOpen;
    if (deliveryMode !== undefined) updates.deliveryMode = deliveryMode;
    if (scheduledTime !== undefined) updates.scheduledTime = scheduledTime;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Shop status error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
