"use client";

/**
 * Full-screen photo/video viewer with previous/next navigation (arrow
 * buttons, on-screen and keyboard) across whatever list the parent is
 * currently showing. Renders nothing when index is null.
 */
import { useEffect } from "react";
import type { Project } from "@/types";

export default function Lightbox({
  projects,
  index,
  onClose,
  onNavigate,
}: {
  projects: Project[];
  index: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}) {
  const open = index !== null;
  const current = open ? projects[index as number] : null;

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(((index as number) + 1) % projects.length);
      if (e.key === "ArrowLeft") onNavigate(((index as number) - 1 + projects.length) % projects.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, index, projects.length, onClose, onNavigate]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-8 text-white text-3xl leading-none" aria-label="Close">
        &times;
      </button>

      {projects.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(((index as number) - 1 + projects.length) % projects.length);
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl"
            aria-label="Previous"
          >
            &#8249;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(((index as number) + 1) % projects.length);
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl"
            aria-label="Next"
          >
            &#8250;
          </button>
        </>
      )}

      {current.media_type === "video" ? (
        <video
          src={current.image_url}
          controls
          autoPlay
          playsInline
          className="max-w-full max-h-full rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current.image_url}
          alt={current.title}
          className="max-w-full max-h-full rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs font-medium">
        {current.title}
        {projects.length > 1 && ` · ${(index as number) + 1} / ${projects.length}`}
      </span>
    </div>
  );
}
