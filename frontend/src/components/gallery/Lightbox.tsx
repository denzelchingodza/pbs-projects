"use client";

/**
 * Full screen viewer over the current filtered list of photos/videos, with
 * previous/next (arrow buttons, keyboard) and a slideshow mode that
 * auto-advances every few seconds until paused or closed.
 *
 * Sizing note: the image/video is capped with explicit viewport units
 * (max-w-[95vw] max-h-[85vh]) and object-contain rather than relying on a
 * parent's percentage height, which is what the previous version did and
 * is exactly the kind of thing that quietly breaks (image cropped or cut
 * off) depending on the browser and the photo's own aspect ratio. This way
 * the whole photo is always visible, shrunk to fit, never cropped.
 */
import { useEffect, useState } from "react";
import type { PhotoItem } from "./types";
import { mediaUrl } from "@/lib/media";

const SLIDESHOW_INTERVAL_MS = 3500;

export default function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: PhotoItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}) {
  const open = index !== null;
  const current = open ? items[index as number] : null;
  const [playing, setPlaying] = useState(false);

  // Stop the slideshow whenever the lightbox closes, so reopening a photo
  // never silently starts auto-advancing again.
  useEffect(() => {
    if (!open) setPlaying(false);
  }, [open]);

  useEffect(() => {
    if (!playing || !open || items.length < 2) return;
    const id = setInterval(() => {
      onNavigate(((index as number) + 1) % items.length);
    }, SLIDESHOW_INTERVAL_MS);
    return () => clearInterval(id);
  }, [playing, open, index, items.length, onNavigate]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(((index as number) + 1) % items.length);
      if (e.key === "ArrowLeft") onNavigate(((index as number) - 1 + items.length) % items.length);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, index, items.length, onClose, onNavigate]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 sm:top-6 sm:right-8 text-white text-3xl leading-none z-10"
        aria-label="Close"
      >
        &times;
      </button>

      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPlaying((p) => !p);
          }}
          className="absolute top-5 left-5 sm:top-6 sm:left-8 text-white text-xs font-semibold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full flex items-center gap-2 z-10 transition-colors"
        >
          {playing ? (
            <>
              <span aria-hidden="true">&#10074;&#10074;</span> Pause
            </>
          ) : (
            <>
              <span aria-hidden="true">&#9654;</span> Slideshow
            </>
          )}
        </button>
      )}

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPlaying(false);
              onNavigate(((index as number) - 1 + items.length) % items.length);
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl"
            aria-label="Previous"
          >
            &#8249;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPlaying(false);
              onNavigate(((index as number) + 1) % items.length);
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
          className="max-w-[95vw] max-h-[85vh] w-auto h-auto rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(current.image_url)}
          alt={current.title}
          className="max-w-[95vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <span className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs font-medium text-center px-6 max-w-[90vw] truncate">
        {current.title}
        {items.length > 1 && ` · ${(index as number) + 1} / ${items.length}`}
      </span>
    </div>
  );
}
