"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiShield, FiTruck } from "react-icons/fi";

export default function TrustStrip({ productCount = 0 }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-sage overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Photo collage — slides in from the left */}
        <div
          className={`relative grid grid-cols-2 gap-4 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:translate-x-0 motion-reduce:opacity-100 ${
            visible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
          }`}
        >
          <img
            src="/collage-1.jpg"
            alt="Cosmetics store products"
            className="col-span-1 row-span-2 w-full h-full object-cover rounded-2xl aspect-[3/4]"
          />
          <img
            src="/collage-2.jpg"
            alt="Skincare being applied"
            className="w-full object-cover rounded-2xl aspect-square"
          />
          <div className="bg-brand text-ivory rounded-2xl aspect-square flex flex-col items-center justify-center text-center p-4">
            <p className="font-serif text-3xl">{productCount}+</p>
            <p className="text-xs text-ivory/70 mt-1">
              Products curated for you
            </p>
          </div>
        </div>

        {/* Content — slides in from the right */}
        <div
          className={`transition-all duration-700 ease-out delay-150 motion-reduce:transition-none motion-reduce:translate-x-0 motion-reduce:opacity-100 ${
            visible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
          }`}
        >
          <h2 className="font-serif text-3xl md:text-4xl leading-tight">
            <span className="text-ink">Beauty essentials, </span>
            <span className="text-clay">done right</span>
          </h2>
          <p className="text-ink/60 mt-4 leading-relaxed max-w-md">
            We stock what actually works — skincare, makeup, and haircare picked
            for real routines, not just what's trending.
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-clay flex items-center justify-center shrink-0">
                <FiShield size={18} className="text-ivory" />
              </div>
              <div>
                <p className="font-medium text-ink">100% Genuine</p>
                <p className="text-sm text-ink/60 mt-1">
                  Sourced directly from each brand — never third-party
                  resellers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-clay flex items-center justify-center shrink-0">
                <FiTruck size={18} className="text-ivory" />
              </div>
              <div>
                <p className="font-medium text-ink">
                  COD &amp; Doorstep Delivery
                </p>
                <p className="text-sm text-ink/60 mt-1">
                  Cash on Delivery available, with tracked shipping across AP
                  &amp; Telangana.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/products"
            className="inline-block mt-8 bg-clay text-ivory text-sm font-medium rounded-full px-6 py-3 hover:bg-clay-light transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
