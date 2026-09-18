import BannerSlider from "../components/BannerSlider";
import TrustStrip from "../components/TrustStrip";
import BrandStoryTeaser from "../components/BrandStoryTeaser";
import CategoryBrowser from "../components/CategoryBrowser";
import ProductScrollSection from "../components/ProductScrollSection";
import Reveal from "../components/Reveal";

async function getFeaturedProducts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?featured=true`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  return res.json();
}

async function getNewArrivals() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?sort=newest&limit=10`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  return res.json();
}

async function getBestsellers() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?sort=bestseller&limit=10`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  return res.json();
}

async function getAllProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getBanners() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banners`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const [
    featuredProducts,
    newArrivals,
    bestsellers,
    allProducts,
    categories,
    banners,
  ] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getBestsellers(),
    getAllProducts(),
    getCategories(),
    getBanners(),
  ]);

  // Group products by category (product.category is populated as {_id, name, slug})
  const categoryGroups = categories
    .map((cat) => {
      const products = allProducts.filter((p) => p.category?.slug === cat.slug);
      return { ...cat, count: products.length, products };
    })
    .filter((cat) => cat.count > 0);

  return (
    <div>
      <BannerSlider banners={banners} />

      <Reveal>
        <ProductScrollSection
          title="Our picks for you"
          products={featuredProducts}
          viewAllHref="/products"
        />
      </Reveal>

      <Reveal>
        <ProductScrollSection
          title="New Arrivals"
          products={newArrivals}
          viewAllHref="/products?sort=newest"
        />
      </Reveal>

      <Reveal>
        <ProductScrollSection
          title="Bestsellers"
          products={bestsellers}
          viewAllHref="/products?sort=bestseller"
        />
      </Reveal>

      <TrustStrip productCount={allProducts.length} />

      <Reveal>
        <CategoryBrowser categoryGroups={categoryGroups} />
      </Reveal>

      {categoryGroups.length === 0 && (
        <p className="text-sm text-ink/50 px-6 py-12 text-center">
          No products yet — add some from the admin panel to see them here.
        </p>
      )}

      <Reveal>
        <BrandStoryTeaser />
      </Reveal>
    </div>
  );
}
