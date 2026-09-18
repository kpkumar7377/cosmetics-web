"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiPackage,
  FiChevronRight,
  FiShoppingBag,
  FiCalendar,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../../../../lib/api";

const statusConfig = {
  placed: {
    label: "Placed",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
    dotClass: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200/80",
    dotClass: "bg-blue-500",
  },
  shipped: {
    label: "In Transit",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200/80",
    dotClass: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    dotClass: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
    dotClass: "bg-rose-500",
  },
};

export default function OrdersClient() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = () => {
    setIsLoading(true);
    setError(null);
    api
      .get("/orders/my")
      .then((res) => setOrders(res.data))
      .catch(() =>
        setError("Failed to retrieve your order history. Please try again.")
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto w-full px-1">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="animate-pulse bg-white border border-gold/15 rounded-xl p-4 sm:p-5 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-brand/10 rounded-md" />
                <div className="h-3 w-40 bg-brand/5 rounded-md" />
              </div>
              <div className="h-6 w-20 bg-brand/10 rounded-full shrink-0" />
            </div>
            <div className="mt-4 pt-3 border-t border-gold/10 flex justify-between items-center">
              <div className="h-4 w-24 bg-brand/10 rounded-md" />
              <div className="h-4 w-16 bg-brand/10 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="rounded-xl border border-red-200/70 bg-red-50/40 p-6 sm:p-8 text-center max-w-md mx-auto my-6 px-4">
        <FiAlertCircle className="mx-auto text-red-500 mb-3" size={32} />
        <p className="text-xs sm:text-sm font-medium text-brand mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand bg-ivory border border-gold/30 rounded-md hover:bg-gold/10 transition-colors shadow-xs"
        >
          <FiRefreshCw size={13} /> Try Again
        </button>
      </div>
    );
  }

  // Empty State
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-4 sm:px-6 border border-dashed border-gold/30 rounded-2xl bg-white/50 max-w-xl mx-auto my-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-gold/10 text-brand flex items-center justify-center mb-4">
          <FiPackage size={24} />
        </div>
        <h3 className="font-serif text-base sm:text-lg text-brand font-medium tracking-tight">
          No orders placed yet
        </h3>
        <p className="text-xs text-brand/60 mt-1 max-w-xs mx-auto">
          When you make a purchase, order updates and courier tracking info will appear right here.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-ivory text-xs font-medium tracking-widest uppercase rounded-lg hover:bg-brand/90 hover:shadow-md transition-all duration-150"
        >
          <FiShoppingBag size={14} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-3.5 max-w-3xl mx-auto w-full px-1">
      {orders.map((o) => {
        const config = statusConfig[o.status] || {
          label: o.status,
          badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
          dotClass: "bg-gray-400",
        };

        const formattedDate = new Date(o.createdAt).toLocaleDateString(
          "en-IN",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        );

        const itemCount =
          o.items?.reduce((sum, item) => sum + (item.qty || 1), 0) || null;

        return (
          <Link
            key={o._id}
            href={`/account/orders/${o._id}`}
            className="group block bg-white border border-gold/20 rounded-xl p-4 sm:p-5 hover:border-gold/60 hover:shadow-sm transition-all duration-200"
          >
            {/* Top Row: Order ID and Status Badge */}
            <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2 xs:gap-3">
              <div className="space-y-1">
                <span className="font-serif text-sm sm:text-base font-semibold text-brand tracking-wide group-hover:text-clay transition-colors block">
                  Order #{o.orderNumber}
                </span>
                
                {/* Meta details (wraps cleanly on mobile) */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-brand/60 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <FiCalendar size={12} />
                    {formattedDate}
                  </span>
                  {itemCount && (
                    <>
                      <span>•</span>
                      <span>
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start xs:self-auto shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 sm:py-1 rounded-full border ${config.badgeClass} capitalize tracking-wide`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}
                  />
                  {config.label}
                </span>
              </div>
            </div>

            {/* Bottom Row: Total Price and Details Trigger */}
            <div className="mt-3.5 pt-3 border-t border-gold/10 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-brand/50 text-[11px] sm:text-xs">Total:</span>
                <span className="font-serif text-xs sm:text-sm font-semibold text-brand tracking-tight">
                  ₹{Number(o.total).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="inline-flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs font-medium text-brand/70 group-hover:text-clay group-hover:translate-x-0.5 transition-all">
                <span>View Details</span>
                <FiChevronRight size={14} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}