import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import firebaseService from '../../services/firebase';
import { useApp } from '../../context/AppContext';
import ImageUpload from '../shared/ImageUpload';

const SHOP_CATEGORIES = [
  'Mobile Accessories',
  'Clothing & Apparel',
  'General Store',
  'Electronics',
  'Food & Grocery',
  'Books & Stationery',
  'Health & Pharmacy',
  'Beauty & Personal Care',
  'Sports & Fitness',
  'Home & Furniture',
  'Other',
];

export default function VendorRegister() {
  const history = useHistory();
  const { login } = useApp();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    shopName: '',
    shopLocation: '',
    shopCategory: '',
    upiId: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const {
      name,
      email,
      phone,
      shopName,
      shopLocation,
      shopCategory,
      password,
      confirmPassword,
    } = form;

    if (
      !name ||
      !email ||
      !phone ||
      !shopName ||
      !shopLocation ||
      !shopCategory ||
      !password
    ) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await firebaseService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        shopName: shopName.trim(),
        shopLocation: shopLocation.trim(),
        shopCategory,
        upiId: form.upiId.trim(),
        qrCodeImage,
        password,
        type: 'vendor',
      });
      if (!result.success) {
        setError(result.message || 'Registration failed.');
        return;
      }
      await login(email.trim().toLowerCase(), password);
      history.push('/vendor');
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand-logo">🏪</div>
        <h2>Vendor Sign Up</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Shop Name *</label>
            <input
              type="text"
              name="shopName"
              className="form-control"
              placeholder="My Awesome Shop"
              value={form.shopName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Shop Location *</label>
            <input
              type="text"
              name="shopLocation"
              className="form-control"
              placeholder="123, Main Street, City"
              value={form.shopLocation}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Shop Category *</label>
            <select
              name="shopCategory"
              className="form-select"
              value={form.shopCategory}
              onChange={handleChange}
            >
              <option value="">Select category...</option>
              {SHOP_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">UPI ID (for payments)</label>
            <input
              type="text"
              name="upiId"
              className="form-control"
              placeholder="yourname@upi"
              value={form.upiId}
              onChange={handleChange}
            />
          </div>
          <ImageUpload
            label="UPI QR Code Image (optional)"
            value={qrCodeImage}
            onChange={setQrCodeImage}
            placeholder="Upload your UPI QR code for customer payments"
          />
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Vendor Account'}
          </button>
        </form>
        <p className="text-center text-sm text-muted mt-2">
          Already have an account?{' '}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => history.push('/login')}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
