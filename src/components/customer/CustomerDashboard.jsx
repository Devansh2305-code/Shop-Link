import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ShopBrowser from './ShopBrowser';
import Cart from './Cart';
import Checkout from './Checkout';
import MyOrders from './MyOrders';
import MobileNavigation from '../shared/MobileNavigation';

const TABS = [
  { id: 'shops', label: 'Shops', icon: '🏪' },
  { id: 'cart', label: 'Cart', icon: '🛒' },
  { id: 'orders', label: 'Orders', icon: '📋' },
];

export default function CustomerDashboard() {
  const location = useLocation();
  const { cart } = useApp();
  const [activeTab, setActiveTab] = useState('shops');
  const [checkoutData, setCheckoutData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function handleCheckout(data) {
    setCheckoutData(data);
    setActiveTab('checkout');
  }

  function handleOrderPlaced() {
    setCheckoutData(null);
    setActiveTab('orders');
  }

  const sidebarTabs = [
    ...TABS,
    ...(activeTab === 'checkout' ? [{ id: 'checkout', label: 'Checkout', icon: '💳' }] : []),
  ];

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        {sidebarTabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
            {tab.id === 'cart' && cartCount > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="dashboard-content">
        {activeTab === 'shops' && <ShopBrowser />}
        {activeTab === 'cart' && <Cart onCheckout={handleCheckout} />}
        {activeTab === 'checkout' && checkoutData && (
          <Checkout checkoutData={checkoutData} onOrderPlaced={handleOrderPlaced} />
        )}
        {activeTab === 'orders' && <MyOrders />}
      </div>
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={TABS}
        cartCount={cartCount}
      />
    </div>
  );
}
