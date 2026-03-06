const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, type, shopName, shopLocation, shopCategory, upiId, qrCodeImage } = req.body;

    if (!name || !email || !phone || !password || !type) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (type === 'vendor' && (!shopName || !shopLocation || !shopCategory)) {
      return res.status(400).json({ success: false, message: 'Missing vendor shop fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const userData = { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password, type };
    if (type === 'vendor') {
      Object.assign(userData, {
        shopName: shopName.trim(),
        shopLocation: shopLocation.trim(),
        shopCategory,
        upiId: upiId ? upiId.trim() : '',
        qrCodeImage: qrCodeImage || '',
        shopOpen: false,
        deliveryMode: 'instant',
      });
    }

    const user = await User.create(userData);
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    // Return user without password (toJSON removes it)
    res.json({ success: true, token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // JWT logout is handled client-side by removing the token
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
