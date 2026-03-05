const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class APIService {
  constructor() {
    this.baseURL = BASE_URL;
    this.token = localStorage.getItem('shoplink_token');
  }

  _headers(withAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (withAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async _request(method, path, body, auth = false) {
    const options = {
      method,
      headers: this._headers(auth),
    };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    try {
      const response = await fetch(`${this.baseURL}${path}`, options);
      let data;
      try {
        data = await response.json();
      } catch {
        data = { success: false, message: response.ok ? 'Unexpected response format' : `HTTP ${response.status}` };
      }
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      return { ok: false, status: 0, data: { success: false, message: 'Network error' } };
    }
  }

  // Auth
  async register(userData) {
    const { ok, data } = await this._request('POST', '/auth/register', userData);
    if (ok && data.token) {
      this.token = data.token;
      localStorage.setItem('shoplink_token', data.token);
    }
    return data;
  }

  async login(email, password) {
    const { ok, data } = await this._request('POST', '/auth/login', { email, password });
    if (ok && data.token) {
      this.token = data.token;
      localStorage.setItem('shoplink_token', data.token);
    }
    return data;
  }

  async getCurrentUser() {
    if (!this.token) return null;
    const { ok, data } = await this._request('GET', '/auth/me', undefined, true);
    if (ok) return data.user;
    // Token is invalid or expired
    this.logout();
    return null;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('shoplink_token');
  }

  // Users / Vendors
  async getVendors() {
    const { ok, data } = await this._request('GET', '/users');
    return ok ? data.users : [];
  }

  async updateUser(id, updates) {
    const { ok, data } = await this._request('PUT', `/users/${id}`, updates, true);
    return ok ? data.user : null;
  }

  async updateShopStatus(id, payload) {
    const { ok, data } = await this._request('PUT', `/users/${id}/shop-status`, payload, true);
    return ok ? data.user : null;
  }

  // Products
  async getProducts() {
    const { ok, data } = await this._request('GET', '/products');
    return ok ? data.products : [];
  }

  async getProductsByVendor(vendorId) {
    const { ok, data } = await this._request('GET', `/products/vendor/${vendorId}`);
    return ok ? data.products : [];
  }

  async createProduct(productData) {
    const { ok, data } = await this._request('POST', '/products', productData, true);
    return ok ? data.product : null;
  }

  async updateProduct(id, productData) {
    const { ok, data } = await this._request('PUT', `/products/${id}`, productData, true);
    return ok ? data.product : null;
  }

  async deleteProduct(id) {
    const { ok } = await this._request('DELETE', `/products/${id}`, undefined, true);
    return ok;
  }

  // Orders
  async createOrder(orderData) {
    const { ok, data } = await this._request('POST', '/orders', orderData, true);
    return ok ? data.order : null;
  }

  async getCustomerOrders(customerId) {
    const { ok, data } = await this._request('GET', `/orders/customer/${customerId}`, undefined, true);
    return ok ? data.orders : [];
  }

  async getVendorOrders(vendorId) {
    const { ok, data } = await this._request('GET', `/orders/vendor/${vendorId}`, undefined, true);
    return ok ? data.orders : [];
  }

  async updateOrderStatus(orderId, status) {
    const { ok, data } = await this._request('PUT', `/orders/${orderId}/status`, { status }, true);
    return ok ? data.order : null;
  }

  async confirmOrderPayment(orderId) {
    const { ok, data } = await this._request('PUT', `/orders/${orderId}/confirm`, {}, true);
    return ok ? data.order : null;
  }
}

const apiService = new APIService();
export default apiService;
