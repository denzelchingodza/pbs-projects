/**
 * Small shared label + heading used at the top of every homepage section
 * (Products, Our Work, Testimonials, Get a Quote). Pulling this into one
 * component means the "eyebrow label / big heading / optional intro line"
 * pattern is defined once — change the spacing or type size here and every
 * section updates together, instead of four near-identical blocks of JSX
 * quietly drifting out of sync over time.
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
      <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3">
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-dark tracking-tight">{title}</h2>
      {intro && <p className="text-neutral-500 mt-3 text-[15px] leading-relaxed">{intro}</p>}
    </div>
  );
}
