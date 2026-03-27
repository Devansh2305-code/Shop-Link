import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import firebaseService from '../../services/firebase';
import { useApp } from '../../context/AppContext';

export default function CustomerRegister() {
  const history = useHistory();
  const { login } = useApp();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const { name, email, phone, password, confirmPassword } = form;

    if (!name || !email || !phone || !password) {
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
        password,
        type: 'customer',
      });
      if (!result.success) {
        setError(result.message || 'Registration failed.');
        return;
      }
      // User is already authenticated via Firebase after register
      // Manually set user in context
      await login(email.trim().toLowerCase(), password);
      history.push('/customer');
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand-logo">🛒</div>
        <h2>Customer Sign Up</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
            />
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
            <label className="form-label">Contact Number *</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
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
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
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
        <p className="text-center text-sm text-muted">
          Are you a vendor?{' '}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => history.push('/register/vendor')}
          >
            Vendor Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
