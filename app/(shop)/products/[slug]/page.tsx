import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

async function getProduct(slug) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductDetailPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return notFound();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-ink/40">
          <Link href="/" className="hover:text-clay transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-clay transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-ink/70 truncate max-w-[200px]">
            {product.name}
          </span>
        </div>

        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-clay hover:text-clay-light transition-colors shrink-0"
        >
          Back to Shop
        </Link>
      </div>

      <ProductDetailClient product={product} />
    </div>
  );
}
