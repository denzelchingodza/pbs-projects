/**
 * Full Products page, a Server Component fetching the real product list.
 * The homepage has a shorter teaser version of this same grid
 * (components/home/ProductsOverview.tsx); this page is the full version
 * with more room per product and a direct link into the quote form.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Products & Services",
  description: "Windows, doors, shower cubicles, shop fronts, suspended ceilings and cabinets, made and fitted by PBS Projects in Harare.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main>
      <section className="px-6 md:px-8 pt-16 pb-14 md:pt-20 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            What We Build
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-dark">
            Our Products
          </h1>
          <p className="mt-5 text-neutral-500 text-[15px] leading-relaxed">
            Six product lines, made to measure. Every job is quoted individually,
            so sizes, finishes, and materials are matched to your space, not sold
            off a shelf.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-8 pb-20 bg-white">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
          {products.map((p: { id: number; name: string; description?: string }, i: number) => (
            <div
              key={p.id}
              className="bg-white border border-neutral-200 rounded-xl p-7 hover:border-orange/40 hover:shadow-md transition-all"
            >
              <div className="text-orange text-xs font-bold tracking-widest mb-4">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h2 className="text-lg font-bold text-dark">{p.name}</h2>
              {p.description && (
                <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{p.description}</p>
              )}
              <Link
                href="/quote"
                className="inline-block mt-5 text-sm font-semibold text-orange hover:text-dark transition-colors"
              >
                Request a quote for {p.name.toLowerCase()} &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 bg-neutral-50 text-center">
        <h2 className="text-2xl font-bold text-dark tracking-tight mb-3">
          Not sure which product fits your space?
        </h2>
        <p className="text-neutral-500 text-sm mb-7 max-w-md mx-auto">
          Send us a few details and photos of the space, we&apos;ll recommend the
          right option and give you a straight quote.
        </p>
        <Link
          href="/quote"
          className="inline-block bg-orange text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:brightness-95 transition"
        >
          Get a Free Quote
        </Link>
      </section>
    </main>
  );
}
