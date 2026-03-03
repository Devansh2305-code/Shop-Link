import React from 'react';
import { useApp } from '../../context/AppContext';
import { saveUser } from '../../utils/storage';

export default function ShopStatus() {
  const { user, refreshUser } = useApp();

  function handleShopStatusChange() {
    const updatedUser = { ...user, shopOpen: !user.shopOpen };
    saveUser(updatedUser);
    refreshUser(updatedUser.id);
  }

  return (
    <div style={{ padding: '0.5rem 1rem', marginBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
      <div className="text-sm text-muted" style={{ marginBottom: '0.4rem' }}>Shop Status</div>
      <label className="toggle-switch" style={{ cursor: 'pointer' }}>
        <span className="toggle-input">
          <input
            type="checkbox"
            checked={user.shopOpen || false}
            onChange={handleShopStatusChange}
          />
          <span className="toggle-slider" />
        </span>
        <span className={user.shopOpen ? 'badge badge-success' : 'badge badge-danger'}>
          {user.shopOpen ? '🟢 Open' : '🔴 Closed'}
        </span>
      </label>
    </div>
  );
}
