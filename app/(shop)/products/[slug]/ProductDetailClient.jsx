"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiCheck,
  FiShield,
  FiTruck,
  FiRotateCcw,
  FiShare2,
  FiArrowRight,
} from "react-icons/fi";
import { useCart } from "../../../../lib/cartContext";
import { trackEvent } from "../../../../lib/fpixel";

export default function ProductDetailClient({ product }) {
  const { addItem, items } = useCart();
  const router = useRouter();
  const hasVariants = Boolean(product.variants && product.variants.length > 0);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSku, setSelectedSku] = useState(
    hasVariants && product.variants ? product.variants[0].sku : null,
  );
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    trackEvent("ViewContent", {
      content_ids: [product._id],
      content_name: product.name,
      content_type: "product",
      value: product.basePrice,
      currency: "INR",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  const selectedVariant =
    hasVariants && product.variants
      ? product.variants.find((v) => v.sku === selectedSku)
      : null;

  const unitPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const finalPrice = product.discount?.isActive
    ? Math.round(unitPrice * (1 - product.discount.percent / 100))
    : unitPrice;

  // Stock calculations
  const maxStock = selectedVariant
    ? (selectedVariant.availableStock ?? selectedVariant.stock)
    : (product.availableStock ?? product.stock ?? 0);

  const inStock = maxStock > 0;

  // Check if item (specific to this variant or standalone product) is already in the cart
  const inCart = items?.some((i) => {
    if (hasVariants) {
      return i.productId === product._id && i.variantSku === selectedSku;
    }
    return i.productId === product._id;
  });

  const handleAction = () => {
    if (!inStock) return;

    // If item is already added in cart, navigate to cart
    if (inCart) {
      router.push("/cart");
      return;
    }

    // Otherwise, add item to cart
    addItem(product, selectedSku, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const images = product.images?.length ? product.images : ["/placeholder.png"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 pb-24 md:pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Column: Product Imagery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-3 sm:gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-2.5 sm:gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 shrink-0 py-1 md:py-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border transition-all duration-200 bg-ivory/50 shrink-0 ${
                    activeImageIndex === i
                      ? "border-brand ring-1 ring-brand/30 shadow-xs scale-102"
                      : "border-gold/25 hover:border-gold/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} preview ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Primary Viewport Image */}
          <div className="flex-1 relative aspect-square sm:aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden border border-gold/25 bg-white shadow-sm group">
            {product.discount?.isActive && (
              <span className="absolute top-3.5 left-3.5 z-10 bg-clay text-ivory text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-xs">
                {product.discount.percent}% OFF
              </span>
            )}
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>
        </div>

        {/* Right Column: Product Info & Commerce Controls */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Brand/Category Tag */}
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-clay">
              Authentic Beauty
            </span>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    url: window.location.href,
                  });
                }
              }}
              className="text-brand/50 hover:text-brand transition-colors p-1"
              aria-label="Share product"
            >
              <FiShare2 size={16} />
            </button>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-brand font-normal tracking-tight mb-3 leading-tight">
            {product.name}
          </h1>

          {/* Price Block */}
          <div className="flex items-baseline gap-3 mb-4 sm:mb-5 flex-wrap">
            <span className="font-serif text-2xl sm:text-3xl font-semibold text-brand tracking-tight">
              ₹{finalPrice.toLocaleString("en-IN")}
            </span>
            {product.discount?.isActive && (
              <span className="line-through text-sm sm:text-base text-brand/40 font-normal">
                ₹{unitPrice.toLocaleString("en-IN")}
              </span>
            )}
            <span className="text-[10px] sm:text-[11px] text-brand/50 uppercase tracking-wider pl-1">
              (Tax inclusive)
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-brand/70 leading-relaxed mb-5 sm:mb-6 border-b border-gold/15 pb-5 sm:pb-6">
            {product.description}
          </p>

          {/* Variant Selection */}
          {hasVariants && product.variants && (
            <div className="mb-5 sm:mb-6">
              <div className="flex items-center justify-between text-xs font-medium text-brand/80 mb-2.5">
                <span className="uppercase tracking-wider text-[11px]">
                  Select Option
                </span>
                {selectedVariant && (
                  <span className="text-brand/50 text-[11px]">
                    {selectedVariant.label}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedSku === v.sku;
                  return (
                    <button
                      key={v.sku}
                      type="button"
                      onClick={() => {
                        setSelectedSku(v.sku);
                        setQty(1);
                      }}
                      className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium tracking-wide border transition-all duration-150 ${
                        isSelected
                          ? "border-brand bg-brand text-ivory shadow-xs"
                          : "border-gold/30 bg-ivory/40 text-brand hover:border-gold hover:bg-gold/10"
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="mb-5 sm:mb-6 flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                !inStock
                  ? "bg-rose-500"
                  : maxStock < 10
                    ? "bg-amber-500 animate-pulse"
                    : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span
              className={
                !inStock
                  ? "text-rose-700 font-medium"
                  : maxStock < 10
                    ? "text-amber-700 font-medium"
                    : "text-emerald-700 font-medium"
              }
            >
              {!inStock
                ? "Temporarily Sold Out"
                : maxStock < 10
                  ? `Only ${maxStock} left — order soon`
                  : maxStock < 20
                    ? "Low Stock"
                    : "In Stock & Ready to Dispatch"}
            </span>
          </div>

          {/* Desktop Quantity & Action Buttons */}
          <div className="hidden sm:flex items-center gap-4 mb-8">
            {/* Quantity Stepper (Disabled once added in cart) */}
            <div className="flex items-center border border-gold/35 rounded-xl bg-ivory/50 p-1">
              <button
                type="button"
                disabled={qty <= 1 || !inStock || inCart}
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-brand/70 hover:bg-gold/15 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <FiMinus size={13} />
              </button>
              <span className="w-10 text-center font-serif text-sm font-semibold text-brand select-none">
                {qty}
              </span>
              <button
                type="button"
                disabled={qty >= maxStock || !inStock || inCart}
                onClick={() => setQty((prev) => Math.min(maxStock, prev + 1))}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-brand/70 hover:bg-gold/15 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <FiPlus size={13} />
              </button>
            </div>

            {/* Main Action Button */}
            {/* Main Action Button */}
            <button
              type="button"
              disabled={!inStock}
              onClick={handleAction}
              style={{ WebkitTapHighlightColor: "transparent" }}
              className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-xs select-none outline-none focus:outline-none ${
                justAdded
                  ? "bg-brand text-ivory shadow-md scale-[1.01]"
                  : inCart
                    ? "bg-ivory text-clay-dark border-2 border-clay hover:bg-gold/10 active:scale-[0.99]"
                    : inStock
                      ? "bg-clay text-ivory hover:bg-clay-dark hover:shadow-md active:scale-[0.99]"
                      : "bg-brand/20 text-brand/40 cursor-not-allowed"
              }`}
            >
              {justAdded ? (
                <>
                  <FiCheck size={16} className="text-ivory" />
                  <span>Added to Cart</span>
                </>
              ) : inCart ? (
                <>
                  <span>View in Cart</span>
                  <FiArrowRight size={15} />
                </>
              ) : (
                <>
                  <FiShoppingCart size={16} />
                  <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
                </>
              )}
            </button>
          </div>

          {/* Reassurance Accents */}
          <div className="border-t border-gold/15 pt-6 space-y-3.5 text-xs text-brand/70">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/10 text-clay flex items-center justify-center shrink-0">
                <FiShield size={14} />
              </div>
              <span>
                100% genuine formulation sourced directly from the brand
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/10 text-clay flex items-center justify-center shrink-0">
                <FiTruck size={14} />
              </div>
              <span>Standard delivery within 2–4 business days</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/10 text-clay flex items-center justify-center shrink-0">
                <FiRotateCcw size={14} />
              </div>
              <span>
                Hassle-free 7-day returns on unopened, sealed products
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-gold/25 p-3 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-col min-w-0 pl-1">
          <span className="text-[10px] text-brand/60 uppercase tracking-wider">
            Total Price
          </span>
          <span className="font-serif text-base font-semibold text-brand truncate">
            ₹{finalPrice.toLocaleString("en-IN")}
          </span>
        </div>

        <button
          type="button"
          disabled={!inStock}
          onClick={handleAction}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm select-none outline-none focus:outline-none ${
            justAdded
              ? "bg-brand text-ivory"
              : inCart
                ? "bg-ivory text-clay-dark border-2 border-clay"
                : inStock
                  ? "bg-clay text-ivory"
                  : "bg-brand/20 text-brand/40 cursor-not-allowed"
          }`}
        >
          {justAdded ? (
            <>
              <FiCheck size={14} className="text-ivory" />
              <span>Added</span>
            </>
          ) : inCart ? (
            <>
              <span>View Cart</span>
              <FiArrowRight size={14} />
            </>
          ) : (
            <>
              <FiShoppingCart size={14} />
              <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
