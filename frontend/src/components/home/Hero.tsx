/**
 * Homepage hero, rebuilt to match the reference site Denzel sent (dark
 * backdrop photo behind bold left-aligned copy, plus a second real project
 * photo floating in its own framed card on the right, overlapping down past
 * the hero's own bottom edge into the section below it). That overlapping
 * card is the one move a plain template site never bothers with, it's what
 * makes a hero read as considered rather than a stock banner.
 *
 * Dropped the previous version's full-screen sticky-pin scroll trick
 * (the section used to stay pinned in place while Stats slid up over it).
 * That effect and an overlapping floating card fight each other, the pin
 * needs the section clipped tight (`overflow-hidden`, exact viewport
 * height) and the floating card needs to spill past that same boundary on
 * purpose. Traded the scroll gimmick for the floating card since that's
 * what was actually asked for here, a fixed, generous height instead
 * (`min-h-[640px] md:min-h-[760px]`) reads calmer anyway, closer to how a
 * real business's site behaves rather than an app-like scroll trick.
 *
 * The background photo is shown in its true real color (no tint/filter,
 * same reasoning as before, a real finished job speaks for itself), only a
 * dark gradient sits over it for text contrast. The floating card on the
 * right shows a second, different real project (whatever's currently
 * featured in the gallery), not a repeat of the backdrop photo, so the two
 * photos together read as "here's real, varied work," not one image used
 * twice. Falls back to the same hero photo if no projects are loaded yet
 * (a brand-new/empty database), never a blank box.
 */
import Image from "next/image";
import T from "@/components/i18n/T";
import FrameCorners from "@/components/ui/FrameCorners";
import PillButton from "@/components/ui/PillButton";
import type { Project } from "@/types";
import { mediaUrl } from "@/lib/media";

const HERO_IMAGE = "/images/hero.jpg";

const CATEGORIES = [
  "Windows",
  "Doors",
  "Shower Cubicles",
  "Shop Fronts",
  "Suspended Ceilings",
  "Cabinets",
];

export default function Hero({ projects = [] }: { projects?: Project[] }) {
  const featured = [...projects].sort((a, b) => Number(b.is_featured) - Number(a.is_featured))[0];
  const cardImage = featured?.media[0] ? mediaUrl(featured.media[0].image_url) : HERO_IMAGE;
  const cardAlt = featured?.title ?? "A completed PBS Projects installation";

  return (
    <section className="relative bg-dark overflow-visible border-b-4 border-orange">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="A completed PBS Projects installation: large aluminum-framed windows on a home in Harare"
          fill
          priority
          sizes="100vw"
          className="object-cover animate-hero-zoom motion-reduce:animate-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/60 to-dark/20" />
      </div>

      <div className="relative px-6 md:px-8 pt-32 pb-40 md:pt-40 md:pb-56 min-h-[640px] md:min-h-[760px] flex items-center">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3 max-w-xl">
            <span className="inline-block w-14 h-1.5 bg-orange rounded-full mb-6" aria-hidden="true" />
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tighter text-white">
              <T k="hero.title" />
            </h1>
            <p className="mt-6 text-white/75 text-[15px] leading-relaxed max-w-md">
              <T k="hero.subtitle" />
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <PillButton href="/#quote" variant="solid">
                <T k="hero.ctaQuote" />
              </PillButton>
              <PillButton href="/#work" variant="outlineLight">
                <T k="hero.ctaWork" />
              </PillButton>
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

          {/* The floating card. Negative bottom margin pulls the next
              section (Stats) up underneath it, so the card visually
              overlaps past the hero's own bottom edge, this is what
              actually needs the section above to have no overflow-hidden
              of its own. Hidden below `lg` since there's no graceful way
              to overlap a card on a stacked mobile layout, the photo
              simply appears inline there instead (fine, this is a bonus
              detail on wider screens, not the only place a real photo
              shows up on the page). */}
          <div className="hidden lg:block lg:col-span-2 relative z-20 -mb-28">
            <div className="photo-frame relative rounded-2xl overflow-hidden aspect-[4/5] bg-neutral-900">
              <Image
                src={cardImage}
                alt={cardAlt}
                fill
                sizes="40vw"
                className="object-cover"
              />
              <FrameCorners />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
