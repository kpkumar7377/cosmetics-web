"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiShoppingCart, FiHeart, FiCheck } from "react-icons/fi";
import Link from "next/link";
import { useCart } from "../lib/cartContext";

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const {
    name,
    slug,
    images,
    basePrice,
    discount,
    variants = [],
    category,
    isFeatured,
  } = product;

  const hasMultipleVariants = Array.isArray(variants) && variants.length > 1;
  const singleVariant =
    Array.isArray(variants) && variants.length === 1 ? variants[0] : null;

  // 1. Resolve safe prices
  const fallbackBase = Number(basePrice) || 0;
  const effectivePrice = singleVariant
    ? Number(singleVariant.price) || fallbackBase
    : fallbackBase;

  const hasDiscount = Boolean(discount?.isActive && discount?.percent > 0);
  const finalPrice = hasDiscount
    ? Math.round(effectivePrice * (1 - discount.percent / 100))
    : effectivePrice;

  // 2. Safe calculation for starting variant price
  const variantPrices = hasMultipleVariants
    ? variants.map((v) => Number(v.price)).filter((p) => !isNaN(p) && p > 0)
    : [];

  const startingVariantPrice =
    variantPrices.length > 0 ? Math.min(...variantPrices) : finalPrice;

  // 3. Stock calculations
  const totalStock = hasMultipleVariants
    ? variants.reduce(
        (sum, v) => sum + (Number(v.availableStock ?? v.stock) || 0),
        0,
      )
    : singleVariant
      ? Number(singleVariant.availableStock ?? singleVariant.stock) || 0
      : Number(product.availableStock ?? product.stock) || 0;

  const isOutOfStock = !hasMultipleVariants && totalStock <= 0;
  const inCart =
    !hasMultipleVariants && items?.some((i) => i.productId === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasMultipleVariants) {
      router.push(`/products/${slug}`);
      return;
    }

    if (inCart) {
      router.push("/cart");
      return;
    }

    if (isOutOfStock) return;

    addItem(product, singleVariant?.sku);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((v) => !v);
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl border border-gold/15 hover:border-gold/30 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Product Image Section */}
      <Link
        href={`/products/${slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-sage/30"
      >
        <img
          src={images?.[0] || "/placeholder.png"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isFeatured ? (
            <span className="bg-clay text-ivory text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-sm">
              Trending
            </span>
          ) : hasDiscount ? (
            <span className="bg-clay text-ivory text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-sm">
              {discount.percent}% off
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleLike}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${
            liked
              ? "bg-clay text-ivory"
              : "bg-ivory/90 text-ink/60 hover:text-ink"
          }`}
        >
          <FiHeart size={14} className={liked ? "fill-current" : ""} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-brand/35 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-ivory text-brand text-[10px] sm:text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded shadow">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {category?.name && (
            <p className="text-[10px] sm:text-xs text-ink/50 uppercase tracking-wider line-clamp-1 mb-0.5 font-medium">
              {category.name}
            </p>
          )}

          <Link
            href={`/products/${slug}`}
            className="block text-xs sm:text-sm font-medium text-ink line-clamp-2 hover:text-clay transition-colors leading-snug"
          >
            {name}
          </Link>

          {/* Stock Notice */}
          <p className="text-[11px] sm:text-xs mt-1">
            {hasMultipleVariants ? (
              <span className="text-ink/50">
                {variants.length} options available
              </span>
            ) : totalStock === 0 ? (
              <span className="text-ink/45 font-medium">Out of stock</span>
            ) : totalStock < 10 ? (
              <span className="text-rose-600 font-medium">
                Only {totalStock} left
              </span>
            ) : totalStock < 20 ? (
              <span className="text-amber-600 font-medium">Low stock</span>
            ) : (
              <span className="text-ink/45">In stock</span>
            )}
          </p>
        </div>

        {/* Price & Action CTA Block */}
        <div className="pt-2.5 border-t border-gold/15 flex flex-col gap-2">
          {/* Price Row: isolates text and guarantees correct currency symbol */}
          <div className="flex items-baseline gap-1.5 flex-wrap min-h-[22px]">
            {hasMultipleVariants ? (
              <div className="flex items-baseline gap-1">
                <span className="text-[11px] text-ink/60">From</span>
                <span className="font-semibold text-xs sm:text-sm md:text-base text-ink tracking-tight">
                  ₹{startingVariantPrice}
                </span>
              </div>
            ) : (
              <>
                <span className="font-semibold text-xs sm:text-sm md:text-base text-ink tracking-tight">
                  ₹{finalPrice}
                </span>
                {hasDiscount && (
                  <span className="line-through text-ink/35 text-[10px] sm:text-xs">
                    ₹{effectivePrice}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Action CTA Button: Spans full width inside its container to prevent overlap */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-medium rounded-full py-2 px-3 transition-all whitespace-nowrap shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
              justAdded
                ? "bg-brand text-ivory scale-[1.02]"
                : inCart
                  ? "bg-ivory text-clay border border-clay hover:bg-clay/5"
                  : "bg-clay text-ivory hover:bg-clay/90 active:scale-95"
            }`}
          >
            {hasMultipleVariants ? (
              "Select Options"
            ) : justAdded ? (
              <>
                <FiCheck size={13} className="shrink-0" /> Added
              </>
            ) : inCart ? (
              "View Cart"
            ) : (
              <>
                <FiShoppingCart size={13} className="shrink-0" /> Add to cart
              </>
            )}
          </button>
        </div>

        {product.codEligible === false && (
          <p className="text-[10px] text-ink/40 -mt-1">COD not available</p>
        )}
      </div>
    </div>
  );
}
