"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FiCheck,
  FiShoppingBag,
  FiMail,
  FiTruck,
  FiArrowRight,
  FiShield,
  FiCopy,
  FiLoader,
} from "react-icons/fi";
import { trackEvent } from "../../../../lib/fpixel";

export default function SuccessContent() {
  const params = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Safely extract params
  const orderNumber = params.get("orderNumber");
  const orderId = params.get("orderId") || orderNumber;
  const value = params.get("value");

  // Ensure params are hydrated before rendering active dynamic links
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Track Meta Purchase Pixel
  useEffect(() => {
    if (!orderNumber) return;
    trackEvent("Purchase", {
      value: value ? Number(value) : undefined,
      currency: "INR",
      content_ids: [orderNumber],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  const copyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine correct target URL
  const trackOrderHref = useMemo(() => {
    if (orderId) return `/account/orders/${orderId}`;
    return "/account/orders";
  }, [orderId]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-lg">
        {/* Main Success Container */}
        <div className="bg-white border border-gold/25 rounded-3xl p-6 sm:p-10 shadow-xl shadow-brand/5 text-center relative overflow-hidden">
          {/* Subtle Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold/30 via-clay to-gold/30" />

          {/* Animated Success Badge */}
          <div className="relative mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping opacity-30" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-inner">
              <FiCheck className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
            </div>
          </div>

          <span className="text-[11px] font-semibold tracking-widest uppercase text-clay">
            Payment & Order Confirmed
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl text-brand font-normal tracking-tight mt-1.5 mb-2">
            Thank you for your order!
          </h1>

          <p className="text-xs sm:text-sm text-brand/70 max-w-sm mx-auto leading-relaxed">
            We have received your purchase and our warehouse team is preparing
            your package.
          </p>

          {/* Order Reference Snippet */}
          <div className="mt-6 mb-8 min-h-[38px] flex items-center justify-center">
            {orderNumber ? (
              <div className="inline-flex items-center gap-2 bg-ivory border border-gold/30 rounded-full px-4 py-2 text-xs">
                <span className="text-brand/60">Reference:</span>
                <span className="font-mono font-semibold text-brand tracking-wide">
                  #{orderNumber}
                </span>
                <button
                  type="button"
                  onClick={copyOrderNumber}
                  aria-label="Copy order number"
                  className="ml-1 text-brand/50 hover:text-brand transition-colors"
                  title="Copy reference number"
                >
                  {copied ? (
                    <span className="text-emerald-700 text-[10px] font-medium">
                      Copied!
                    </span>
                  ) : (
                    <FiCopy size={13} />
                  )}
                </button>
              </div>
            ) : (
              <div className="h-8 w-44 bg-brand/5 rounded-full animate-pulse" />
            )}
          </div>

          {/* Fulfillment Milestones Card */}
          <div className="bg-ivory/60 border border-gold/15 rounded-2xl p-4 sm:p-5 text-left mb-8 space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gold/10 text-brand shrink-0 mt-0.5">
                <FiMail size={16} />
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-semibold text-brand">
                  Receipt in your inbox
                </p>
                <p className="text-brand/60">
                  We've emailed your invoice and confirmation summary with
                  itemized details.
                </p>
              </div>
            </div>

            <div className="border-t border-gold/10 pt-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gold/10 text-brand shrink-0 mt-0.5">
                <FiTruck size={16} />
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-semibold text-brand">Express Dispatch</p>
                <p className="text-brand/60">
                  You'll receive SMS & WhatsApp tracking alerts as soon as the
                  package leaves the warehouse.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isReady ? (
              <Link
                href={trackOrderHref}
                prefetch={false} // Crucial: stops pre-fetching stale cache before order is committed
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-brand text-ivory text-xs font-semibold uppercase tracking-widest hover:bg-brand/90 hover:shadow-md transition-all duration-150"
              >
                <span>Track Order</span>
                <FiArrowRight size={14} />
              </Link>
            ) : (
              <div className="flex-1 py-3 px-5 rounded-xl bg-brand/40 text-ivory text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
                <FiLoader className="animate-spin" size={14} />
                <span>Loading...</span>
              </div>
            )}

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-ivory border border-gold/40 text-brand text-xs font-semibold uppercase tracking-widest hover:bg-gold/10 transition-colors"
            >
              <FiShoppingBag size={14} />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Authenticity Guarantee Footer */}
          <div className="mt-8 pt-6 border-t border-gold/15 flex items-center justify-center gap-2 text-[11px] text-brand/50">
            <FiShield size={14} className="text-clay" />
            <span>Guaranteed 100% genuine formulation direct from brand</span>
          </div>
        </div>
      </div>
    </div>
  );
}
