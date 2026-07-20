/**
 * Presentational only, no state of its own. The active filter and the
 * click handler both live in GalleryExplorer.tsx (the parent), so this stays
 * simple and reusable. Category list comes from lib/categories.ts so the
 * labels can never drift from the admin upload form's list.
 */
import { GALLERY_CATEGORIES } from "@/lib/categories";

const CATEGORIES = [{ value: "all", label: "All" }, ...GALLERY_CATEGORIES];

export default function FilterBar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
            active === cat.value
              ? "bg-dark text-white border-dark"
              : "bg-white text-dark border-neutral-300 hover:border-dark"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
