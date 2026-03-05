// Cart is kept in localStorage for session persistence (per-device shopping session).
// All user, product and order data is persisted in Firestore (see src/firebase/firestore.js).

const KEYS = {
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

// Generate unique IDs (used for products and orders)
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
