/**
 * The opening block of the About content, now folded into the homepage
 * (id="about") instead of living on its own page, so a visitor never has
 * to leave the homepage to learn who PBS Projects actually is. Sits right
 * after Testimonials and directly above WhyChooseUs and TeamSection below
 * it, all three share the same light gray band (bg-neutral-50) so they
 * read as one continuous "About" section rather than three stacked ones,
 * TeamSection then switches to white as its own closing panel, keeping the
 * homepage's white/gray rhythm intact (see app/page.tsx).
 *
 * Below the intro text sits a small photo mosaic of real completed jobs
 * (whatever the admin has featured, or the earliest uploaded if nothing is
 * featured yet), the same "About text next to real work" pairing used on
 * the jdwglass.co.za reference site, built from the same project photos
 * already shown in FeaturedWork rather than any new or stock imagery.
 */
import Image from "next/image";
import T from "@/components/i18n/T";
import FrameCorners from "@/components/ui/FrameCorners";
import type { SiteSettings, Project } from "@/types";
import { mediaUrl } from "@/lib/media";

export default function AboutIntro({
  settings,
  projects,
}: {
  settings: SiteSettings;
  projects: Project[];
}) {
  const years = settings.founded_year ? new Date().getFullYear() - settings.founded_year : null;

  const mosaic = [...projects]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .filter((p) => p.media[0]?.media_type === "image")
    .slice(0, 4);

  return (
    <section id="about" className="px-6 md:px-8 pt-20 md:pt-24 pb-4 bg-neutral-50">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-display text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">
          <T k="about.eyebrow" />
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark">
          <T k="about.title" />
        </h2>
        <p className="mt-5 text-neutral-500 text-[15px] leading-relaxed">
          {years !== null ? (
            <T k="about.introWithYears" values={{ business: settings.business_name, years }} />
          ) : (
            <T k="about.introNoYears" values={{ business: settings.business_name }} />
          )}
        </p>
      </div>

      {mosaic.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {mosaic.map((p) => (
            <div key={p.id} className="photo-frame shine-hover relative aspect-square rounded-xl overflow-hidden">
              <Image
                src={mediaUrl(p.media[0].image_url)}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
              <FrameCorners size="w-4 h-4" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
