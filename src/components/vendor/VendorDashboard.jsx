import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ShopManagement from './ShopManagement';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import Analytics from './Analytics';
import apiService from '../../services/api';
import MobileNavigation from '../shared/MobileNavigation';

const TABS = [
  { id: 'shop', label: 'Shop', icon: '🏪' },
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'orders', label: 'Orders', icon: '📋' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
];

export default function VendorDashboard() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('shop');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Refresh pending count after visiting the orders tab (orders may have been confirmed)
    if (activeTab !== 'orders') {
      apiService.getVendorOrders(user._id).then((orders) => {
        setPendingCount(orders.filter((o) => o.status === 'Payment Submitted').length);
      });
    }
  }, [user._id, activeTab]);

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div style={{ marginBottom: '1rem', padding: '0.5rem' }} className="sidebar-brand">
          <div className="text-sm text-muted">Vendor Panel</div>
          <div className="fw-bold">{user.shopName}</div>
        </div>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
            {tab.id === 'orders' && pendingCount > 0 && (
              <span
                className="badge badge-danger"
                style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="dashboard-content">
        {activeTab === 'shop' && <ShopManagement />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={TABS}
        cartCount={pendingCount}
      />
    </div>
  );
}
