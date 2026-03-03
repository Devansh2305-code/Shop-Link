import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Cart({ onCheckout }) {
  const { cart, removeFromCart, updateCartQuantity } = useApp();

  if (cart.length === 0) {
    return (
      <div>
        <h2 className="page-title">🛒 Cart</h2>
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <p>Your cart is empty. Browse shops to add items!</p>
        </div>
      </div>
    );
  }

  // Group by vendor
  const byVendor = cart.reduce((acc, item) => {
    if (!acc[item.vendorId]) {
      acc[item.vendorId] = { vendorName: item.vendorName, items: [] };
    }
    acc[item.vendorId].items.push(item);
    return acc;
  }, {});

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2 className="page-title">🛒 Cart</h2>
      {Object.entries(byVendor).map(([vendorId, group]) => (
        <div key={vendorId} className="card mb-2">
          <div className="card-header">
            <h3 className="card-title">🏪 {group.vendorName}</h3>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item) => (
                <tr key={item.productId}>
                  <td className="fw-bold">{item.name}</td>
                  <td>₹{item.price.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          updateCartQuantity(item.productId, item.vendorId, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span style={{ minWidth: '1.5rem', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          updateCartQuantity(item.productId, item.vendorId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="fw-bold" style={{ color: '#4f46e5' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFromCart(item.productId, item.vendorId)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="text-muted text-sm">Total Amount</div>
            <div className="price-tag">₹{total.toFixed(2)}</div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => onCheckout({ cart, total, byVendor })}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
