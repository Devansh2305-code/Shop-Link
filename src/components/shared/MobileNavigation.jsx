import React from 'react';

export default function MobileNavigation({ activeTab, setActiveTab, tabs, cartCount }) {
  return (
    <div className="mobile-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`mobile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <div className="mobile-nav-icon">{tab.icon}</div>
          <div className="mobile-nav-label">{tab.label}</div>
          {tab.id === 'cart' && cartCount > 0 && (
            <div className="mobile-nav-badge">{cartCount}</div>
          )}
        </button>
      ))}
    </div>
  );
}
