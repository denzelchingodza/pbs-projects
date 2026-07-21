/**
 * Presentational grid, click a photo or video to open it in the Lightbox
 * (handled by the parent). Videos render as a muted preview with a play
 * icon overlay so a visitor knows it's a video before clicking, rather
 * than a static frame that looks identical to a photo.
 */
import type { Project } from "@/types";
import { mediaUrl } from "@/lib/media";

function PlayBadge() {
  return (
    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="w-11 h-11 rounded-full bg-black/55 flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
          <path d="M4 2.5v11l10-5.5-10-5.5z" />
        </svg>
      </span>
    </span>
  );
}

export default function GalleryGrid({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (project: Project) => void;
}) {
  if (projects.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 rounded-lg py-16 text-center text-neutral-500">
        <p className="font-medium">No photos in this category yet.</p>
        <p className="text-sm mt-1">Check back soon, or try a different filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => onOpen(p)}
          className="relative rounded-lg overflow-hidden aspect-[4/3] group bg-neutral-900"
        >
          {p.media_type === "video" ? (
            <video
              src={mediaUrl(p.image_url)}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(p.image_url)}
              alt={p.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {p.media_type === "video" && <PlayBadge />}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-2 px-3">
            <span className="text-white text-xs font-semibold">{p.title}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
