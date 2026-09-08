"use client";

/**
 * Testimonials, a static asymmetric grid (one small card, one bigger
 * featured card, one more small card) rather than a sliding carousel. With
 * PBS's real testimonial count (a handful, not dozens) a still grid you
 * can see all at once reads more like real, settled proof than a
 * slideshow that hides two of the three behind arrows.
 *
 * Two follow-up changes from feedback on the first version of this grid:
 *
 * The cards themselves read less like a generic review-widget template
 * now: no bordered-box-plus-star-row-plus-circle-avatar formula repeated
 * identically four times. A large, faint quotation mark sits behind the
 * text (the one purely decorative flourish here, on purpose), the avatar
 * is a soft orange-tinted initial instead of a solid dark circle (every
 * testimonial getting its own little block of solid dark/orange added up
 * fast), and the star rating is smaller and quieter, a real detail, not
 * the loudest thing on the card.
 *
 * The "share your own" CTA moved from a plain link below the grid into an
 * actual card inside the grid itself (InviteCard), styled like an open
 * slot waiting to be filled rather than a separate marketing button
 * bolted on afterward. It always has a seat in the layout, next to the
 * real testimonials, exactly as real a part of the section as they are.
 */
import Link from "next/link";
import type { Testimonial } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import Watermark from "@/components/ui/Watermark";
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

function QuoteMark() {
  return (
    <svg
      aria-hidden="true"
      width="42"
      height="32"
      viewBox="0 0 42 32"
      fill="currentColor"
      className="text-orange/10 mb-1"
    >
      <path d="M0 32V19.2C0 8.53 6.4 1.6 17.6 0l1.87 4.8C12.53 6.4 8.8 10.13 8.8 16h9.87v16H0Zm23.2 0V19.2c0-10.67 6.4-17.6 17.6-19.2l1.87 4.8c-6.94 1.6-10.67 5.33-10.67 11.2h9.87v16H23.2Z" />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-orange/80 text-xs tracking-wide" aria-hidden="true">
      {"★".repeat(rating)}
      <span className="text-neutral-200">{"★".repeat(5 - rating)}</span>
    </div>
  );
}

function Author({ item }: { item: Testimonial }) {
  return (
    <div className="mt-5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-orange/10 text-orange border border-orange/20 text-xs font-semibold flex items-center justify-center shrink-0">
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
    <div className="relative bg-white border border-neutral-200/70 rounded-2xl p-6 overflow-hidden">
      <QuoteMark />
      <Stars rating={item.rating} />
      <p className="mt-2 text-dark text-sm leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
      <Author item={item} />
    </div>
  );
}

function BigCard({ item }: { item: Testimonial }) {
  return (
    <div className="relative bg-white border border-neutral-200/70 rounded-2xl p-8 md:p-10 h-full flex flex-col justify-center overflow-hidden">
      <QuoteMark />
      <Stars rating={item.rating} />
      <p className="mt-2 text-dark text-base md:text-lg leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
      <Author item={item} />
    </div>
  );
}

function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function InviteCard() {
  return (
    <Link
      href="/testimonial"
      className="group h-full flex flex-col items-center justify-center text-center gap-2.5 rounded-2xl border border-dashed border-neutral-300 hover:border-orange p-6 transition-colors"
    >
      <span className="w-9 h-9 rounded-full bg-orange/10 text-orange flex items-center justify-center">
        <PenIcon />
      </span>
      <p className="text-sm font-medium text-dark">Had work done by us?</p>
      <p className="text-xs text-neutral-500 max-w-[22ch]">
        Share your own experience, it takes a minute and helps the next customer decide.
      </p>
      <span className="text-xs font-medium text-orange group-hover:underline underline-offset-2">
        Share Your Experience
      </span>
    </Link>
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

        {!first ? (
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
            <div className="bg-white border border-neutral-200/70 rounded-2xl p-6 flex flex-col justify-center">
              <p className="font-semibold text-dark text-sm">{t("testimonials.emptyTitle", lang)}</p>
              <p className="text-sm text-neutral-500 mt-1.5">{t("testimonials.emptyBody", lang)}</p>
            </div>
            <InviteCard />
          </div>
        ) : big ? (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-6">
                <SmallCard item={first} />
                {third ? <SmallCard item={third} /> : <InviteCard />}
              </div>
              <BigCard item={big} />
            </div>
            {/* Once there's a third real card, the invite moves down here
                instead, always rendered, never gated behind "only if
                there's overflow", it's a permanent seat in the layout,
                not an occasional extra. */}
            {third && (
              <div
                className={`grid gap-6 mt-6 ${
                  rest.length === 0 ? "max-w-sm" : "sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {rest.map((item) => (
                  <SmallCard key={item.id} item={item} />
                ))}
                <InviteCard />
              </div>
            )}
          </>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
            <SmallCard item={first} />
            <InviteCard />
          </div>
        )}
      </div>
    </section>
  );
}
