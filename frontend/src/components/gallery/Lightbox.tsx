"use client";

/**
 * Full screen viewer for one project's photos/videos, with previous/next
 * navigation (arrow buttons, on screen and keyboard) across just that
 * project's own media list, this is the "view all the pictures individually"
 * behavior for a job that has more than one photo. Renders nothing when
 * index is null.
 */
import { useEffect } from "react";
import type { ProjectMedia } from "@/types";
import { mediaUrl } from "@/lib/media";

export default function Lightbox({
  title,
  media,
  index,
  onClose,
  onNavigate,
}: {
  title: string;
  media: ProjectMedia[];
  index: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}) {
  const open = index !== null;
  const current = open ? media[index as number] : null;

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(((index as number) + 1) % media.length);
      if (e.key === "ArrowLeft") onNavigate(((index as number) - 1 + media.length) % media.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, index, media.length, onClose, onNavigate]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-8 text-white text-3xl leading-none" aria-label="Close">
        &times;
      </button>

      {media.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(((index as number) - 1 + media.length) % media.length);
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl"
            aria-label="Previous"
          >
            &#8249;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(((index as number) + 1) % media.length);
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
          src={mediaUrl(current.image_url)}
          controls
          autoPlay
          playsInline
          className="max-w-full max-h-full rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(current.image_url)}
          alt={title}
          className="max-w-full max-h-full rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs font-medium">
        {title}
        {media.length > 1 && ` · ${(index as number) + 1} / ${media.length}`}
      </span>
    </div>
  );
}
