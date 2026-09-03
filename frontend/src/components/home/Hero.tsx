/**
 * Homepage hero. The real PBS project photo (frontend/public/images/hero.jpg)
 * is the full section background, a dark gradient scrim keeps the white text
 * readable over it. Using next/image instead of a plain <img> here since
 * this is a real local file (not an external URL), so Next.js can serve a
 * properly sized/optimized version automatically, and `priority` skips
 * lazy-loading since this is the first thing visible on the page.
 *
 * Second pass on the color treatment: the first version ran a full-strength
 * orange gradient across the entire photo (`mix-blend-mode: color`) plus a
 * faint grid pattern over the top of that, direct feedback was that it
 * looked heavy and "not clean," a muddy orange wash rather than a real
 * photo. Both are gone. The photo is shown in its true, real color now, no
 * tint, no filter, that's what actually reads as premium and credible for a
 * trade business, a real finished job speaks for itself. The only overlay
 * left is one plain dark gradient for text contrast, strongest on the left
 * where the heading sits, fading to nothing on the right so the photo's own
 * color is fully visible there. Orange still shows up immediately, just
 * from real UI elements instead of a filter over the photo: the accent bar
 * above the heading, the solid orange CTA button, and a solid orange line
 * along the bottom edge of the whole hero, the same "orange edge" treatment
 * already used on the header (see Navbar.tsx).
 *
 * The old "Harare · Zimbabwe" eyebrow line is gone (Zimbabwe/Harare are
 * already in the heading's own copy and in the footer), replaced with the
 * short solid orange bar mentioned above.
 *
 * Outer wrapper is taller than one screen (`h-[125vh]`), and the actual
 * hero `<section>` inside it is `sticky top-0`, so the photo holds still
 * a beat longer as you start scrolling, Stats then rises up and covers it
 * from below rather than the hero just scrolling away like every other
 * section, the same pinned-then-covered moment funema.co opens with.
 * Navbar is already `sticky top-0 z-50` (see Navbar.tsx), sitting above
 * this in stacking order, so it keeps painting over the pinned photo's
 * top edge exactly the way it already paints over every other section
 * once scrolled past, nothing new to reconcile there. The section itself
 * is now a full `h-full` box instead of being sized by its own padding,
 * so the photo always fills a full screen while pinned, content is
 * centered vertically within it rather than pinned near the top.
 */
import Image from "next/image";
import T from "@/components/i18n/T";

const HERO_IMAGE = "/images/hero.jpg";

const CATEGORIES = [
  "Windows",
  "Doors",
  "Shower Cubicles",
  "Shop Fronts",
  "Suspended Ceilings",
  "Cabinets",
];

export default function Hero() {
  return (
    <div className="relative h-[112vh] md:h-[125vh]">
      <section className="sticky top-0 h-screen overflow-hidden border-b-4 border-orange">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="A completed PBS Projects installation: large aluminum-framed windows on a home in Harare"
            fill
            priority
            sizes="100vw"
            className="object-cover animate-hero-zoom motion-reduce:animate-none"
          />
          {/* One plain dark gradient, left to right, for the heading's
              contrast, that's the only overlay on the photo now. Strong
              enough to read white text over on the left, fully clear by
              the right third so the photo's own real color shows through
              there without anything tinting it. */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark/85 via-dark/45 to-transparent" />
          {/* A second, gentler gradient along the bottom, grounds the photo
              against the section below it and keeps the category chips
              readable without needing their own heavy background. */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
        </div>

        <div className="relative h-full flex items-center px-6 md:px-8">
          <div className="max-w-6xl mx-auto w-full">
            <div className="max-w-2xl">
              <span className="inline-block w-14 h-1.5 bg-orange rounded-full mb-6" aria-hidden="true" />
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tighter text-white">
                <T k="hero.title" />
              </h1>
              <p className="mt-6 text-white/75 text-[15px] leading-relaxed max-w-md">
                <T k="hero.subtitle" />
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="#quote"
                  className="shine-hover font-display bg-orange text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:brightness-95 transition"
                >
                  <T k="hero.ctaQuote" />
                </a>
                <a
                  href="#work"
                  className="font-display border border-white/40 text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:border-white transition"
                >
                  <T k="hero.ctaWork" />
                </a>
              </div>

              <div className="mt-10 pt-8 border-t border-white/15 flex flex-wrap gap-x-3 gap-y-2">
                {CATEGORIES.map((c) => (
                  <span
                    key={c}
                    className="text-xs font-medium text-white/90 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
