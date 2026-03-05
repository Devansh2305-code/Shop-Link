import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { db } from './config';

// ── Users ────────────────────────────────────────────────────────────────────

export async function saveUserToFirestore(user) {
  await setDoc(doc(db, 'users', user.id), user, { merge: true });
}

export async function getUserFromFirestore(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? snap.data() : null;
}

export async function findUserByEmailInFirestore(email) {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
}

export async function getAllVendors() {
  const q = query(
    collection(db, 'users'),
    where('type', '==', 'vendor'),
    where('shopOpen', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function saveProductToFirestore(product) {
  await setDoc(doc(db, 'products', product.id), product);
}

export async function deleteProductFromFirestore(id) {
  await deleteDoc(doc(db, 'products', id));
}

export async function getProductsByVendorFromFirestore(vendorId) {
  const q = query(
    collection(db, 'products'),
    where('vendorId', '==', vendorId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function saveOrderToFirestore(order) {
  await setDoc(doc(db, 'orders', order.id), order);
}

export async function updateOrderInFirestore(orderId, fields) {
  await setDoc(doc(db, 'orders', orderId), fields, { merge: true });
}

export async function getOrdersByVendorFromFirestore(vendorId) {
  const q = query(
    collection(db, 'orders'),
    where('vendorId', '==', vendorId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function getOrdersByCustomerFromFirestore(customerId) {
  const q = query(
    collection(db, 'orders'),
    where('customerId', '==', customerId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}
