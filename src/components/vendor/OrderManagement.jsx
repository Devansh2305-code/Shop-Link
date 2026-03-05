import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getOrdersByVendorFromFirestore,
  saveOrderToFirestore,
} from '../../firebase/firestore';

const STATUS_OPTIONS = ['Pending', 'Payment Submitted', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  'Pending': 'badge-warning',
  'Payment Submitted': 'badge-info',
  'Confirmed': 'badge-info',
  'Preparing': 'badge-info',
  'Out for Delivery': 'badge-warning',
  'Delivered': 'badge-success',
  'Cancelled': 'badge-danger',
};

export default function OrderManagement() {
  const { user } = useApp();
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const all = await getOrdersByVendorFromFirestore(user.id);
    setOrders(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }

  async function handleStatusChange(order, status) {
    const updated = { ...order, status };
    await saveOrderToFirestore(updated);
    await loadOrders();
    if (selected && selected.id === order.id) {
      setSelected(updated);
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString();
  }

  return (
    <div>
      <h2 className="page-title">📋 Order Management</h2>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No orders yet. Open your shop to start receiving orders!</p>
        </div>
      ) : (
        <div className="grid-2">
          <div>
            {(() => {
              const pendingCount = orders.filter((o) => o.status === 'Payment Submitted').length;
              return (
                <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#374151' }}>
                  All Orders ({orders.length})
                  {pendingCount > 0 && (
                    <span
                      className="badge badge-danger"
                      style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}
                    >
                      {pendingCount} needs confirmation
                    </span>
                  )}
                </div>
              );
            })()}
            {orders.map((order) => (
              <div
                key={order.id}
                className="card mb-2"
                style={{
                  cursor: 'pointer',
                  border: selected?.id === order.id
                    ? '2px solid #4f46e5'
                    : order.status === 'Payment Submitted'
                    ? '2px solid #f59e0b'
                    : '1px solid #e5e7eb',
                }}
                onClick={() => setSelected(order)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="fw-bold">{order.customerName}</div>
                    <div className="text-sm text-muted">{formatDate(order.createdAt)}</div>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: '#4f46e5', textAlign: 'right' }}>
                      ₹{order.total.toFixed(2)}
                    </div>
                    <span className={`badge ${STATUS_COLORS[order.status] || 'badge-secondary'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                {order.status === 'Payment Submitted' && (
                  <div className="text-sm" style={{ color: '#d97706', marginTop: '0.4rem', fontWeight: 600 }}>
                    ⚠️ Payment received? Click to confirm.
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            {selected ? (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Order Details</h3>
                  <button className="modal-close" onClick={() => setSelected(null)}>×</button>
                </div>
                <table className="table">
                  <tbody>
                    <tr>
                      <td className="text-muted text-sm">Customer</td>
                      <td className="fw-bold">{selected.customerName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted text-sm">Phone</td>
                      <td>{selected.customerPhone || '—'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted text-sm">Location</td>
                      <td>{selected.customerLocation || '—'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted text-sm">Payment</td>
                      <td>
                        <span className="badge badge-info">{selected.paymentMethod}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted text-sm">Placed At</td>
                      <td>{formatDate(selected.createdAt)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ margin: '1rem 0 0.5rem', fontWeight: 700 }}>Items:</div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.items.map((item) => (
                      <tr key={item.productId}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ fontWeight: 700 }}>Total</td>
                      <td className="fw-bold" style={{ color: '#4f46e5' }}>
                        ₹{selected.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div style={{ marginTop: '1rem' }}>
                  {selected.status === 'Payment Submitted' && (
                    <button
                      className="btn btn-success btn-full"
                      style={{ marginBottom: '0.75rem' }}
                      onClick={() => handleStatusChange(selected, 'Confirmed')}
                    >
                      ✅ Confirm Payment Received
                    </button>
                  )}
                  <label className="form-label">Update Status</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleStatusChange(selected, s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">👆</div>
                <p>Click an order to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
