/**
 * Presentational grid of project cards. Each card shows the project's cover
 * photo (media[0]) plus a "+N more" badge when the job has extra photos, one
 * card per project rather than one card per photo, this is what keeps a 3
 * photo job from reading as 3 separate, unrelated pieces of work. Clicking a
 * card opens that project's own photos in the Lightbox (handled by the
 * parent), where every photo for that job can be browsed individually.
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
      {projects.map((p) => {
        const cover = p.media[0];
        if (!cover) return null; // a project with no photos left isn't kept around server side
        const extraCount = p.media.length - 1;

        return (
          <button
            key={p.id}
            onClick={() => onOpen(p)}
            className="relative rounded-lg overflow-hidden aspect-[4/3] group bg-neutral-900"
          >
            {cover.media_type === "video" ? (
              <video
                src={mediaUrl(cover.image_url)}
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl(cover.image_url)}
                alt={p.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            {cover.media_type === "video" && <PlayBadge />}
            {extraCount > 0 && (
              <span className="absolute top-2 right-2 bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                +{extraCount} more
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-2 px-3">
              <span className="text-white text-xs font-semibold">{p.title}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
