import React from 'react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { user, logout, cart } = useApp();
  const history = useHistory();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function handleLogout() {
    logout();
    history.push('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🛍️ ShopLink
      </div>
      <div className="navbar-links">
        {user && (
          <span className="text-sm text-muted">
            Hi, {user.name} &nbsp;
            <span
              className={`badge ${user.type === 'vendor' ? 'badge-info' : 'badge-success'}`}
            >
              {user.type === 'vendor' ? '🏪 Vendor' : '🛒 Customer'}
            </span>
          </span>
        )}
        {user && user.type === 'customer' && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => history.push('/customer?tab=cart')}
          >
            🛒 Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
