"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "../../../components/ProductCard";

const SORT_OPTIONS = {
  featured: "Featured first",
  newest: "New Arrivals",
  bestseller: "Bestsellers",
  priceLow: "Price: low to high",
  priceHigh: "Price: high to low",
  name: "Name: A to Z",
};

const PAGE_SIZE = 24;

export default function ProductListingClient({
  category = "",
  search = "",
  sale = false,
  initialSort = "featured",
}) {
  const [sort, setSort] = useState(initialSort);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const sentinelRef = useRef(null);

  const buildUrl = useCallback(
    (pageNum) => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (sale) params.set("sale", "true");
      params.set("sort", sort);
      params.set("page", String(pageNum));
      params.set("limit", String(PAGE_SIZE));
      return `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`;
    },
    [category, search, sale, sort],
  );

  // (Re)load page 1 whenever the sort or incoming filters change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(buildUrl(1), { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products || []);
        setTotal(data.total ?? (data.products || []).length);
        setHasMore(Boolean(data.hasMore));
        setPage(1);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load products. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, category, search, sale]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    fetch(buildUrl(nextPage), { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load more products");
        return res.json();
      })
      .then((data) => {
        setProducts((prev) => [...prev, ...(data.products || [])]);
        setTotal(data.total ?? total);
        setHasMore(Boolean(data.hasMore));
        setPage(nextPage);
      })
      .catch(() => setError("Unable to load more products right now."))
      .finally(() => setLoadingMore(false));
  }, [buildUrl, hasMore, loading, loadingMore, page, total]);

  // Infinite scroll: watch a sentinel element just below the grid.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const SkeletonGrid = ({ count }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="w-full aspect-[4/5] rounded-2xl bg-sage" />
          <div className="h-4 w-3/4 bg-sage rounded-md mt-3" />
          <div className="h-4 w-1/2 bg-sage rounded-md mt-2" />
        </div>
      ))}
    </div>
  );

  if (loading) return <SkeletonGrid count={8} />;

  if (error && products.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-red-200 rounded-2xl">
        <p className="text-red-700 font-serif text-lg">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-clay/20 rounded-2xl">
        <p className="text-ink/60 font-serif text-lg">No products found</p>
        <p className="text-sm text-ink/40 mt-2">
          Try a different search or browse another category.
        </p>
        <Link
          href="/"
          className="inline-block mt-5 text-sm bg-clay text-ivory rounded-full px-5 py-2 hover:bg-clay-light transition-colors"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink/45">
          Showing {products.length} of {total} products
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-sm border border-clay/25 rounded-full px-3 py-1.5 text-ink bg-ivory outline-none focus:border-clay"
        >
          {Object.entries(SORT_OPTIONS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      {/* Infinite scroll trigger — loads the next page once this scrolls into view */}
      <div ref={sentinelRef} className="h-1" />

      {loadingMore && (
        <div className="mt-10">
          <SkeletonGrid count={4} />
        </div>
      )}

      {!hasMore && !loadingMore && (
        <p className="text-center text-xs text-ink/40 uppercase tracking-widest mt-12">
          You&apos;ve reached the end — {total} products total
        </p>
      )}

      {error && products.length > 0 && (
        <p className="text-center text-xs text-red-600 mt-4">{error}</p>
      )}
    </div>
  );
}
