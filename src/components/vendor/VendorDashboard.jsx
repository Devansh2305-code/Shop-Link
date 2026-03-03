import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ShopManagement from './ShopManagement';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import Analytics from './Analytics';
import ShopStatus from './ShopStatus';

const TABS = [
  { id: 'shop', label: '🏪 My Shop', icon: '🏪' },
  { id: 'products', label: '📦 Products', icon: '📦' },
  { id: 'orders', label: '📋 Orders', icon: '📋' },
  { id: 'analytics', label: '📊 Analytics', icon: '📊' },
];

export default function VendorDashboard() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('shop');

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div style={{ marginBottom: '1rem', padding: '0.5rem' }}>
          <div className="text-sm text-muted">Vendor Panel</div>
          <div className="fw-bold">{user.shopName}</div>
        </div>
        <ShopStatus />
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="dashboard-content">
        {activeTab === 'shop' && <ShopManagement />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </div>
  );
}
