"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiCheckCircle,
  FiMail,
  FiShield,
  FiAward,
  FiPhone,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { FiLock, FiRefreshCw } from "react-icons/fi";
import api from "../lib/api";

const storeLinks = [
  { href: "/products", label: "All Products" },
  { href: "/products?sort=bestseller", label: "Bestsellers" },
  { href: "/products?sort=newest", label: "New Arrivals" },
  { href: "/about", label: "Our Story" },
];

const policyLinks = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/returns-policy", label: "Returns & Exchanges" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const tickerItems = [
  { icon: FiAward, text: "100% Original • Official Brand Store" },
  { icon: FiLock, text: "100% Safe & Secure Payments" },
  { icon: FiShield, text: "Cash on Delivery Available" },
  { icon: FiRefreshCw, text: "Hassle-Free Returns on Unopened Items" },
  { icon: FiCheckCircle, text: "Express Shipping Across AP & Telangana" },
];

function TickerContent() {
  return (
    <>
      {tickerItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <span key={i} className="flex items-center shrink-0">
            <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand font-medium whitespace-nowrap">
              <Icon size={14} className="text-clay shrink-0" />
              {item.text}
            </span>
            <span className="mx-8 text-clay/60">•</span>
          </span>
        );
      })}
    </>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setSubmitting(true);
    setMessage("");
    try {
      const res = await api.post("/newsletter/subscribe", { email });
      setIsSuccess(true);
      setMessage(res.data.message || "Thank you for subscribing!");
      setEmail("");
    } catch (err) {
      setIsSuccess(false);
      setMessage(
        err.response?.data?.message || "Subscription failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Dynamic Trust Marquee */}
      <div className="bg-ivory border-y border-gold/30 overflow-hidden py-3.5 select-none">
        <div className="flex animate-marquee motion-reduce:animate-none items-center">
          <div className="flex shrink-0">
            <TickerContent />
          </div>
          <div className="flex shrink-0" aria-hidden="true">
            <TickerContent />
          </div>
        </div>
      </div>

      <footer className="border-t border-gold/20 bg-brand text-ivory">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-4">
              <Link
                href="/"
                className="font-serif text-2xl sm:text-3xl tracking-wider text-ivory font-normal block hover:opacity-90 transition-opacity"
              >
                COSMETICS STORE
              </Link>
              <p className="text-xs sm:text-sm text-ivory/70 leading-relaxed max-w-sm">
                Clean formulations, natural botanical extracts, and skin-loving
                active beauty essentials crafted with certified purity.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-clay">
                <FiShield size={16} />
                <span className="tracking-wide">Official Brand Store</span>
              </div>
            </div>

            {/* Shop Links */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-clay mb-4">
                Shop
              </h4>
              <ul className="space-y-2.5">
                {storeLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-ivory/70 hover:text-ivory hover:translate-x-0.5 inline-block transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Care Links */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-clay mb-4">
                Customer Care
              </h4>
              <ul className="space-y-2.5">
                {policyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-ivory/70 hover:text-ivory hover:translate-x-0.5 inline-block transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Contact Column */}
            <div className="lg:col-span-4 space-y-5">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-clay mb-2">
                  Stay in the Loop
                </h4>
                <p className="text-xs text-ivory/70 leading-relaxed mb-3">
                  Be the first to receive updates on new launches, seasonal
                  discounts, and beauty guides.
                </p>

                <form
                  onSubmit={handleSubscribe}
                  className="flex items-center rounded-lg border border-gold/30 bg-ivory/5 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold transition-all overflow-hidden max-w-sm"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-transparent px-3.5 py-2.5 text-xs text-ivory placeholder:text-ivory/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    aria-label="Subscribe to newsletter"
                    className="p-2.5 text-clay hover:text-ivory hover:bg-gold/20 transition-colors disabled:opacity-50"
                  >
                    <FiArrowRight size={16} />
                  </button>
                </form>

                {message && (
                  <p
                    className={`text-[11px] mt-2 ${
                      isSuccess ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div className="pt-2 border-t border-ivory/10 space-y-1.5 text-xs text-ivory/70">
                <div className="flex items-center gap-2">
                  <FiMail className="text-clay shrink-0" size={14} />
                  <a
                    href="mailto:support@cosmeticsstore.in"
                    className="hover:text-ivory transition-colors"
                  >
                    support@cosmeticsstore.in
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-clay shrink-0" size={14} />
                  <span>+91 9874569874</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="border-t border-ivory/10 bg-brand/90">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-ivory/50">
            <p>
              © {new Date().getFullYear()} Cosmetics Store. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[11px]">
              <Link
                href="/privacy-policy"
                className="hover:text-ivory/80 transition-colors"
              >
                Privacy
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                className="hover:text-ivory/80 transition-colors"
              >
                Terms
              </Link>
              <span>•</span>
              <Link
                href="/contact"
                className="hover:text-ivory/80 transition-colors"
              >
                Help & Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
