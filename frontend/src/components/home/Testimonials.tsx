"use client";

/**
 * Testimonials, rebuilt as a static asymmetric grid instead of a sliding
 * carousel, the "one small card, one bigger featured card, one more small
 * card" layout from the reference site Denzel sent. With PBS's real
 * testimonial count (a handful, not dozens) a still grid you can see all
 * at once reads more like real, settled proof than a slideshow that hides
 * two of the three behind arrows.
 *
 * The first three (in whatever order the backend returns, oldest/newest
 * first depending on the API) fill the featured layout: the second one
 * becomes the large "featured" card (simply because a middle item having
 * the most visual weight reads more natural than the first), the first and
 * third sit stacked beside it as smaller cards. Any testimonials beyond
 * three render in a plain grid underneath, so this still scales cleanly
 * as more real reviews come in, nothing has to be rebuilt at 4 or 40.
 */
import type { Testimonial } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import Watermark from "@/components/ui/Watermark";
import PillButton from "@/components/ui/PillButton";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-orange text-sm mb-4 tracking-wide" aria-hidden="true">
      {"★".repeat(rating)}
      <span className="text-neutral-200">{"★".repeat(5 - rating)}</span>
    </div>
  );
}

function Author({ item }: { item: Testimonial }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-dark text-white text-xs font-semibold flex items-center justify-center shrink-0">
        {initials(item.client_name)}
      </div>
      <div>
        <div className="font-semibold text-dark text-sm">{item.client_name}</div>
        {item.client_role && <div className="text-xs text-neutral-500">{item.client_role}</div>}
      </div>
    </div>
  );
}

function SmallCard({ item }: { item: Testimonial }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
      <Stars rating={item.rating} />
      <p className="text-dark text-sm leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
      <Author item={item} />
    </div>
  );
}

function BigCard({ item }: { item: Testimonial }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-8 md:p-10 h-full flex flex-col justify-center">
      <Stars rating={item.rating} />
      <p className="text-dark text-base md:text-lg leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
      <Author item={item} />
    </div>
  );
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const { lang } = useLanguage();
  const [first, big, third, ...rest] = testimonials;

  return (
    <section className="relative overflow-hidden px-6 md:px-8 py-20 bg-paper">
      <Watermark text="Testimonials" align="left" />
      <div className="max-w-6xl mx-auto relative">
        <SectionHeading
          align="left"
          eyebrow={t("testimonials.eyebrow", lang)}
          title={t("testimonials.title", lang)}
          intro={t("testimonials.intro", lang)}
        />

        {testimonials.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl py-16 px-6 text-center">
            <p className="font-semibold text-dark">{t("testimonials.emptyTitle", lang)}</p>
            <p className="text-sm text-neutral-500 mt-1.5 max-w-sm mx-auto">
              {t("testimonials.emptyBody", lang)}
            </p>
          </div>
        ) : big ? (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-6">
                <SmallCard item={first} />
                {third && <SmallCard item={third} />}
              </div>
              <BigCard item={big} />
            </div>
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {rest.map((item) => (
                  <SmallCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-xl">
            <SmallCard item={first} />
          </div>
        )}

        <div className="text-center mt-10">
          <PillButton href="/testimonial" variant="outlineDark">
            {t("testimonials.shareLink", lang)}
          </PillButton>
        </div>
      </div>
    </section>
  );
}
