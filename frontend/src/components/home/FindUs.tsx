/**
 * Where PBS actually is, real address and an embedded map. This used to
 * live on the old standalone About page (see LocationMap.tsx, Stage 10),
 * but when About was folded into the homepage (Stage 44), only the intro,
 * "why choose us," and team sections moved over, the map itself was left
 * behind and only remained on the Contact page. This brings it back to the
 * homepage too, right where a visitor reading through "who we are" would
 * naturally wonder where the actual workshop is, closing out the About
 * band right before How It Works.
 *
 * White background, same as TeamSection above it and HowItWorks below it,
 * so all three keep reading as one continuous band (see app/page.tsx).
 */
import LocationMap from "@/components/layout/LocationMap";
import type { SiteSettings } from "@/types";

export default function FindUs({ settings }: { settings: SiteSettings }) {
  return (
    <section className="px-6 md:px-8 py-20 bg-paper">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Find Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-4">
            {settings.address}
          </h2>
          <p className="text-neutral-500 text-[15px] leading-relaxed max-w-md">
            That&apos;s our workshop, come by if you&apos;re nearby, though we take on
            jobs across all of Zimbabwe, not just Harare.
          </p>
        </div>
        <LocationMap settings={settings} />
      </div>
    </section>
  );
}
