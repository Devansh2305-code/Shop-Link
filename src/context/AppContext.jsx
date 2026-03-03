import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getCart,
  setCart,
  findUserById,
} from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [cart, setCartState] = useState(() => getCart());

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    } else {
      clearCurrentUser();
    }
  }, [user]);

  useEffect(() => {
    setCart(cart);
  }, [cart]);

  function login(userData) {
    setUser(userData);
    setCurrentUser(userData);
  }

  function logout() {
    setUser(null);
    clearCurrentUser();
    setCartState([]);
  }

  function refreshUser(userId) {
    const updated = findUserById(userId);
    if (updated) {
      setUser(updated);
      setCurrentUser(updated);
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
