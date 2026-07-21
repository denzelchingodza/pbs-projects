/**
 * Only real, honest stats. No project count here on purpose: a raw number
 * either reads as impressive when it's high or thin when it's low, and it's
 * exactly the kind of thing that goes stale the moment new work isn't
 * uploaded, the actual portfolio (Our Work, below) is what proves the work,
 * not a counter next to it. What's left is stable, always-true information:
 * how long the business has been running, what it actually builds, and
 * where.
 */
import type { SiteSettings } from "@/types";

export default function Stats({ settings }: { settings: SiteSettings }) {
  const years = settings.founded_year ? new Date().getFullYear() - settings.founded_year : null;
  const addressParts = settings.address.split(",");
  const city = addressParts[addressParts.length - 1]?.trim() || "Harare";

  const items = [
    { value: years !== null ? `${years}+` : "New", label: "Years in Business" },
    { value: "6", label: "Product Categories" },
    { value: city, label: "Based, Serving All Zimbabwe" },
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
