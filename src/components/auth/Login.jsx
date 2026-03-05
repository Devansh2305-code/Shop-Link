import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { firebaseSignIn } from '../../firebase/auth';
import { findUserByEmailInFirestore } from '../../firebase/firestore';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const history = useHistory();
  const { login } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const credential = await firebaseSignIn(
        form.email.trim().toLowerCase(),
        form.password
      );
      const profile = await findUserByEmailInFirestore(
        form.email.trim().toLowerCase()
      );
      if (!profile) {
        setError('Account data not found. Please contact support.');
        setLoading(false);
        return;
      }
      login(profile);
      if (profile.type === 'vendor') {
        history.push('/vendor');
      } else {
        history.push('/customer');
      }
    } catch (err) {
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand-logo">🛍️</div>
        <div className="brand-name">ShopLink</div>
        <h2>Welcome Back</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
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
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <hr className="divider" />
        <p className="text-center text-sm text-muted">New to ShopLink?</p>
        <div className="grid-2 gap-1">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => history.push('/register/customer')}
          >
            🛒 Customer
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => history.push('/register/vendor')}
          >
            🏪 Vendor
          </button>
        </div>
      </div>
    </div>
  );
}
