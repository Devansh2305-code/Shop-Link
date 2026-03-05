import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, firebaseSignOut } from '../firebase/auth';
import { getUserFromFirestore } from '../firebase/firestore';
import { getCart, setCart } from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCartState] = useState(() => getCart());

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch full user profile from Firestore
        const profile = await getUserFromFirestore(firebaseUser.uid);
        setUser(profile || null);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setCart(cart);
  }, [cart]);

  function login(userData) {
    // Called after Firebase sign-in to immediately set local state
    setUser(userData);
  }

  async function logout() {
    await firebaseSignOut();
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

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
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
