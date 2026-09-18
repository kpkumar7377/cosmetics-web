"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiShoppingCart,
  FiSearch,
  FiUser,
  FiLogOut,
  FiX,
  FiPackage,
  FiChevronDown,
  FiKey,
  FiMapPin,
  FiMenu,
} from "react-icons/fi";
import SearchBar from "./SearchBar";
import { useCart } from "../lib/cartContext";
import { useAuth } from "../lib/authContext";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const NAV_LINKS = [
  { label: "Best Sellers", href: "/products?sort=bestseller" },
  { label: "Shop All", href: "/products" },
  { label: "Our Story", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const QUOTES = [
  "“Elegance is an attitude, formulation is an art.”",
  "“Pure ingredients, refined formulations, enduring beauty.”",
  "“Confidence begins with thoughtful skincare ritual.”",
];

export default function Navbar() {
  const { count } = useCart();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [mobileMenuOpen]);

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  if (isAuthRoute) {
    return (
      <header className="sticky top-0 z-50 border-b border-gold/20 bg-ivory/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          <Link
            href="/"
            className="font-serif text-lg sm:text-2xl tracking-wider text-brand hover:opacity-90 transition-opacity"
          >
            COSMETICS STORE
          </Link>
          <Link
            href="/"
            className="text-[11px] sm:text-xs uppercase tracking-widest text-brand/70 hover:text-brand transition-colors"
          >
            Back to Shop &rarr;
          </Link>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-ivory/95 backdrop-blur-md transition-all">
        {/* Top Announcement Strip */}
        <div className="bg-brand text-ivory text-[10px] sm:text-[11px] font-normal tracking-normal sm:tracking-[0.18em] uppercase py-1.5 px-4 text-center select-none overflow-hidden min-h-[32px] flex items-center justify-center">
          <span
            key={activeQuoteIndex}
            className="inline-block transition-all duration-700 ease-in-out font-serif italic text-gold/90 leading-tight max-w-full"
          >
            {QUOTES[activeQuoteIndex]}
          </span>
        </div>

        {/* Main Navbar Row */}
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 gap-3">
          {/* Left: Hamburger & Brand Name */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger: Shown on Mobile + Tablets (hidden only on xl 1280px+) */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(true);
                setSearchOpen(false);
              }}
              aria-label="Open Navigation Menu"
              className="xl:hidden p-2 -ml-1 text-brand hover:bg-gold/10 rounded-full transition-colors"
            >
              <FiMenu size={22} />
            </button>

            {/* Brand Logo: Never truncated */}
            <Link
              href="/"
              className="font-serif text-lg sm:text-xl xl:text-2xl tracking-wider text-brand font-normal hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              COSMETICS STORE
            </Link>
          </div>

          {/* Center Links: Visible ONLY on large desktop (xl+) */}
          <nav className="hidden xl:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-widest text-brand/80 hover:text-clay transition-colors font-medium whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-brand shrink-0">
            {/* Search Icon Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search"
              className="p-2 rounded-full hover:bg-gold/10 text-brand transition-colors"
            >
              {searchOpen ? <FiX size={20} /> : <FiSearch size={20} />}
            </button>

            {/* Desktop Account Dropdown: Only shown on xl+ screens */}
            <div className="hidden xl:block">
              {!loading && user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-gold/10 border border-gold/30 transition-all text-xs tracking-wide"
                  >
                    <div className="w-6 h-6 rounded-full bg-clay text-ivory flex items-center justify-center font-serif text-xs uppercase shrink-0">
                      {user.name?.[0] || "U"}
                    </div>
                    <span className="font-medium max-w-[100px] truncate">
                      {user.name?.split(" ")[0]}
                    </span>
                    <FiChevronDown
                      size={12}
                      className={`text-brand/60 transition-transform ${
                        accountMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {accountMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setAccountMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-52 rounded-lg bg-ivory border border-gold/25 shadow-xl py-1 z-50 text-xs text-brand">
                        <div className="px-4 py-2 border-b border-gold/15">
                          <p className="font-semibold truncate">{user.name}</p>
                          <p className="text-[10px] text-brand/60 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/account/orders"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-gold/10 transition-colors"
                        >
                          <FiPackage size={15} /> My Orders
                        </Link>
                        <Link
                          href="/account/addresses"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-gold/10 transition-colors"
                        >
                          <FiMapPin size={15} /> Saved Addresses
                        </Link>
                        <Link
                          href="/account/change-password"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-gold/10 transition-colors"
                        >
                          <FiKey size={15} /> Change Password
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2.5 hover:bg-gold/10 text-red-700/80 transition-colors border-t border-gold/15"
                        >
                          <FiLogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  aria-label="Account"
                  className="p-2 rounded-full hover:bg-gold/10 transition-colors block"
                >
                  <FiUser size={20} />
                </Link>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="relative p-2 rounded-full hover:bg-gold/10 transition-colors"
            >
              <FiShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-clay text-ivory text-[10px] font-bold rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center ring-2 ring-ivory">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Full-width Search Bar Dropdown */}
        {searchOpen && (
          <div className="border-t border-gold/20 bg-ivory/98 px-4 sm:px-8 py-3.5 shadow-md animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-2xl mx-auto">
              <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
            </div>
          </div>
        )}
      </header>

      {/* Drawer: Mounted to body (Active below xl) */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] xl:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="fixed inset-y-0 left-0 w-[82vw] max-w-sm bg-[#FAF7F2] h-full shadow-2xl border-r border-gold/25 flex flex-col z-[10000]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gold/20 bg-ivory shrink-0">
                <span className="font-serif text-sm tracking-[0.2em] font-semibold text-brand uppercase">
                  Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-brand hover:bg-gold/10 rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 bg-[#FAF7F2]">
                <div className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs uppercase tracking-[0.18em] text-brand hover:text-clay font-medium py-3 border-b border-gold/10 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Account Section in Drawer */}
                <div className="pt-2">
                  <p className="text-[10px] font-semibold text-brand/50 uppercase tracking-widest mb-3">
                    Account
                  </p>
                  {user ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gold/10 border border-gold/20 mb-3">
                        <div className="w-8 h-8 rounded-full bg-clay text-ivory flex items-center justify-center font-serif text-sm uppercase shrink-0">
                          {user.name?.[0] || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-brand truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-brand/60 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/account/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-xs text-brand py-2 hover:text-clay transition-colors"
                      >
                        <FiPackage size={16} /> My Orders
                      </Link>
                      <Link
                        href="/account/addresses"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-xs text-brand py-2 hover:text-clay transition-colors"
                      >
                        <FiMapPin size={16} /> Saved Addresses
                      </Link>
                      <Link
                        href="/account/change-password"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-xs text-brand py-2 hover:text-clay transition-colors"
                      >
                        <FiKey size={16} /> Change Password
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-3 text-xs text-red-700/80 py-2.5 hover:text-red-700 w-full text-left transition-colors pt-2"
                      >
                        <FiLogOut size={16} /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full text-center py-2.5 text-xs uppercase tracking-widest bg-brand text-ivory rounded font-medium hover:bg-brand/90 transition-colors shadow-sm"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full text-center py-2.5 text-xs uppercase tracking-widest border border-gold/40 text-brand rounded font-medium hover:bg-gold/10 transition-colors"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-brand/5 border-t border-gold/20 text-center shrink-0">
                <p className="text-[10px] text-brand/70 font-serif italic tracking-wide">
                  Clean Beauty & Thoughtful Formulations
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
