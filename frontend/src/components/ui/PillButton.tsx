/**
 * Fully-rounded (pill) call-to-action button, the shape used for every CTA
 * on the reference site Denzel sent, in place of the site's older
 * rounded-md rectangular buttons. One shared component instead of the same
 * long className string copy-pasted at every call site, so all of them stay
 * visually identical and a future shape/color tweak only happens here once.
 *
 * `next/link`'s `Link` handles a same-page hash like "#quote" exactly like
 * a plain anchor would, so this works everywhere a plain `<a>` or `<Link>`
 * was used before, no separate "internal vs external" branching needed.
 */
import Link from "next/link";

const VARIANTS = {
  // Solid brand orange, for the one primary action in a section.
  solid: "bg-orange border border-orange text-white hover:brightness-95",
  // White outline over a dark/photo background (Hero).
  outlineLight: "border border-white/50 text-white hover:bg-white hover:text-dark",
  // Dark outline over a light background (About, WhyChooseUs, Testimonials).
  outlineDark: "border border-dark/25 text-dark hover:border-orange hover:text-orange",
};

export default function PillButton({
  href,
  variant = "outlineDark",
  children,
  className = "",
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`shine-hover font-display inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-medium text-sm transition ${VARIANTS[variant]} ${className}`}
    >
      {children}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
