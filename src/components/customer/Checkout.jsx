import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { saveOrder, findUserById, generateId } from '../../utils/storage';

const PAYMENT_METHODS = ['UPI', 'Cash on Delivery', 'Card'];

export default function Checkout({ checkoutData, onOrderPlaced }) {
  const { user, clearCartItems } = useApp();
  const { cart, total, byVendor } = checkoutData;
  const [form, setForm] = useState({
    location: '',
    paymentMethod: 'UPI',
  });
  const [upiStep, setUpiStep] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePlaceOrder() {
    setError('');
    if (!form.location.trim()) {
      setError('Please enter your delivery location.');
      return;
    }

    // If UPI, show QR step first
    if (form.paymentMethod === 'UPI' && !upiStep) {
      setUpiStep(true);
      return;
    }

    // Create one order per vendor
    Object.entries(byVendor).forEach(([vendorId, group]) => {
      const vendor = findUserById(vendorId);
      const vendorTotal = group.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const order = {
        id: generateId(),
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        customerLocation: form.location.trim(),
        vendorId,
        vendorName: vendor ? vendor.shopName : group.vendorName,
        items: group.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: vendorTotal,
        paymentMethod: form.paymentMethod,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      saveOrder(order);
    });

    clearCartItems();
    setOrderPlaced(true);
  }

  if (orderPlaced) {
    return (
      <div className="flex-center" style={{ flexDirection: 'column', padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Order Placed Successfully!</h2>
        <p className="text-muted mb-3">
          Your order has been sent to the vendor. You can track it in My Orders.
        </p>
        <button className="btn btn-primary" onClick={onOrderPlaced}>
          View My Orders
        </button>
      </div>
    );
  }

  // UPI payment step
  if (upiStep) {
    const vendorEntries = Object.entries(byVendor);

    return (
      <div>
        <h2 className="page-title">💳 UPI Payment</h2>
        <div className="card" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Pay via UPI</h3>
          <p className="text-muted mb-2">
            {vendorEntries.length > 1
              ? 'Your cart has items from multiple shops. Please pay each vendor separately.'
              : 'Scan the QR code or pay to the UPI ID below.'}
          </p>

          {vendorEntries.map(([vendorId, group]) => {
            const vendor = findUserById(vendorId);
            const vendorTotal = group.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            return (
              <div
                key={vendorId}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                <div className="fw-bold mb-1">🏪 {group.vendorName}</div>
                {vendor && vendor.upiId ? (
                  <>
                    <div className="qr-placeholder mb-2" style={{ margin: '0.5rem auto' }}>
                      {vendor.qrCodeImage ? (
                        <img
                          src={vendor.qrCodeImage}
                          alt={`QR Code for ${vendor.upiId}`}
                          style={{ maxWidth: '180px', maxHeight: '180px', objectFit: 'contain', borderRadius: '0.5rem' }}
                        />
                      ) : (
                        <div>
                          <div style={{ fontSize: '2rem' }}>🔲</div>
                          <div style={{ marginTop: '0.5rem' }}>QR Code for</div>
                          <div className="fw-bold">{vendor.upiId}</div>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: '0.5rem',
                        background: '#f3f4f6',
                        borderRadius: '0.5rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div className="text-sm text-muted">UPI ID</div>
                      <div className="fw-bold">{vendor.upiId}</div>
                    </div>
                  </>
                ) : (
                  <div className="alert alert-info mb-1">
                    Vendor has not set up UPI. Please ask them for payment details.
                  </div>
                )}
                <div className="price-tag">₹{vendorTotal.toFixed(2)}</div>
              </div>
            );
          })}

          <div className="price-tag mb-2">Grand Total: ₹{total.toFixed(2)}</div>
          <p className="text-sm text-muted mb-3">
            After completing the payment(s), click "Confirm Payment" below.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setUpiStep(false)}>
              ← Back
            </button>
            <button className="btn btn-success" onClick={handlePlaceOrder}>
              ✅ Confirm Payment &amp; Place Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">💳 Checkout</h2>

      <div className="grid-2 gap-2">
        <div>
          <div className="card mb-2">
            <div className="card-header">
              <h3 className="card-title">📦 Order Summary</h3>
            </div>
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.vendorId}`}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6' }}
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="fw-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '2px solid #e5e7eb',
              }}
            >
              <span className="fw-bold">Total</span>
              <span className="price-tag">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🚚 Delivery Details</h3>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Delivery Location *</label>
              <textarea
                name="location"
                className="form-control"
                rows={3}
                placeholder="Enter your full delivery address..."
                value={form.location}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={form.paymentMethod === method}
                    onChange={handleChange}
                  />
                  {method === 'UPI' && '📱 '}
                  {method === 'Cash on Delivery' && '💵 '}
                  {method === 'Card' && '💳 '}
                  {method}
                </label>
              ))}
            </div>
            <button className="btn btn-primary btn-full" onClick={handlePlaceOrder}>
              {form.paymentMethod === 'UPI' ? '📱 Pay via UPI →' : '🛍️ Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
