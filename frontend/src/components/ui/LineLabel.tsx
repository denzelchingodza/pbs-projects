/**
 * Small "— LABEL" eyebrow: a short horizontal line followed by a caps
 * label, the "ESTABLISHED 2020" / "OUR RECENT" treatment from the
 * reference site, distinct from SectionHeading's own centered orange
 * eyebrow (that one marks the start of a whole section; this one sits
 * inside a two-column block, About and the WhyChooseUs card, next to a
 * heading that isn't centered).
 */
export default function LineLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3 text-dark/60 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
      <span className="w-8 h-px bg-orange" aria-hidden="true" />
      {children}
    </span>
  );
}
