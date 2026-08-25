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
 *
 * The photo itself is duotoned now, not shown in full color: grayscaled,
 * then recolored with a dark-to-orange gradient using `mix-blend-mode:
 * color` (the gradient's hue paints onto the photo's own light/dark values,
 * so the actual texture of the aluminum and brick still reads, just tinted
 * rather than washed over). Dark and desaturated up near the text for
 * contrast, warming into real orange lower down, this is what ties this
 * real project photo directly into the brand instead of it just being a
 * photo with an orange button next to it. A separate plain darkening
 * scrim still sits on top of that, purely for the heading's contrast, kept
 * as its own normal-blend layer so it doesn't fight the duotone's colors.
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
      <section className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="A completed PBS Projects installation: large aluminum-framed windows on a home in Harare"
            fill
            priority
            sizes="100vw"
            className="object-cover grayscale animate-hero-zoom motion-reduce:animate-none"
          />
          <div className="absolute inset-0 pane-grid-light" aria-hidden="true" />
          {/* The duotone recolor, dark up top (near-neutral, barely tints the
              grayscale photo) warming into full orange toward the bottom,
              painted onto the photo's own light and dark values via
              mix-blend-mode: color rather than sitting as a flat tint over it. */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange via-orange/70 to-dark mix-blend-color" />
          {/* Plain darkening scrim, left-heavy where the heading sits, right
              side left clear so the duotone's own color still reads there.
              Normal blend on purpose, this is only about text contrast, the
              color work above already did the actual recoloring. */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark/70 via-dark/35 to-transparent" />
          {/* A soft, static diagonal glare, low opacity and heavily blurred so
              it reads as light catching glass rather than a design glitch. */}
          <div
            aria-hidden="true"
            className="absolute -inset-y-16 left-[55%] w-1/5 bg-white/10 -rotate-12 blur-2xl pointer-events-none"
          />
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
