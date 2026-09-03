"use client";

/** The 6 product categories, real data from /api/products, each now backed
 * by a real photo of PBS's own work in that category (see coverPhotoForCategory
 * in lib/categories.ts), the photo-led product tile pattern from the
 * jdwglass.co.za reference site, adapted to PBS's own colors and real
 * project photos rather than stock imagery. A category with no uploaded
 * project photos yet falls back to the plain numbered card instead of a
 * blank or placeholder image, never a fake photo standing in for real work.
 *
 * Client Component since it reads the current language via useLanguage()
 * to translate its heading; the eyebrow label and intro line are static
 * site copy, product names and descriptions themselves come from the
 * database in whatever language they were entered in there.
 */
import Image from "next/image";
import type { Product, Project } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import FrameCorners from "@/components/ui/FrameCorners";
import { productSlugToCategory, coverPhotoForCategory } from "@/lib/categories";
import { mediaUrl } from "@/lib/media";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ProductsOverview({
  products,
  projects,
}: {
  products: Product[];
  projects: Project[];
}) {
  const { lang } = useLanguage();
  return (
    <section id="products" className="px-6 md:px-8 py-20 bg-paper">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow={t("products.eyebrow", lang)}
          title={t("products.title", lang)}
          intro={t("products.intro", lang)}
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((p, i) => {
            const cover = coverPhotoForCategory(projects, productSlugToCategory(p.slug));
            const badge = (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange text-white text-xs font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
            );
            return (
              <div
                key={p.id}
                className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-orange/40 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {cover ? (
                  <div className="photo-frame shine-hover relative aspect-[4/3] bg-neutral-900">
                    <Image
                      src={mediaUrl(cover)}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 z-10">{badge}</div>
                    <FrameCorners />
                  </div>
                ) : (
                  <div className="p-6 pb-0">{badge}</div>
                )}
                <div className="p-6">
                  <h3 className="font-semibold text-dark">{p.name}</h3>
                  {p.description && (
                    <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{p.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
