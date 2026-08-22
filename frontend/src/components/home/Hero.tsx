/**
 * Homepage hero. The real PBS project photo (frontend/public/images/hero.jpg)
 * is now the full section background instead of sitting in its own side
 * panel, a darker overlay keeps the white text readable over it without the
 * photo itself looking washed out or overexposed. Using next/image instead
 * of a plain <img> here since this is a real local file (not an external
 * URL), so Next.js can serve a properly sized/optimized version
 * automatically, and `priority` skips lazy-loading since this is the first
 * thing visible on the page.
 *
 * The old "Harare · Zimbabwe" eyebrow line is gone (Zimbabwe/Harare are
 * already in the heading's own copy and in the footer), replaced with a
 * short solid orange bar, on a photo background there's no longer a
 * neutral-50 page underneath for a thin text label to sit clearly against,
 * and the brand orange still needs to read immediately, a small solid block
 * of it does that more clearly than small letter-spaced text would here.
 *
 * Two more layers sit between the photo and the text now: a faint
 * window-pane grid (`.pane-grid-light`, see globals.css) placed under the
 * darkening gradient so it naturally fades out on the left where the text
 * sits and shows a little more on the right where the photo itself is
 * clearest, and a soft diagonal light streak above everything, the kind of
 * glare that shows up in real photos of actual glass and polished aluminum,
 * so the hero itself looks like it's being seen through the material PBS
 * works with, not just described in the copy next to it.
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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="A completed PBS Projects installation: large aluminum-framed windows on a home in Harare"
          fill
          priority
          sizes="100vw"
          className="object-cover animate-hero-zoom motion-reduce:animate-none"
        />
        <div className="absolute inset-0 pane-grid-light" aria-hidden="true" />
        {/* Darkens the photo just enough for white text to stay readable
            everywhere on it, heavier on the left where the text sits,
            lighter toward the right so the photo itself still reads clearly,
            not just a flat dark tint over the whole thing. */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark/85 via-dark/60 to-dark/30" />
        {/* A soft, static diagonal glare, low opacity and heavily blurred so
            it reads as light catching glass rather than a design glitch. */}
        <div
          aria-hidden="true"
          className="absolute -inset-y-16 left-[55%] w-1/5 bg-white/10 -rotate-12 blur-2xl pointer-events-none"
        />
      </div>

      <div className="relative px-6 md:px-8 pt-24 pb-24 md:pt-36 md:pb-36">
        <div className="max-w-6xl mx-auto">
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
                className="shine-hover bg-orange text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:brightness-95 transition"
              >
                <T k="hero.ctaQuote" />
              </a>
              <a
                href="#work"
                className="border border-white/40 text-white px-7 py-3.5 rounded-md font-semibold text-sm hover:border-white transition"
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
  );
}
