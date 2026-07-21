/**
 * Real gallery layout: bigger tiles than a plain camera roll, each one
 * showing its project's title on hover, grouped into a labeled section per
 * category (cover photo view lives on the homepage and admin panel, see
 * FeaturedWork.tsx and ProjectCard.tsx, this page is the "see everything,
 * organized" browsing mode). When a single category filter is active,
 * `grouped` is false and this renders one plain section with no heading,
 * since the active filter chip already says which category you're looking
 * at. Clicking a tile opens the Lightbox at that photo's position in the
 * full (filtered) list, tracked with a running index across every section
 * so previous/next in the Lightbox moves through the whole list correctly.
 */
import type { PhotoItem } from "./types";
import { mediaUrl } from "@/lib/media";
import { GALLERY_CATEGORIES, categoryLabel } from "@/lib/categories";

function PlayBadge() {
  return (
    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="w-10 h-10 rounded-full bg-black/55 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
          <path d="M4 2.5v11l10-5.5-10-5.5z" />
        </svg>
      </span>
    </span>
  );
}

function Tile({ item, onOpen }: { item: PhotoItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-900 shadow-sm hover:shadow-lg transition-shadow"
    >
      {item.media_type === "video" ? (
        <video
          src={mediaUrl(item.image_url)}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(item.image_url)}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      {item.media_type === "video" && <PlayBadge />}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-8 pb-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs font-semibold truncate text-left">{item.title}</p>
      </div>
    </button>
  );
}

function Grid({ items, onOpen }: { items: PhotoItem[]; onOpen: (index: number) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item, i) => (
        <Tile key={item.key} item={item} onOpen={() => onOpen(i)} />
      ))}
    </div>
  );
}

export default function GalleryGrid({
  items,
  grouped,
  onOpen,
}: {
  items: PhotoItem[];
  grouped: boolean;
  onOpen: (index: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 rounded-lg py-16 text-center text-neutral-500">
        <p className="font-medium">No photos in this category yet.</p>
        <p className="text-sm mt-1">Check back soon, or try a different filter.</p>
      </div>
    );
  }

  if (!grouped) {
    return <Grid items={items} onOpen={onOpen} />;
  }

  // `items` is already ordered category by category (see GalleryExplorer),
  // so walking it once and slicing out each category's own run gives real
  // sections without losing the global index the Lightbox needs.
  let cursor = 0;
  const sections = GALLERY_CATEGORIES.map((cat) => {
    const start = cursor;
    while (cursor < items.length && items[cursor].category === cat.value) cursor++;
    return { category: cat.value, start, slice: items.slice(start, cursor) };
  }).filter((s) => s.slice.length > 0);

  return (
    <div className="flex flex-col gap-14">
      {sections.map((section) => (
        <div key={section.category}>
          <div className="flex items-baseline gap-2.5 mb-5">
            <h3 className="text-lg font-bold text-dark tracking-tight">
              {categoryLabel(section.category)}
            </h3>
            <span className="text-sm text-neutral-400">
              {section.slice.length} {section.slice.length === 1 ? "photo" : "photos"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {section.slice.map((item, i) => (
              <Tile key={item.key} item={item} onOpen={() => onOpen(section.start + i)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
