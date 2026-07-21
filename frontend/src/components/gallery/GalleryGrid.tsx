/**
 * Dense, iPhone Photos style grid: every photo and video on its own square
 * tile, tightly packed, this is the "see everything" browsing mode for the
 * full gallery page (project cards with a cover photo live on the homepage
 * and admin panel instead, see FeaturedWork.tsx and ProjectCard.tsx).
 * Clicking a tile opens the Lightbox at that photo's position in the
 * current filtered list.
 */
import type { PhotoItem } from "./types";
import { mediaUrl } from "@/lib/media";

function PlayBadge() {
  return (
    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="w-8 h-8 rounded-full bg-black/55 flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
          <path d="M4 2.5v11l10-5.5-10-5.5z" />
        </svg>
      </span>
    </span>
  );
}

export default function GalleryGrid({
  items,
  onOpen,
}: {
  items: PhotoItem[];
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

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 sm:gap-1.5">
      {items.map((item, i) => (
        <button
          key={item.key}
          onClick={() => onOpen(i)}
          className="relative aspect-square overflow-hidden group bg-neutral-900"
        >
          {item.media_type === "video" ? (
            <video
              src={mediaUrl(item.image_url)}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(item.image_url)}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          )}
          {item.media_type === "video" && <PlayBadge />}
        </button>
      ))}
    </div>
  );
}
