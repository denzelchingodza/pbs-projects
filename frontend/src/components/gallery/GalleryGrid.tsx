/** Presentational grid — click a photo to open it in the Lightbox (handled by the parent). */
import type { Project } from "@/types";

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
          className="relative rounded-lg overflow-hidden aspect-[4/3] group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.image_url}
            alt={p.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-2 left-2 bg-white/90 text-dark text-xs font-semibold px-3 py-1 rounded-full">
            {p.title}
          </span>
        </button>
      ))}
    </div>
  );
}
