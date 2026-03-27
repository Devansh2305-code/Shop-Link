import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

function dbUserToUser(uid, data) {
  return { _id: uid, ...data };
}

function dbRecordToObj(key, data) {
  return { _id: key, ...data };
}

class FirebaseService {
  // Auth

  async register(userData) {
    try {
      const { email, password, ...rest } = userData;
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const userRecord = {
        email,
        name: rest.name || '',
        phone: rest.phone || '',
        type: rest.type || 'customer',
        shopName: rest.shopName || '',
        shopLocation: rest.shopLocation || '',
        shopCategory: rest.shopCategory || '',
        upiId: rest.upiId || '',
        qrCodeImage: rest.qrCodeImage || '',
        shopOpen: false,
        deliveryMode: 'instant',
        scheduledTime: '',
        createdAt: new Date().toISOString(),
      };
      await set(ref(db, `users/${uid}`), userRecord);
      return { success: true, user: dbUserToUser(uid, userRecord) };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async login(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const snapshot = await get(ref(db, `users/${uid}`));
      if (!snapshot.exists()) {
        return { success: false, message: 'User data not found.' };
      }
      const user = dbUserToUser(uid, snapshot.val());
      return { success: true, user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (!firebaseUser) {
          resolve(null);
          return;
        }
        try {
          const snapshot = await get(ref(db, `users/${firebaseUser.uid}`));
          if (!snapshot.exists()) {
            resolve(null);
            return;
          }
          resolve(dbUserToUser(firebaseUser.uid, snapshot.val()));
        } catch {
          resolve(null);
        }
      });
    });
  }

  async logout() {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  }

  // Users / Vendors

  async getVendors() {
    try {
      const snapshot = await get(
        query(ref(db, 'users'), orderByChild('type'), equalTo('vendor'))
      );
      if (!snapshot.exists()) return [];
      const vendors = [];
      snapshot.forEach((child) => {
        vendors.push(dbUserToUser(child.key, child.val()));
      });
      return vendors;
    } catch {
      return [];
    }
  }

  async updateUser(id, updates) {
    try {
      await update(ref(db, `users/${id}`), updates);
      const snapshot = await get(ref(db, `users/${id}`));
      return snapshot.exists() ? dbUserToUser(id, snapshot.val()) : null;
    } catch {
      return null;
    }
  }

  async updateShopStatus(id, payload) {
    return this.updateUser(id, payload);
  }

  // Products

  async getProducts() {
    try {
      const snapshot = await get(ref(db, 'products'));
      if (!snapshot.exists()) return [];
      const products = [];
      snapshot.forEach((child) => {
        products.push(dbRecordToObj(child.key, child.val()));
      });
      return products;
    } catch {
      return [];
    }
  }

  async getProductsByVendor(vendorId) {
    try {
      const snapshot = await get(
        query(ref(db, 'products'), orderByChild('vendorId'), equalTo(vendorId))
      );
      if (!snapshot.exists()) return [];
      const products = [];
      snapshot.forEach((child) => {
        products.push(dbRecordToObj(child.key, child.val()));
      });
      return products;
    } catch {
      return [];
    }
  }

  async createProduct(productData) {
    try {
      const newRef = push(ref(db, 'products'));
      const record = { ...productData, createdAt: new Date().toISOString() };
      await set(newRef, record);
      return dbRecordToObj(newRef.key, record);
    } catch {
      return null;
    }
  }

  async updateProduct(id, productData) {
    try {
      await update(ref(db, `products/${id}`), productData);
      const snapshot = await get(ref(db, `products/${id}`));
      return snapshot.exists() ? dbRecordToObj(id, snapshot.val()) : null;
    } catch {
      return null;
    }
  }

  async deleteProduct(id) {
    try {
      await remove(ref(db, `products/${id}`));
      return true;
    } catch {
      return false;
    }
  }

  // Orders

  async createOrder(orderData) {
    try {
      const newRef = push(ref(db, 'orders'));
      const record = {
        ...orderData,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      await set(newRef, record);
      return dbRecordToObj(newRef.key, record);
    } catch {
      return null;
    }
  }

  async getCustomerOrders(customerId) {
    try {
      const snapshot = await get(
        query(ref(db, 'orders'), orderByChild('customerId'), equalTo(customerId))
      );
      if (!snapshot.exists()) return [];
      const orders = [];
      snapshot.forEach((child) => {
        orders.push(dbRecordToObj(child.key, child.val()));
      });
      return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch {
      return [];
    }
  }

  async getVendorOrders(vendorId) {
    try {
      const snapshot = await get(
        query(ref(db, 'orders'), orderByChild('vendorId'), equalTo(vendorId))
      );
      if (!snapshot.exists()) return [];
      const orders = [];
      snapshot.forEach((child) => {
        orders.push(dbRecordToObj(child.key, child.val()));
      });
      return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch {
      return [];
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      await update(ref(db, `orders/${orderId}`), { status });
      const snapshot = await get(ref(db, `orders/${orderId}`));
      return snapshot.exists() ? dbRecordToObj(orderId, snapshot.val()) : null;
    } catch {
      return null;
    }
  }

  async confirmOrderPayment(orderId) {
    return this.updateOrderStatus(orderId, 'Payment Submitted');
  }
}

const firebaseService = new FirebaseService();
export default firebaseService;
