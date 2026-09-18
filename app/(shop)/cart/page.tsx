"use client";

import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";
import Link from "next/link";
import { useCart } from "../../../lib/cartContext";
import { useAuth } from "../../../lib/authContext";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-5 shadow-sm">
          <FiShoppingBag size={26} className="text-clay" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-2">
          Your cart is empty
        </h1>
        <p className="text-xs sm:text-sm text-ink/60 mb-8 max-w-xs mx-auto leading-relaxed">
          Looks like you haven't added anything yet. Explore our formulations to
          find your ritual.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 bg-clay text-ivory text-xs sm:text-sm uppercase tracking-widest font-medium rounded-full px-8 py-3.5 hover:bg-clay-light shadow-sm active:scale-95 transition-all"
        >
          <span>Browse Products</span>
          <FiArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-baseline justify-between mb-6 sm:mb-8 border-b border-gold/15 pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl text-ink">Your Cart</h1>
        <span className="text-xs text-ink/60 tracking-wider uppercase font-medium">
          {items.reduce((acc, curr) => acc + curr.qty, 0)} Items
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 flex flex-col gap-3.5 sm:gap-4">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 bg-blush/60 border border-gold/10 rounded-2xl p-3.5 sm:p-4 transition-all"
            >
              {/* Product Thumbnail & Details Row */}
              <div className="flex items-center gap-3.5 w-full sm:w-auto flex-1 min-w-0">
                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0 bg-sage"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-ink truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    Unit: ₹{item.price}
                  </p>
                  {/* Mobile Total Display */}
                  <p className="text-xs font-semibold text-brand sm:hidden mt-1">
                    ₹{item.price * item.qty}
                  </p>
                </div>

                {/* Mobile Trash Action (Top-right corner on mobile) */}
                <button
                  onClick={() => removeItem(item.key)}
                  aria-label="Remove item"
                  className="sm:hidden p-2 text-ink/40 hover:text-red-700 transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              {/* Quantity Controls & Line Price */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-gold/10 sm:border-t-0">
                {/* Stepper */}
                <div className="flex items-center gap-1 bg-ivory rounded-full border border-clay/20 p-0.5 shadow-sm">
                  <button
                    onClick={() =>
                      updateQty(item.key, Math.max(1, item.qty - 1))
                    }
                    disabled={item.qty <= 1}
                    aria-label="Decrease quantity"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-clay hover:bg-clay hover:text-ivory disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-clay transition-colors"
                  >
                    <FiMinus size={12} />
                  </button>
                  <span className="w-6 sm:w-8 text-center text-xs sm:text-sm text-ink font-medium">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.key, item.qty + 1)}
                    aria-label="Increase quantity"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-clay hover:bg-clay hover:text-ivory transition-colors"
                  >
                    <FiPlus size={12} />
                  </button>
                </div>

                {/* Subtotal (Desktop view) */}
                <p className="hidden sm:block text-sm font-medium text-ink w-20 text-right shrink-0">
                  ₹{item.price * item.qty}
                </p>

                {/* Trash Button (Desktop view) */}
                <button
                  onClick={() => removeItem(item.key)}
                  aria-label="Remove item"
                  className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-ink/35 hover:text-red-700 hover:bg-ivory transition-colors shrink-0"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-ivory border border-gold/25 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="font-serif text-lg sm:text-xl text-ink mb-4">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm text-ink/75 py-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-ink">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-ink/60">
                <span>Estimated Shipping</span>
                <span className="text-[11px] uppercase tracking-wider text-brand/70 font-medium">
                  Calculated next
                </span>
              </div>
            </div>

            <p className="text-[11px] text-ink/40 mt-3 mb-4 leading-normal">
              Taxes and standard delivery options will be applied during address
              checkout.
            </p>

            <div className="border-t border-gold/20 pt-4 flex justify-between font-serif text-base sm:text-lg text-ink font-semibold">
              <span>Total</span>
              <span>₹{subtotal}</span>
            </div>

            <Link
              href={user ? "/checkout" : "/login?redirect=/checkout"}
              className="mt-6 w-full flex items-center justify-center gap-2 text-center bg-clay text-ivory rounded-full py-3 sm:py-3.5 text-xs sm:text-sm uppercase tracking-widest font-medium hover:bg-clay/90 active:scale-95 transition-all shadow-sm"
            >
              <span>{user ? "Proceed to Checkout" : "Log in to Checkout"}</span>
              <FiArrowRight size={14} />
            </Link>

            <Link
              href="/products"
              className="mt-3 block text-center text-xs text-brand/60 hover:text-clay transition-colors underline-offset-4 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
