"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiClock, FiX } from "react-icons/fi";

const RECENT_KEY = "recentSearches";
const MAX_RECENT = 5;

function getRecent() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(query) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const existing = getRecent().filter(
    (q) => q.toLowerCase() !== trimmed.toLowerCase(),
  );
  const updated = [trimmed, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-ink">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchBar({ autoFocus = false, onNavigate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const router = useRouter();

  useEffect(() => setRecent(getRecent()), [open]);

  // Debounced fetch — waits 300ms after the last keystroke before hitting the API
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/suggest?q=${encodeURIComponent(query)}`,
        );
        setResults(res.ok ? await res.json() : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const goToResults = (q) => {
    if (!q.trim()) return;
    saveRecent(q);
    setOpen(false);
    router.push(`/products?search=${encodeURIComponent(q)}`);
    onNavigate?.();
  };

  const goToProduct = (product) => {
    saveRecent(product.name);
    setQuery(product.name);
    setOpen(false);
    router.push(`/products/${product.slug}`);
    onNavigate?.();
  };

  const showingRecent = query.trim().length === 0;
  const list = showingRecent ? recent : results;

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!showingRecent && activeIndex >= 0 && results[activeIndex]) {
        goToProduct(results[activeIndex]);
      } else if (showingRecent && activeIndex >= 0 && recent[activeIndex]) {
        setQuery(recent[activeIndex]);
        goToResults(recent[activeIndex]);
      } else {
        goToResults(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 border border-ink/15 rounded-full px-4 py-2 focus-within:border-clay transition-colors bg-ivory">
        <FiSearch className="text-ink/40 shrink-0" size={16} />
        <input
          type="text"
          autoFocus={autoFocus}
          placeholder="Search for products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full outline-none text-sm bg-transparent placeholder:text-ink/40"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setActiveIndex(-1);
            }}
            aria-label="Clear search"
            className="text-ink/30 hover:text-ink/60"
          >
            <FiX size={15} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 w-full bg-ivory border border-gold/20 rounded-2xl shadow-lg overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {showingRecent ? (
            recent.length > 0 ? (
              <div className="py-2">
                <p className="px-4 py-1.5 text-xs text-ink/40 font-medium">
                  Recent searches
                </p>
                {recent.map((q, i) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuery(q);
                      goToResults(q);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-ink hover:bg-blush transition-colors ${
                      activeIndex === i ? "bg-blush" : ""
                    }`}
                  >
                    <FiClock size={14} className="text-ink/35 shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-4 py-6 text-sm text-ink/40 text-center">
                Start typing to search products
              </p>
            )
          ) : loading ? (
            <p className="px-4 py-6 text-sm text-ink/40 text-center">
              Searching...
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink/40 text-center">
              No products found for &quot;{query}&quot;
            </p>
          ) : (
            <div className="py-2">
              {results.map((p, i) => {
                const finalPrice = p.discount?.isActive
                  ? Math.round(p.basePrice * (1 - p.discount.percent / 100))
                  : p.basePrice;
                return (
                  <button
                    key={p.slug}
                    onClick={() => goToProduct(p)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blush transition-colors ${
                      activeIndex === i ? "bg-blush" : ""
                    }`}
                  >
                    <img
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-sage shrink-0"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-ink truncate">
                        {highlight(p.name, query)}
                      </span>
                      <span className="block text-xs text-ink/45">
                        ₹{finalPrice}
                      </span>
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => goToResults(query)}
                className="w-full text-left px-4 py-3 text-sm text-clay font-medium border-t border-gold/15 hover:bg-blush transition-colors"
              >
                See all results for &quot;{query}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
