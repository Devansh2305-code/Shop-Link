import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, setCart } from '../utils/storage';
import firebaseService from '../services/firebase';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCartState] = useState(() => getCart());
  const [loading, setLoading] = useState(true);

  // On mount, check for existing JWT session
  useEffect(() => {
    firebaseService.getCurrentUser().then((userData) => {
      setUser(userData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setCart(cart);
  }, [cart]);

  async function login(email, password) {
    const result = await firebaseService.login(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }

  function logout() {
    firebaseService.logout();
    setUser(null);
    setCartState([]);
  }

  async function refreshUser() {
    const updated = await firebaseService.getCurrentUser();
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
        loading,
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
