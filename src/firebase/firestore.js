import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';

// ─── Users ───────────────────────────────────────────────────────────────────

export async function saveUserToFirestore(userId, userData) {
  await setDoc(doc(db, 'users', userId), userData);
}

export async function getUserFromFirestore(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getVendorsFromFirestore() {
  const q = query(collection(db, 'users'), where('type', '==', 'vendor'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function saveProductToFirestore(product) {
  const { id, ...data } = product;
  if (id) {
    await setDoc(doc(db, 'products', id), data);
    return id;
  }
  const ref = await addDoc(collection(db, 'products'), data);
  return ref.id;
}

export async function deleteProductFromFirestore(productId) {
  await deleteDoc(doc(db, 'products', productId));
}

export async function getProductsByVendorFromFirestore(vendorId) {
  const q = query(collection(db, 'products'), where('vendorId', '==', vendorId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllProductsFromFirestore() {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function saveOrderToFirestore(order) {
  const { id, ...data } = order;
  if (id) {
    await setDoc(doc(db, 'orders', id), data);
    return id;
  }
  const ref = await addDoc(collection(db, 'orders'), data);
  return ref.id;
}

export async function updateOrderInFirestore(orderId, updates) {
  await updateDoc(doc(db, 'orders', orderId), updates);
}

export async function getOrdersByVendorFromFirestore(vendorId) {
  const q = query(collection(db, 'orders'), where('vendorId', '==', vendorId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getOrdersByCustomerFromFirestore(customerId) {
  const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function saveCartToFirestore(userId, cartItems) {
  await setDoc(doc(db, 'carts', userId), { items: cartItems });
}

export async function getCartFromFirestore(userId) {
  const snap = await getDoc(doc(db, 'carts', userId));
  return snap.exists() ? snap.data().items : [];
}
