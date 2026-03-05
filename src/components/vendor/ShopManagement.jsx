import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { saveUserToFirestore } from '../../firebase/firestore';

const DELIVERY_MODES = [
  { value: 'instant', label: 'Instant Delivery', desc: 'Items delivered immediately' },
  { value: 'scheduled', label: 'Scheduled Delivery', desc: 'Delivery at a specific time' },
  { value: 'pickup', label: 'Pickup Only', desc: 'Customer picks up from shop' },
];

export default function ShopManagement() {
  const { user, refreshUser } = useApp();
  const [shopOpen, setShopOpen] = useState(user.shopOpen || false);
  const [deliveryMode, setDeliveryMode] = useState(user.deliveryMode || 'instant');
  const [scheduledTime, setScheduledTime] = useState(user.scheduledTime || '');
  const [saved, setSaved] = useState(false);
  const [toggleSaved, setToggleSaved] = useState(false);
  const toggleTimerRef = useRef(null);
  const savedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(toggleTimerRef.current);
      clearTimeout(savedTimerRef.current);
    };
  }, []);

  async function handleToggleShop(e) {
    const newStatus = e.target.checked;
    setShopOpen(newStatus);
    const updated = {
      ...user,
      shopOpen: newStatus,
      deliveryMode,
      scheduledTime: deliveryMode === 'scheduled' ? scheduledTime : '',
    };
    await saveUserToFirestore(user.id, updated);
    refreshUser(user.id);
    setToggleSaved(true);
    clearTimeout(toggleTimerRef.current);
    toggleTimerRef.current = setTimeout(() => setToggleSaved(false), 2000);
  }

  async function handleSave() {
    const updated = {
      ...user,
      shopOpen,
      deliveryMode,
      scheduledTime: deliveryMode === 'scheduled' ? scheduledTime : '',
    };
    await saveUserToFirestore(user.id, updated);
    refreshUser(user.id);
    setSaved(true);
    clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h2 className="page-title">🏪 Shop Management</h2>

      <div className="grid-2 gap-2 mb-3">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Shop Status</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
            <label className="toggle-switch">
              <span className="toggle-input">
                <input
                  type="checkbox"
                  checked={shopOpen}
                  onChange={handleToggleShop}
                />
                <span className="toggle-slider" />
              </span>
              <span className={shopOpen ? 'badge badge-success' : 'badge badge-danger'}>
                {shopOpen ? '🟢 Open' : '🔴 Closed'}
              </span>
            </label>
          </div>
          <p className="text-sm text-muted">
            {shopOpen
              ? 'Your shop is visible to customers and accepting orders.'
              : 'Your shop is hidden from customers.'}
          </p>
          {toggleSaved && (
            <div className="alert alert-success" style={{ marginTop: '0.5rem', padding: '0.4rem 0.75rem' }}>
              ✅ Shop status updated!
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Shop Details</h3>
          </div>
          <table className="table">
            <tbody>
              <tr>
                <td className="text-muted text-sm">Shop Name</td>
                <td className="fw-bold">{user.shopName}</td>
              </tr>
              <tr>
                <td className="text-muted text-sm">Category</td>
                <td>{user.shopCategory}</td>
              </tr>
              <tr>
                <td className="text-muted text-sm">Location</td>
                <td>{user.shopLocation}</td>
              </tr>
              <tr>
                <td className="text-muted text-sm">UPI ID</td>
                <td>{user.upiId || <span className="text-muted">Not set</span>}</td>
              </tr>
              <tr>
                <td className="text-muted text-sm">Phone</td>
                <td>{user.phone}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Delivery Options</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {DELIVERY_MODES.map((mode) => (
            <label
              key={mode.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                border: `2px solid ${deliveryMode === mode.value ? '#4f46e5' : '#e5e7eb'}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                background: deliveryMode === mode.value ? '#f0f0ff' : 'white',
              }}
            >
              <input
                type="radio"
                name="deliveryMode"
                value={mode.value}
                checked={deliveryMode === mode.value}
                onChange={() => setDeliveryMode(mode.value)}
                style={{ marginTop: '0.2rem' }}
              />
              <div>
                <div className="fw-bold">{mode.label}</div>
                <div className="text-sm text-muted">{mode.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {deliveryMode === 'scheduled' && (
          <div className="form-group mt-2">
            <label className="form-label">Scheduled Delivery Time</label>
            <input
              type="time"
              className="form-control"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
        )}
      </div>

      {saved && (
        <div className="alert alert-success">✅ Shop settings saved successfully!</div>
      )}

      <button className="btn btn-primary" onClick={handleSave}>
        💾 Save Settings
      </button>
    </div>
  );
}
