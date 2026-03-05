import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getProductsByVendorFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
} from '../../firebase/firestore';
import ImageUpload from '../shared/ImageUpload';

const EMOJI_MAP = {
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

const MAX_DESCRIPTION_PREVIEW_LENGTH = 60;

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  colors: '',
  category: '',
  image: '',
};

export default function ProductManagement() {
  const { user } = useApp();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProductsByVendorFromFirestore(user.id);
    setProducts(data);
  }

  function openAdd() {
    setEditProduct(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  }

  function openEdit(product) {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      colors: (product.colors || []).join(', '),
      category: product.category || '',
      image: product.image || '',
    });
    setError('');
    setShowModal(true);
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setError('');
    if (!form.name || !form.price || !form.stock) {
      setError('Name, price and stock are required.');
      return;
    }
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock);
    if (isNaN(price) || price < 0) {
      setError('Enter a valid price.');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setError('Enter a valid stock number.');
      return;
    }

    const product = {
      id: editProduct ? editProduct.id : null,
      vendorId: user.id,
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
      colors: form.colors
        ? form.colors.split(',').map((c) => c.trim()).filter(Boolean)
        : [],
      category: form.category.trim() || user.shopCategory,
      image: form.image,
      createdAt: editProduct ? editProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProductToFirestore(product);
    await loadProducts();
    setShowModal(false);
  }

  async function handleDelete(id) {
    if (window.confirm('Delete this product?')) {
      await deleteProductFromFirestore(id);
      await loadProducts();
    }
  }

  const shopEmoji = EMOJI_MAP[user.shopCategory] || '📦';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ margin: 0 }}>📦 Products</h2>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{shopEmoji}</div>
          <p>No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Colors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.25rem' }}
                      />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>{shopEmoji}</span>
                    )}
                  </td>
                  <td>
                    <div className="fw-bold">{p.name}</div>
                    {p.description && (
                      <div className="text-sm text-muted">{p.description.slice(0, MAX_DESCRIPTION_PREVIEW_LENGTH)}</div>
                    )}
                  </td>
                  <td className="fw-bold" style={{ color: '#4f46e5' }}>
                    ₹{p.price.toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        p.stock === 0
                          ? 'badge-danger'
                          : p.stock < 5
                          ? 'badge-warning'
                          : 'badge-success'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="text-sm">
                    {p.colors && p.colors.length > 0 ? p.colors.join(', ') : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEdit(p)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Blue Cotton T-Shirt"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief product description..."
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  className="form-control"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Colors (comma separated)</label>
              <input
                type="text"
                name="colors"
                className="form-control"
                value={form.colors}
                onChange={handleChange}
                placeholder="Red, Blue, Green"
              />
            </div>
            <ImageUpload
              label="Product Image"
              value={form.image}
              onChange={(val) => setForm((prev) => ({ ...prev, image: val }))}
              placeholder="Click to upload a product photo"
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editProduct ? 'Update' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
