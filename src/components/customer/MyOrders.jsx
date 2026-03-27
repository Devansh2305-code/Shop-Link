import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import firebaseService from '../../services/firebase';

const STATUS_COLORS = {
  'Pending': 'badge-warning',
  'Payment Submitted': 'badge-info',
  'Confirmed': 'badge-info',
  'Preparing': 'badge-info',
  'Out for Delivery': 'badge-warning',
  'Delivered': 'badge-success',
  'Cancelled': 'badge-danger',
};

export default function MyOrders() {
  const { user } = useApp();
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    firebaseService.getCustomerOrders(user._id).then((data) => {
      setOrders(data);
    });
  }, [user._id]);

  function formatDate(iso) {
    return new Date(iso).toLocaleString();
  }

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="page-title">📋 My Orders</h2>
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No orders yet. Start shopping!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">📋 My Orders</h2>
      <div className="grid-2">
        <div>
          {orders.map((order) => (
            <div
              key={order._id}
              className="card mb-2"
              style={{
                cursor: 'pointer',
                border: selected?._id === order._id ? '2px solid #4f46e5' : '1px solid #e5e7eb',
              }}
              onClick={() => setSelected(order)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="fw-bold">🏪 {order.vendorName}</div>
                  <div className="text-sm text-muted">{formatDate(order.createdAt)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="fw-bold" style={{ color: '#4f46e5' }}>
                    ₹{order.total.toFixed(2)}
                  </div>
                  <span className={`badge ${STATUS_COLORS[order.status] || 'badge-secondary'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
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
                    <td className="text-muted text-sm">Shop</td>
                    <td className="fw-bold">{selected.vendorName}</td>
                  </tr>
                  <tr>
                    <td className="text-muted text-sm">Status</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[selected.status] || 'badge-secondary'}`}>
                        {selected.status}
                      </span>
                      {selected.status === 'Payment Submitted' && (
                        <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                          ⏳ Awaiting shop confirmation
                        </div>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted text-sm">Payment</td>
                    <td>{selected.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td className="text-muted text-sm">Delivery to</td>
                    <td>{selected.customerLocation}</td>
                  </tr>
                  <tr>
                    <td className="text-muted text-sm">Placed</td>
                    <td>{formatDate(selected.createdAt)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Items:</div>
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
                    <td colSpan={2} className="fw-bold">Total</td>
                    <td className="fw-bold" style={{ color: '#4f46e5' }}>
                      ₹{selected.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👆</div>
              <p>Click an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
