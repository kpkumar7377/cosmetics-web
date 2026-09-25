import Link from "next/link";
import { FiX } from "react-icons/fi";
import BackButton from "../../../components/BackButton";
import ProductListingClient from "./ProductListingClient";

async function getCategoryName(slug) {
  if (!slug) return null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const categories = await res.json();
  return categories.find((c) => c.slug === slug)?.name || null;
}

export default async function ProductListingPage({ searchParams }) {
  // Await searchParams for Next.js 15+ compatibility (safe for Next.js 14 too)
  const resolvedParams = await searchParams;

  const category = resolvedParams?.category || "";
  const search = resolvedParams?.search || "";
  const sort = resolvedParams?.sort || "";
  const sale = Boolean(resolvedParams?.sale);

  const categoryName = await getCategoryName(category);

  const sortHeading =
    sort === "newest"
      ? "New Arrivals"
      : sort === "bestseller"
        ? "Bestsellers"
        : null;

  const heading = search
    ? `Results for "${search}"`
    : categoryName || sortHeading || "All Products";

  // Build a unique key so React resets state on query param transitions
  const instanceKey = `${category}-${search}-${sort}-${sale}`;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 text-sm text-ink/40 mb-4">
        <Link href="/" className="hover:text-clay transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-ink/70">{heading}</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-3xl text-ink">{heading}</h1>
        <BackButton />
      </div>

      {search && (
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 mb-8 text-xs bg-blush text-ink/70 rounded-full pl-3 pr-2 py-1.5 hover:bg-sage transition-colors"
        >
          Search: &quot;{search}&quot;
          <FiX size={13} />
        </Link>
      )}

      <ProductListingClient
        key={instanceKey}
        category={category}
        search={search}
        sale={sale}
        initialSort={
          sort === "newest" || sort === "bestseller" ? sort : "featured"
        }
      />
    </div>
  );
}
