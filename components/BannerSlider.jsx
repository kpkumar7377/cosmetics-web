"use client";

import { useEffect, useRef, useState } from "react";

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 0.12; // fraction of banner width needed to trigger a slide change

export default function BannerSlider({ banners }) {
  const count = banners?.length || 0;
  const multi = count > 1;

  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const trackRef = useRef(null);
  const widthRef = useRef(0);
  const startX = useRef(0);
  const autoplayRef = useRef(null);

  // Keep track width current (for converting drag px -> %), including on resize
  useEffect(() => {
    if (!trackRef.current) return;
    const measure = () => {
      widthRef.current = trackRef.current.offsetWidth;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const goTo = (i) => setIndex(((i % count) + count) % count);

  const startAutoplay = () => {
    if (!multi) return;
    clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, AUTOPLAY_MS);
  };

  useEffect(() => {
    startAutoplay();
    return () => clearInterval(autoplayRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multi, count]);

  const handleStart = (clientX) => {
    if (!multi) return;
    clearInterval(autoplayRef.current);
    setIsDragging(true);
    startX.current = clientX;
  };

  const handleMove = (clientX) => {
    if (!multi || !isDragging) return;
    setDragOffset(clientX - startX.current);
  };

  const handleEnd = () => {
    if (!multi || !isDragging) return;
    const movedFraction = dragOffset / (widthRef.current || 1);
    if (movedFraction < -SWIPE_THRESHOLD) goTo(index + 1);
    else if (movedFraction > SWIPE_THRESHOLD) goTo(index - 1);
    setIsDragging(false);
    setDragOffset(0);
    startAutoplay();
  };

  if (!count) return null;

  // Single banner — static, responsive via <picture>
  if (!multi) {
    const single = banners[0];
    return (
      <div className="relative w-full aspect-[4/5] sm:aspect-[1/1] md:aspect-[16/9] lg:aspect-[21/9] xl:h-[75vh] overflow-hidden bg-sage/20">
        <picture className="w-full h-full block">
          {single.mobileImageUrl && (
            <source media="(max-width: 767px)" srcSet={single.mobileImageUrl} />
          )}
          <img
            src={single.imageUrl}
            alt="Hero Banner"
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
        </picture>
      </div>
    );
  }

  const dragPercent = (dragOffset / (widthRef.current || 1)) * 100;
  const translate = -index * 100 + dragPercent;

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-[1/1] md:aspect-[16/9] lg:aspect-[21/9] xl:h-[75vh] overflow-hidden select-none bg-sage/20">
      <div
        ref={trackRef}
        className="flex h-full w-full"
        style={{
          transform: `translateX(${translate}%)`,
          transition: isDragging
            ? "none"
            : "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => {
          e.preventDefault();
          handleStart(e.clientX);
        }}
        onMouseMove={(e) => isDragging && handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={() => isDragging && handleEnd()}
      >
        {banners.map((b) => (
          <div key={b._id} className="w-full h-full shrink-0">
            <picture className="w-full h-full block">
              {b.mobileImageUrl && (
                <source media="(max-width: 767px)" srcSet={b.mobileImageUrl} />
              )}
              <img
                src={b.imageUrl}
                alt="Store Banner"
                className="w-full h-full object-center pointer-events-none"
                draggable={false}
              />
            </picture>
          </div>
        ))}
      </div>

      {/* Subtle bottom gradient so dots remain legible over light or busy imagery */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10">
        {banners.map((b, i) => (
          <button
            key={b._id}
            onClick={() => {
              goTo(i);
              startAutoplay();
            }}
            aria-label={`Show banner ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index
                ? "w-6 sm:w-8 bg-ivory shadow-sm"
                : "w-1.5 sm:w-2 bg-ivory/50 hover:bg-ivory/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
