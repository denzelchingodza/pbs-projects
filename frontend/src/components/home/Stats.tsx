/**
 * Only real, honest stats. No project count here on purpose: a raw number
 * either reads as impressive when it's high or thin when it's low, and it's
 * exactly the kind of thing that goes stale the moment new work isn't
 * uploaded, the actual portfolio (Our Work, below) is what proves the work,
 * not a counter next to it. What's left is stable, always-true information:
 * how long the business has been running, what it actually builds, and
 * where.
 *
 * Each stat now carries a small orange glyph above it, years drawn as a
 * glazing tool, categories as a window pane, location as a pin with a
 * window inside it (the same pin used in WhyChooseUs.tsx), so even this
 * plain numbers strip carries a piece of the site's material language
 * instead of being three bare figures.
 *
 * Pulled up over the pinned hero photo with a negative top margin and a
 * rounded top edge (`-mt-8 md:-mt-12 rounded-t-3xl`), this is the section
 * that visibly rises and covers the hero while it's held in place by its
 * own `sticky` (see Hero.tsx's doc comment), a `relative z-10` keeps it
 * painting above the hero rather than tucking underneath it, and the
 * upward shadow sells the "lifting into place" edge instead of the
 * rounded corner just looking like a flat cutout.
 */
import type { SiteSettings } from "@/types";
import T from "@/components/i18n/T";

function ToolIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2 4.5 11.5a2.1 2.1 0 0 0 3 3L17.5 5" />
      <path d="M17.5 5 19 3.5 21.5 6 20 7.5" />
    </svg>
  );
}

function PaneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M4 12h16M12 4v16" strokeOpacity="0.5" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <rect x="8.75" y="7.75" width="6.5" height="5" rx="0.5" strokeOpacity="0.8" />
    </svg>
  );
}

export default function Stats({ settings }: { settings: SiteSettings }) {
  const years = settings.founded_year ? new Date().getFullYear() - settings.founded_year : null;
  const addressParts = settings.address.split(",");
  const city = addressParts[addressParts.length - 1]?.trim() || "Harare";

  const items = [
    { value: years !== null ? `${years}+` : "New", key: "stats.years", icon: <ToolIcon /> },
    { value: "6", key: "stats.categories", icon: <PaneIcon /> },
    { value: city, key: "stats.based", icon: <PinIcon /> },
  ];

  return (
    <section className="relative z-10 -mt-8 md:-mt-12 rounded-t-3xl border-y border-neutral-100 bg-neutral-50 shadow-[0_-20px_40px_-24px_rgba(35,31,32,0.25)]">
      <div className="max-w-6xl mx-auto grid grid-cols-3 divide-x divide-neutral-200 px-6 md:px-8">
        {items.map((item) => (
          <div key={item.key} className="py-10 text-center">
            <div className="flex justify-center mb-2">{item.icon}</div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-dark tracking-tight">
              {item.value}
            </div>
            <div className="text-neutral-500 text-xs sm:text-sm mt-1.5">
              <T k={item.key} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
