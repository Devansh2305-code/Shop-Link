import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getOrdersByVendorFromFirestore,
  getProductsByVendorFromFirestore,
} from '../../firebase/firestore';

export default function Analytics() {
  const { user } = useApp();
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0, productCount: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const [orders, products] = await Promise.all([
        getOrdersByVendorFromFirestore(user.id),
        getProductsByVendorFromFirestore(user.id),
      ]);

      const delivered = orders.filter((o) => o.status === 'Delivered');
      const totalRevenue = delivered.reduce((sum, o) => sum + o.total, 0);
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o) =>
        ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(o.status)
      ).length;

      const productSales = {};
      delivered.forEach((order) => {
        order.items.forEach((item) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.price * item.quantity;
        });
      });

      setTopProducts(
        Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      );

      setRecentOrders(
        [...orders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      );

      setStats({ totalRevenue, totalOrders, pendingOrders, productCount: products.length });
    }
    load();
  }, [user.id]);

  return (
    <div>
      <h2 className="page-title">📊 Analytics</h2>

      <div className="grid-4 mb-3">
        <div className="stat-card">
          <div className="stat-value">₹{stats.totalRevenue.toFixed(0)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingOrders}</div>
          <div className="stat-label">Active Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.productCount}</div>
          <div className="stat-label">Products Listed</div>
        </div>
      </div>

      <div className="grid-2 gap-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏆 Top Products</h3>
          </div>
          {topProducts.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <p>No sales data yet.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.name}>
                    <td>
                      <span style={{ marginRight: '0.5rem' }}>
                        {['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}
                      </span>
                      {p.name}
                    </td>
                    <td>{p.quantity}</td>
                    <td className="fw-bold" style={{ color: '#4f46e5' }}>
                      ₹{p.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🕐 Recent Orders</h3>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <p>No orders yet.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.customerName}</td>
                    <td>₹{o.total.toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          o.status === 'Delivered'
                            ? 'badge-success'
                            : o.status === 'Cancelled'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
