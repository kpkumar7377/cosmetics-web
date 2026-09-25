"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";

const SORTS = {
  default: {
    label: "Featured first",
    fn: (a, b) => Number(b.isFeatured || 0) - Number(a.isFeatured || 0),
  },
  relevance: {
    label: "Recommended",
    fn: () => 0, // Retains server-side order
  },
  priceLow: {
    label: "Price: low to high",
    fn: (a, b) => a.basePrice - b.basePrice,
  },
  priceHigh: {
    label: "Price: high to low",
    fn: (a, b) => b.basePrice - a.basePrice,
  },
  name: {
    label: "Name: A to Z",
    fn: (a, b) => a.name.localeCompare(b.name),
  },
};

export default function ProductGrid({ products = [], preserveOrder = false }) {
  const [sort, setSort] = useState(preserveOrder ? "relevance" : "default");

  const sortOptions = useMemo(() => {
    if (preserveOrder) {
      return {
        relevance: SORTS.relevance,
        priceLow: SORTS.priceLow,
        priceHigh: SORTS.priceHigh,
        name: SORTS.name,
      };
    }
    return SORTS;
  }, [preserveOrder]);

  const sortedProducts = useMemo(() => {
    const activeSortFn = SORTS[sort]?.fn || SORTS.relevance.fn;
    return [...products].sort(activeSortFn);
  }, [products, sort]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink/45">{products.length} products</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-sm border border-clay/25 rounded-full px-3 py-1.5 text-ink bg-ivory outline-none focus:border-clay"
        >
          {Object.entries(sortOptions).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {sortedProducts.map((p) => (
          <ProductCard key={p.slug || p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
