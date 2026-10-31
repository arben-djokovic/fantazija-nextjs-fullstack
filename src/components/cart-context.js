"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "fantazija-cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      // Korpa se čita tek na klijentu, da server i klijent ne renderuju različit sadržaj.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setItems(JSON.parse(saved));
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo(
    () => ({
      items,
      // Ista stavka (isti proizvod i ista opcija) se spaja i samo se povećava količina.
      addItem: (item) =>
        setItems((current) => {
          const existing = current.find((entry) => entry.id === item.id);
          if (!existing) return [...current, { ...item, quantity: item.quantity || 1 }];
          return current.map((entry) =>
            entry.id === item.id ? { ...entry, quantity: entry.quantity + (item.quantity || 1) } : entry,
          );
        }),
      updateQuantity: (id, quantity) =>
        setItems((current) =>
          current.map((entry) => (entry.id === id ? { ...entry, quantity: Math.max(1, quantity) } : entry)),
        ),
      removeItem: (id) => setItems((current) => current.filter((entry) => entry.id !== id)),
      clear: () => setItems([]),
      count: items.reduce((sum, entry) => sum + entry.quantity, 0),
      total: items.reduce((sum, entry) => sum + (entry.unitPrice || 0) * entry.quantity, 0),
      hasPhonePrice: items.some((entry) => entry.phonePrice),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart mora biti unutar CartProvider-a");
  return context;
}
