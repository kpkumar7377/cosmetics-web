import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "./ProductCard";

export default function ProductScrollSection({ title, products, viewAllHref }) {
  if (!products || products.length === 0) return null;

  return (
    <section>
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h1 className="font-serif text-3xl text-ink">{title}</h1>
          <Link
            href={viewAllHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-medium text-ink/70 hover:text-clay transition-colors shrink-0"
          >
            View All Products
            <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto snap-x pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p) => (
            <div key={p.slug} className="w-56 shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
          <Link
            href={viewAllHref}
            className="w-56 shrink-0 snap-start flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/20 hover:border-clay hover:bg-clay/5 transition-colors text-center px-4"
          >
            <span className="w-11 h-11 rounded-full bg-ink/5 flex items-center justify-center">
              <FiArrowRight size={18} className="text-ink/60" />
            </span>
            <span className="text-xs uppercase tracking-widest font-medium text-ink/70">
              View All Products
            </span>
          </Link>
        </div>
        <Link
          href={viewAllHref}
          className="sm:hidden mt-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-medium text-ink/70 hover:text-clay transition-colors"
        >
          View All Products
          <FiArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
