"use client";

/**
 * Full screen viewer over the current filtered list of photos/videos, with
 * previous/next (arrow buttons, keyboard), a slideshow mode that
 * auto-advances every few seconds until paused or closed, and now a real
 * swipe, the "ease of navigation" specifically asked for, the same drag
 * gesture Apple's own Photos app uses: drag left to bring the next photo
 * in from the right, drag right to bring the previous one in from the
 * left, release past halfway and it commits and slides the rest of the
 * way, release short of that and it springs back to where you started.
 *
 * How the swipe actually works: three slides sit side by side in one row
 * (previous, current, next), the row is 3x the viewer's width, and it's
 * normally sitting shifted left by exactly one slide-width so the current
 * photo is the one centered on screen, with the previous and next photos
 * already sitting just off-screen to either side, ready to be dragged
 * into view rather than only appearing after you've committed to moving.
 * `dragX` is added to that base position live, while your finger (or
 * mouse) is down, `transition` is turned off entirely so the image
 * follows the pointer with zero lag, released the instant it's set. Only
 * on release does a transition come back, either springing back to 0 or
 * animating the rest of the way to a full slide-width, and only once that
 * animation actually finishes does `onNavigate` fire and the row silently
 * reset to center on the new photo, so the swap itself is invisible, it
 * never looks like a jump cut.
 *
 * Only enabled for photos, not videos, native video controls and a
 * pointer-drag gesture on the same element fight each other (the browser
 * wants your drag to scrub the video, not swipe the gallery), simpler and
 * more reliable to keep videos on the arrow buttons and keyboard only,
 * which still work everywhere, this only turns off the drag gesture
 * itself for that one slide.
 */
import { useEffect, useRef, useState } from "react";
import type { PhotoItem } from "./types";
import { mediaUrl } from "@/lib/media";

const SLIDESHOW_INTERVAL_MS = 3500;
const SWIPE_COMMIT_FRACTION = 0.22; // drag past 22% of the viewer's width to commit
const SNAP_TRANSITION_MS = 280;

// Each slide is 33.3333% of the row's own width (the row itself is set to
// 300% of the viewport below), not Tailwind's `w-full`, which would mean
// 100% of the (300%-wide) row, three times too wide. That mismatch is
// exactly the kind of thing that only shows up once you actually drag,
// worth calling out here since it's easy to reintroduce by reaching for
// `w-full` out of habit.
const SLIDE_STYLE: React.CSSProperties = { width: "33.3333%" };

function Slide({ item }: { item: PhotoItem | null }) {
  if (!item) return <div style={SLIDE_STYLE} className="h-full shrink-0" />;
  return (
    <div style={SLIDE_STYLE} className="h-full shrink-0 flex items-center justify-center px-4 sm:px-6">
      {item.media_type === "video" ? (
        <video
          src={mediaUrl(item.image_url)}
          controls
          playsInline
          className="max-w-[95vw] max-h-[85vh] w-auto h-auto rounded-lg pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(item.image_url)}
          alt={item.title}
          className="max-w-[95vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg select-none"
          draggable={false}
        />
      )}
    </div>
  );
}

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

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const dragStartX = useRef(0);
  const pointerId = useRef<number | null>(null);

  const canDrag = !!current && current.media_type !== "video" && items.length > 1;

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

  // A real navigation (button, keyboard, slideshow tick, or a committed
  // swipe) always goes through here, one place that plays the slide
  // animation and only calls onNavigate once it's actually finished.
  function goTo(direction: 1 | -1) {
    if (!open || items.length < 2) return;
    setPlaying(false);
    const width = trackRef.current?.offsetWidth ?? 0;
    setSnapping(true);
    setDragX(-direction * width);
    window.setTimeout(() => {
      const newIndex = ((index as number) + direction + items.length) % items.length;
      setSnapping(false);
      setDragX(0);
      onNavigate(newIndex);
    }, SNAP_TRANSITION_MS);
  }

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(1);
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, items.length, onClose]);

  function onPointerDown(e: React.PointerEvent) {
    if (!canDrag || snapping) return;
    pointerId.current = e.pointerId;
    dragStartX.current = e.clientX;
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || pointerId.current !== e.pointerId) return;
    setDragX(e.clientX - dragStartX.current);
  }

  function endDrag(e: React.PointerEvent) {
    if (!dragging || pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setDragging(false);
    const width = trackRef.current?.offsetWidth ?? 1;
    if (Math.abs(dragX) > width * SWIPE_COMMIT_FRACTION) {
      goTo(dragX < 0 ? 1 : -1);
    } else {
      setSnapping(true);
      setDragX(0);
      window.setTimeout(() => setSnapping(false), SNAP_TRANSITION_MS);
    }
  }

  if (!current) return null;

  const prevItem = items.length > 1 ? items[((index as number) - 1 + items.length) % items.length] : null;
  const nextItem = items.length > 1 ? items[((index as number) + 1) % items.length] : null;

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
              goTo(-1);
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl z-10"
            aria-label="Previous"
          >
            &#8249;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goTo(1);
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl z-10"
            aria-label="Next"
          >
            &#8250;
          </button>
        </>
      )}

      <div
        ref={trackRef}
        className="relative w-full h-full max-w-[95vw] max-h-[85vh] overflow-hidden touch-pan-y"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="flex h-full"
          style={{
            width: "300%",
            transform: `translateX(calc(-33.3333% + ${dragX}px))`,
            transition: dragging ? "none" : `transform ${SNAP_TRANSITION_MS}ms ease-out`,
            cursor: canDrag ? (dragging ? "grabbing" : "grab") : "default",
          }}
        >
          <Slide item={prevItem} />
          <Slide item={current} />
          <Slide item={nextItem} />
        </div>
      </div>

      <span className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs font-medium text-center px-6 max-w-[90vw] truncate pointer-events-none">
        {current.title}
        {items.length > 1 && ` · ${(index as number) + 1} / ${items.length}`}
      </span>
    </div>
  );
}
