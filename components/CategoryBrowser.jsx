"use client";

import { useState, useRef } from "react";
import ProductCard from "./ProductCard";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function CategoryBrowser({ categoryGroups = [] }) {
  const [activeCategorySlug, setActiveCategorySlug] = useState(
    categoryGroups[0]?.slug || "",
  );
  const pillScrollRef = useRef(null);

  if (!categoryGroups || categoryGroups.length === 0) return null;

  // Selected Category Group
  const activeGroup =
    categoryGroups.find((cat) => cat.slug === activeCategorySlug) ||
    categoryGroups[0];

  // Horizontal scroll buttons for pill list
  const scrollPills = (direction) => {
    if (pillScrollRef.current) {
      const scrollAmount = direction === "left" ? -220 : 220;
      pillScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Header Block */}
      <div className="mb-6 sm:mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-brand font-normal">
          Shop by what you need
        </h2>
        <p className="text-xs sm:text-sm text-brand/60 mt-1">
          From your morning routine to your going-out bag — find it by category.
        </p>
      </div>

      {/* Pill Category Selector Container with controls */}
      <div className="relative flex items-center mb-6 sm:mb-8">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scrollPills("left")}
          aria-label="Scroll left"
          className="hidden sm:flex absolute -left-3 z-10 w-8 h-8 rounded-full bg-white border border-gold/30 shadow-md items-center justify-center text-brand hover:bg-gold/10 transition-colors"
        >
          <FiChevronLeft size={16} />
        </button>

        {/* Scrollable Category Pills */}
        <div
          ref={pillScrollRef}
          className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-2 sm:gap-3 py-1 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categoryGroups.map((cat) => {
            const isSelected =
              (activeGroup?.slug || categoryGroups[0]?.slug) === cat.slug;
            return (
              <button
                key={cat._id || cat.slug}
                type="button"
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? "bg-brand text-ivory border-brand shadow-sm"
                    : "bg-white text-brand border-gold/25 hover:border-gold/50 hover:bg-gold/5"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    isSelected ? "bg-clay text-ivory" : "bg-brand/10 text-brand"
                  }`}
                >
                  {cat.name?.[0] || "C"}
                </span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] ${
                    isSelected ? "text-ivory/70" : "text-brand/50"
                  }`}
                >
                  · {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scrollPills("right")}
          aria-label="Scroll right"
          className="hidden sm:flex absolute -right-3 z-10 w-8 h-8 rounded-full bg-white border border-gold/30 shadow-md items-center justify-center text-brand hover:bg-gold/10 transition-colors"
        >
          <FiChevronRight size={16} />
        </button>
      </div>

      {/* Active Category Product Display */}
      {activeGroup && (
        <div className="w-full">
          <div className="flex items-baseline justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="font-serif text-lg sm:text-2xl text-brand font-medium">
                {activeGroup.name}
              </h3>
              <span className="text-[11px] sm:text-xs text-brand/50 uppercase tracking-wider">
                {activeGroup.count}{" "}
                {activeGroup.count === 1 ? "product" : "products"}
              </span>
            </div>
          </div>

          {/* Fully Responsive Grid: 2 cols on mobile, 3 cols on tablet, 4 cols on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full">
            {activeGroup.products?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
