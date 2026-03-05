import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthChange, firebaseLogout } from '../firebase/auth';
import {
  getUserFromFirestore,
  saveCartToFirestore,
  getCartFromFirestore,
} from '../firebase/firestore';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCartState] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const cartSaveTimer = useRef(null);

  // Listen to Firebase Auth state changes and load user profile from Firestore
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserFromFirestore(firebaseUser.uid);
        setUser(userData);
        const savedCart = await getCartFromFirestore(firebaseUser.uid);
        setCartState(savedCart || []);
      } else {
        setUser(null);
        setCartState([]);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Persist cart to Firestore whenever it changes (debounced)
  useEffect(() => {
    if (!user) return;
    clearTimeout(cartSaveTimer.current);
    cartSaveTimer.current = setTimeout(() => {
      saveCartToFirestore(user.id, cart).catch((err) =>
        console.error('Failed to sync cart:', err)
      );
    }, 500);
    return () => clearTimeout(cartSaveTimer.current);
  }, [cart, user]);

  function login(userData) {
    setUser(userData);
  }

  async function logout() {
    await firebaseLogout();
    setUser(null);
    setCartState([]);
  }

  async function refreshUser(userId) {
    const updated = await getUserFromFirestore(userId);
    if (updated) {
      setUser(updated);
    }
  }

  function addToCart(item) {
    setCartState((prev) => {
      const existing = prev.find(
        (c) => c.productId === item.productId && c.vendorId === item.vendorId
      );
      if (existing) {
        return prev.map((c) =>
          c.productId === item.productId && c.vendorId === item.vendorId
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      }
      return [...prev, item];
    });
  }

  function removeFromCart(productId, vendorId) {
    setCartState((prev) =>
      prev.filter((c) => !(c.productId === productId && c.vendorId === vendorId))
    );
  }

  function clearCartItems() {
    setCartState([]);
    if (user) {
      saveCartToFirestore(user.id, []).catch((err) =>
        console.error('Failed to clear cart:', err)
      );
    }
  }

  function updateCartQuantity(productId, vendorId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId, vendorId);
      return;
    }
    setCartState((prev) =>
      prev.map((c) =>
        c.productId === productId && c.vendorId === vendorId
          ? { ...c, quantity }
          : c
      )
    );
  }

  if (authLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '1.5rem',
          color: '#6b7280',
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        refreshUser,
        cart,
        addToCart,
        removeFromCart,
        clearCartItems,
        updateCartQuantity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
