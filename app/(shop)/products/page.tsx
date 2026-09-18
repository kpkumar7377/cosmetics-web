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
  const categoryName = await getCategoryName(searchParams.category);

  const sortHeading =
    searchParams.sort === "newest"
      ? "New Arrivals"
      : searchParams.sort === "bestseller"
        ? "Bestsellers"
        : null;

  const heading = searchParams.search
    ? `Results for "${searchParams.search}"`
    : categoryName || sortHeading || "All Products";

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

      {searchParams.search && (
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 mb-8 text-xs bg-blush text-ink/70 rounded-full pl-3 pr-2 py-1.5 hover:bg-sage transition-colors"
        >
          Search: &quot;{searchParams.search}&quot;
          <FiX size={13} />
        </Link>
      )}

      <ProductListingClient
        category={searchParams.category || ""}
        search={searchParams.search || ""}
        sale={Boolean(searchParams.sale)}
        initialSort={
          searchParams.sort === "newest" || searchParams.sort === "bestseller"
            ? searchParams.sort
            : "featured"
        }
      />
    </div>
  );
}
