/**
 * Homepage hero. Now using a real PBS project photo (frontend/public/images/
 * hero.jpg), replacing the earlier placeholder Harare street photo. Using
 * next/image instead of a plain <img> here since this is a real local file
 * (not an external URL), so Next.js can serve a properly sized/optimized
 * version automatically, and `priority` skips lazy-loading since this is
 * the first thing visible on the page.
 */
import Image from "next/image";
import T from "@/components/i18n/T";
import Motto from "@/components/ui/Motto";

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
    <section className="px-6 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em]">
              Harare · Zimbabwe
            </p>
            <span className="w-px h-3.5 bg-neutral-300" aria-hidden="true" />
            <Motto className="text-dark text-xs uppercase tracking-[0.2em]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-dark">
            <T k="hero.title" />
          </h1>
          <p className="mt-6 text-neutral-500 text-[15px] leading-relaxed max-w-md">
            <T k="hero.subtitle" />
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#quote"
              className="bg-orange text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:brightness-95 transition"
            >
              <T k="hero.ctaQuote" />
            </a>
            <a
              href="#work"
              className="border border-neutral-300 text-dark px-7 py-3.5 rounded-md font-semibold text-sm hover:border-dark transition"
            >
              <T k="hero.ctaWork" />
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
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={HERO_IMAGE}
              alt="A completed PBS Projects installation: large aluminum-framed windows on a home in Harare"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover animate-hero-zoom motion-reduce:animate-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
