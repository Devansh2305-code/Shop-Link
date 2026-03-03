// Utility functions for localStorage-based data persistence

const KEYS = {
  USERS: 'shoplink_users',
  CURRENT_USER: 'shoplink_current_user',
  PRODUCTS: 'shoplink_products',
  ORDERS: 'shoplink_orders',
  CART: 'shoplink_cart',
};

function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Users
export function getUsers() {
  return getItem(KEYS.USERS, []);
}

export function saveUser(user) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  setItem(KEYS.USERS, users);
}

export function findUserByEmail(email) {
  return getUsers().find((u) => u.email === email) || null;
}

export function findUserById(id) {
  return getUsers().find((u) => u.id === id) || null;
}

// Current session
export function getCurrentUser() {
  return getItem(KEYS.CURRENT_USER);
}

export function setCurrentUser(user) {
  setItem(KEYS.CURRENT_USER, user);
}

export function clearCurrentUser() {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

// Products
export function getProducts() {
  return getItem(KEYS.PRODUCTS, []);
}

export function saveProduct(product) {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    products[idx] = product;
  } else {
    products.push(product);
  }
  setItem(KEYS.PRODUCTS, products);
}

export function deleteProduct(id) {
  const products = getProducts().filter((p) => p.id !== id);
  setItem(KEYS.PRODUCTS, products);
}

export function getProductsByVendor(vendorId) {
  return getProducts().filter((p) => p.vendorId === vendorId);
}

// Orders
export function getOrders() {
  return getItem(KEYS.ORDERS, []);
}

export function saveOrder(order) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = order;
  } else {
    orders.push(order);
  }
  setItem(KEYS.ORDERS, orders);
}

export function getOrdersByVendor(vendorId) {
  return getOrders().filter((o) => o.vendorId === vendorId);
}

export function getOrdersByCustomer(customerId) {
  return getOrders().filter((o) => o.customerId === customerId);
}

// Cart
export function getCart() {
  return getItem(KEYS.CART, []);
}

export function setCart(cart) {
  setItem(KEYS.CART, cart);
}

export function clearCart() {
  localStorage.removeItem(KEYS.CART);
}

// Generate unique IDs
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
