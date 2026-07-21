"use client";

/** The 6 product categories, real data from /api/products — no photos required.
 *
 * Redesign notes: cards now use a numbered badge (01, 02, ...) instead of a
 * plain heading — a common "services grid" pattern that gives each card
 * visual weight without needing an icon library as a new dependency. Added
 * a hover elevation so the grid feels interactive even before real project
 * photos exist.
 *
 * Now a Client Component (it wasn't before) since it reads the current
 * language via useLanguage() to translate its heading, the eyebrow label
 * and intro line are static site copy, product names and descriptions
 * themselves come from the database in whatever language they were
 * entered in there.
 */
import type { Product } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ProductsOverview({ products }: { products: Product[] }) {
  const { lang } = useLanguage();
  return (
    <section id="products" className="px-6 md:px-8 py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow={t("products.eyebrow", lang)}
          title={t("products.title", lang)}
          intro={t("products.intro", lang)}
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="group bg-white border border-neutral-200 rounded-xl p-6 hover:border-orange/40 hover:shadow-md transition-all"
            >
              <div className="text-orange text-xs font-bold tracking-widest mb-4">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-semibold text-dark">{p.name}</h3>
              {p.description && (
                <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{p.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
