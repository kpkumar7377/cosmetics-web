import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

async function getAboutPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/about`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

function excerpt(html, maxLength = 180) {
  const text = (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text)
    return "Skincare, makeup, and haircare — chosen for Andhra Pradesh and Telangana, delivered to your door.";
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

export default async function BrandStoryTeaser() {
  const page = await getAboutPage();

  return (
    <section className="bg-blush">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8 items-center">
        <h2 className="font-serif text-3xl md:text-4xl leading-tight text-ink">
          {page?.title || "Our story"}
        </h2>
        <div className="md:border-l md:border-clay/20 md:pl-8">
          <p className="text-ink/70 leading-relaxed">
            {excerpt(page?.contentHtml)}
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 mt-5 text-sm text-clay hover:text-clay-light transition-colors"
          >
            Read our story <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
