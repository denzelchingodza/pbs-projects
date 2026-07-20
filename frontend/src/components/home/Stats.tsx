/**
 * Deliberately shows only numbers we can actually back up:
 * - "Years in business" is computed from settings.founded_year (real).
 * - "Projects completed" is the real count from /api/gallery — this will
 *   honestly read 0 until the admin uploads real project photos. That's
 *   correct behavior, not a bug: we don't fabricate a fake number here.
 * No "provinces served" stat, since that's not something we actually track —
 * it's mentioned as a plain sentence elsewhere instead of a fake counter.
 *
 * Redesign notes: replaced the dark boxed-card pair with a plain light strip
 * with vertical dividers — reads as a calm confirmation of scale rather than
 * a second, competing "hero" section right under the real hero.
 */
import type { SiteSettings } from "@/types";

export default function Stats({
  settings,
  projectCount,
}: {
  settings: SiteSettings;
  projectCount: number;
}) {
  const years = settings.founded_year ? new Date().getFullYear() - settings.founded_year : null;

  const items = [
    { value: years !== null ? `${years}+` : "New", label: "Years in Business" },
    { value: `${projectCount}`, label: "Projects Completed" },
    { value: "6", label: "Product Categories" },
  ];

  return (
    <section className="border-y border-neutral-100 bg-neutral-50">
      <div className="max-w-6xl mx-auto grid grid-cols-3 divide-x divide-neutral-200 px-6 md:px-8">
        {items.map((item) => (
          <div key={item.label} className="py-10 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-dark tracking-tight">
              {item.value}
            </div>
            <div className="text-neutral-500 text-xs sm:text-sm mt-1.5">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
