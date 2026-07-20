/**
 * Homepage hero. No real PBS project photos exist yet, so this uses a
 * placeholder photo of Harare (CC BY-SA 3.0, Wikimedia Commons — see the URL
 * below for the source/license/attribution) instead of a generic stock photo
 * unrelated to the business. Swap `HERO_IMAGE` for a real photo of PBS's own
 * work the moment one is available — search "PLACEHOLDER" in this repo to
 * find every spot that still needs a real photo.
 *
 * Redesign notes: replaced the old full-bleed dark-overlay photo background
 * (a "poster" look) with a two-column layout — text on a plain white
 * background, photo in its own framed panel on the right. This is the
 * standard "corporate services" hero pattern: it reads as more established
 * and less like a single marketing banner.
 */
const HERO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/5/51/Harare%2C_Zimbabwe._04.JPG"; // PLACEHOLDER — swap for a real PBS project photo

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
    <section className="px-6 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-5">
            Harare · Zimbabwe
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-dark">
            Glass &amp; aluminum work you can trust
          </h1>
          <p className="mt-6 text-neutral-500 text-[15px] leading-relaxed max-w-md">
            Windows, doors, shower cubicles, shop fronts, suspended ceilings and
            cabinets, installed by a team that&apos;s been in the trade for
            years, not just in business for three.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#quote"
              className="bg-orange text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:brightness-95 transition"
            >
              Get a Free Quote
            </a>
            <a
              href="#work"
              className="border border-neutral-300 text-dark px-7 py-3.5 rounded-md font-semibold text-sm hover:border-dark transition"
            >
              View Our Work
            </a>
          </div>

          <div className="mt-10 pt-8 border-t border-neutral-100 flex flex-wrap gap-x-3 gap-y-2">
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className="text-xs font-medium text-neutral-500 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          {/* Flat accent block behind the photo for depth, using the brand
              orange sparingly instead of covering the whole hero in it. */}
          <div className="absolute -inset-4 bg-orange/10 rounded-2xl -z-10" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element -- external placeholder URL, matches FeaturedWork.tsx's approach */}
          <img
            src={HERO_IMAGE}
            alt="View of Harare, Zimbabwe"
            className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
