"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { trackEvent } from "./fpixel";

const CartContext = createContext(null);
const STORAGE_KEY = "cosmetics-store-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount (client-only — cart shouldn't be SSR'd).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setItems(JSON.parse(saved));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (product, variantSku, qty = 1) => {
    const variant = product.variants?.find((v) => v.sku === variantSku);
    const unitPrice = variant ? variant.price : product.basePrice;
    const finalPrice = product.discount?.isActive
      ? Math.round(unitPrice * (1 - product.discount.percent / 100))
      : unitPrice;

    trackEvent("AddToCart", {
      content_ids: [product._id],
      content_name: product.name,
      content_type: "product",
      value: finalPrice * qty,
      currency: "INR",
    });

    setItems((prev) => {
      const key = `${product._id}-${variantSku || "base"}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }

      return [
        ...prev,
        {
          key,
          productId: product._id,
          variantSku,
          name: variant ? `${product.name} — ${variant.label}` : product.name,
          image: product.images?.[0],
          price: finalPrice,
          qty,
          codEligible: product.codEligible !== false,
        },
      ];
    });
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));

  const updateQty = (key, qty) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, subtotal, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
