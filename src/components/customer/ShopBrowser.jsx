import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getAllVendors,
  getProductsByVendorFromFirestore,
} from '../../firebase/firestore';

const SHOP_CATEGORIES = [
  'All',
  'Mobile Accessories',
  'Clothing & Apparel',
  'General Store',
  'Electronics',
  'Food & Grocery',
  'Books & Stationery',
  'Health & Pharmacy',
  'Beauty & Personal Care',
  'Sports & Fitness',
  'Home & Furniture',
  'Other',
];

const CATEGORY_EMOJI = {
  'Mobile Accessories': '📱',
  'Clothing & Apparel': '👕',
  'General Store': '🏬',
  Electronics: '💻',
  'Food & Grocery': '🛒',
  'Books & Stationery': '📚',
  'Health & Pharmacy': '💊',
  'Beauty & Personal Care': '💄',
  'Sports & Fitness': '⚽',
  'Home & Furniture': '🛋️',
  Other: '📦',
};

export default function ShopBrowser() {
  const { addToCart } = useApp();
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    getAllVendors().then(setVendors);
  }, []);

  useEffect(() => {
    if (!selectedShop) {
      setShopProducts([]);
      return;
    }
    getProductsByVendorFromFirestore(selectedShop.id).then((list) =>
      setShopProducts(list.filter((p) => p.stock > 0))
    );
  }, [selectedShop]);

  const filteredShops = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch =
        !search ||
        v.shopName.toLowerCase().includes(search.toLowerCase()) ||
        v.shopCategory.toLowerCase().includes(search.toLowerCase()) ||
        v.shopLocation.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || v.shopCategory === category;
      return matchSearch && matchCategory;
    });
  }, [vendors, search, category]);

  function handleAddToCart(product) {
    addToCart({
      productId: product.id,
      vendorId: selectedShop.id,
      vendorName: selectedShop.shopName,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    setAddedMsg(`"${product.name}" added to cart!`);
    setTimeout(() => setAddedMsg(''), 2500);
  }

  if (selectedProduct) {
    return (
      <div>
        <button
          className="btn btn-secondary btn-sm mb-2"
          onClick={() => setSelectedProduct(null)}
        >
          ← Back to {selectedShop.shopName}
        </button>
        <div className="card">
          <div
            style={{
              width: '100%',
              height: '220px',
              background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '5rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              overflow: 'hidden',
            }}
          >
            {selectedProduct.image ? (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              CATEGORY_EMOJI[selectedShop.shopCategory] || '📦'
            )}
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>{selectedProduct.name}</h2>
          <div className="price-tag mb-2">₹{selectedProduct.price.toFixed(2)}</div>
          {selectedProduct.description && (
            <p className="text-muted mb-2">{selectedProduct.description}</p>
          )}
          {selectedProduct.colors && selectedProduct.colors.length > 0 && (
            <div className="mb-2">
              <span className="text-sm text-muted">Available Colors: </span>
              {selectedProduct.colors.map((c) => (
                <span key={c} className="badge badge-secondary" style={{ marginRight: '0.25rem' }}>
                  {c}
                </span>
              ))}
            </div>
          )}
          <div className="mb-2">
            <span
              className={`badge ${
                selectedProduct.stock > 5
                  ? 'badge-success'
                  : selectedProduct.stock > 0
                  ? 'badge-warning'
                  : 'badge-danger'
              }`}
            >
              {selectedProduct.stock > 0
                ? `✅ ${selectedProduct.stock} in stock`
                : '❌ Out of stock'}
            </span>
            &nbsp;
            <span className="badge badge-info">
              {selectedShop.deliveryMode === 'instant'
                ? '⚡ Instant Delivery'
                : selectedShop.deliveryMode === 'scheduled'
                ? `🕐 Scheduled ${selectedShop.scheduledTime || ''}`
                : '🚶 Pickup Only'}
            </span>
          </div>
          {addedMsg && <div className="alert alert-success">{addedMsg}</div>}
          <button
            className="btn btn-primary"
            disabled={selectedProduct.stock === 0}
            onClick={() => handleAddToCart(selectedProduct)}
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    );
  }

  if (selectedShop) {
    return (
      <div>
        <button
          className="btn btn-secondary btn-sm mb-2"
          onClick={() => setSelectedShop(null)}
        >
          ← Back to Shops
        </button>
        <div className="card mb-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>
                {CATEGORY_EMOJI[selectedShop.shopCategory] || '🏪'} {selectedShop.shopName}
              </h2>
              <p className="text-muted text-sm">
                📍 {selectedShop.shopLocation} &nbsp;|&nbsp; 🏷️ {selectedShop.shopCategory}
              </p>
            </div>
            <div>
              <span className="badge badge-success">🟢 Open</span>
              &nbsp;
              <span className="badge badge-info">
                {selectedShop.deliveryMode === 'instant'
                  ? '⚡ Instant Delivery'
                  : selectedShop.deliveryMode === 'scheduled'
                  ? `🕐 Scheduled`
                  : '🚶 Pickup Only'}
              </span>
            </div>
          </div>
        </div>

        {addedMsg && <div className="alert alert-success">{addedMsg}</div>}

        {shopProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>No products available at this shop right now.</p>
          </div>
        ) : (
          <div className="grid-3">
            {shopProducts.map((p) => (
              <div key={p.id} className="product-card">
                <div
                  className="product-card-img"
                  onClick={() => setSelectedProduct(p)}
                  style={{ cursor: 'pointer', overflow: 'hidden' }}
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    CATEGORY_EMOJI[selectedShop.shopCategory] || '📦'
                  )}
                </div>
                <div className="product-card-body">
                  <div
                    className="product-card-title"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedProduct(p)}
                  >
                    {p.name}
                  </div>
                  <div className="product-card-price">₹{p.price.toFixed(2)}</div>
                  <div className="text-sm text-muted mb-1">
                    {p.stock} left
                  </div>
                  <button
                    className="btn btn-primary btn-sm btn-full"
                    onClick={() => handleAddToCart(p)}
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">🏪 Browse Shops</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search shops by name, category or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {SHOP_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCategory(cat)}
          >
            {cat !== 'All' && CATEGORY_EMOJI[cat] ? CATEGORY_EMOJI[cat] + ' ' : ''}
            {cat}
          </button>
        ))}
      </div>

      {filteredShops.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <p>No open shops found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredShops.map((shop) => (
            <div key={shop.id} className="shop-card" onClick={() => setSelectedShop(shop)}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {CATEGORY_EMOJI[shop.shopCategory] || '🏪'}
              </div>
              <div className="shop-card-name">{shop.shopName}</div>
              <div className="text-sm text-muted mb-1">
                📍 {shop.shopLocation}
              </div>
              <div className="text-sm text-muted mb-2">🏷️ {shop.shopCategory}</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge badge-success">🟢 Open</span>
                <span className="badge badge-info">
                  {shop.deliveryMode === 'instant'
                    ? '⚡ Instant'
                    : shop.deliveryMode === 'scheduled'
                    ? '🕐 Scheduled'
                    : '🚶 Pickup'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
