/**
 * The opening block of the About content, now folded into the homepage
 * (id="about") instead of living on its own page, so a visitor never has
 * to leave the homepage to learn who PBS Projects actually is. Sits right
 * after Testimonials and directly above WhyChooseUs and TeamSection below
 * it, all three share the same light gray band (bg-neutral-50) so they
 * read as one continuous "About" section rather than three stacked ones,
 * TeamSection then switches to white as its own closing panel, keeping the
 * homepage's white/gray rhythm intact (see app/page.tsx).
 */
import T from "@/components/i18n/T";
import type { SiteSettings } from "@/types";

export default function AboutIntro({ settings }: { settings: SiteSettings }) {
  const years = settings.founded_year ? new Date().getFullYear() - settings.founded_year : null;

  return (
    <section id="about" className="px-6 md:px-8 pt-20 md:pt-24 pb-4 bg-neutral-50">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">
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
    </section>
  );
}
