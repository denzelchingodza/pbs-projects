/**
 * Small shared label + heading used at the top of every homepage section
 * (Products, Our Work, Testimonials, Get a Quote). Pulling this into one
 * component means the "eyebrow label / big heading / optional intro line"
 * pattern is defined once — change the spacing or type size here and every
 * section updates together, instead of four near-identical blocks of JSX
 * quietly drifting out of sync over time.
 *
 * The eyebrow label now carries `font-display` too, not just the big
 * heading below it. Every section on the site starts with one of these,
 * so this one small shared change is what actually makes the distinctive
 * typeface register while scrolling, rather than it only showing up in
 * the occasional big headline.
 *
 * Eyebrow is plain muted dark caps text now, no orange dot or marker in
 * front of it. A small dot was tried here as a lighter-touch stand-in for
 * the old full line of orange caps text, but repeated at the top of every
 * single section down the page it still read as an obvious decorative
 * flourish, exactly the small-repeated-shape look that reads as generated
 * rather than designed. Plain text carries the same "section label" job
 * without needing a shape at all. The big heading itself stays at
 * `font-semibold`, a lighter, thinner weight reads calmer at this size,
 * still clearly a heading, not shouting.
 */
export default function SectionHeading({
  eyebrow,
  title,
  align = "center",
  intro,
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
  intro?: string;
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-xl mb-12 ${alignClass}`}>
      <p className="font-display text-dark/60 text-xs font-medium uppercase tracking-[0.2em] mb-3">
        {eyebrow}
      </p>
      <h2 className="text-3xl sm:text-4xl font-semibold text-dark tracking-tight">{title}</h2>
      {intro && <p className="text-neutral-500 mt-3 text-[15px] leading-relaxed">{intro}</p>}
    </div>
  );
}
