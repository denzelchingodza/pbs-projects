"use client";

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
 *
 * Grouped categories now open on click instead of all showing every photo
 * at once. Each category starts collapsed, a stacked-photo cover (the
 * category's first few photos fanned out slightly behind the top one, the
 * way a real stack of prints sits on a desk) with a "View all N photos"
 * label, clicking it reveals the full tile grid for that category in
 * place. With PBS's real photo count (dozens per category in some cases),
 * loading the whole gallery open by default meant a lot of scrolling
 * before ever reaching the categories further down, collapsed stacks let
 * a visitor see everything that exists at a glance, then only open what
 * they actually want to look through.
 */
import { useState } from "react";
import Image from "next/image";
import type { PhotoItem } from "./types";
import { mediaUrl } from "@/lib/media";
import { GALLERY_CATEGORIES, categoryLabel } from "@/lib/categories";
import FrameCorners from "@/components/ui/FrameCorners";

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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Tile({ item, onOpen }: { item: PhotoItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="photo-frame shine-hover group relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-900 hover:shadow-lg transition-shadow"
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
        <Image
          src={mediaUrl(item.image_url)}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      {item.media_type === "video" && <PlayBadge />}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-8 pb-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="inline-flex items-center gap-1.5 bg-white/95 text-dark text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full mb-1.5">
          <span className="w-1 h-1 rounded-full bg-orange" aria-hidden="true" />
          {categoryLabel(item.category)}
        </span>
        <p className="text-white text-xs font-semibold truncate text-left">{item.title}</p>
      </div>
      <FrameCorners size="w-4 h-4" />
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

function CategoryStack({ items }: { items: PhotoItem[] }) {
  const cover = items[0];
  const behind = items.slice(1, 3);

  return (
    <div className="relative w-full max-w-[220px] aspect-[4/3]">
      {behind.map((item, i) => (
        <div
          key={item.key}
          aria-hidden="true"
          className={`photo-frame absolute inset-0 rounded-xl overflow-hidden opacity-80 ${
            i === 0 ? "rotate-3 translate-x-2 translate-y-1" : "-rotate-3 -translate-x-1.5 translate-y-1.5"
          }`}
        >
          <Image src={mediaUrl(item.image_url)} alt="" fill sizes="220px" className="object-cover" />
        </div>
      ))}
      <div className="photo-frame shine-hover relative w-full h-full rounded-xl overflow-hidden bg-neutral-900">
        {cover.media_type === "video" ? (
          <video src={mediaUrl(cover.image_url)} muted playsInline preload="metadata" className="w-full h-full object-cover" />
        ) : (
          <Image src={mediaUrl(cover.image_url)} alt={cover.title} fill sizes="220px" className="object-cover" />
        )}
        {cover.media_type === "video" && <PlayBadge />}
        <FrameCorners size="w-4 h-4" />
      </div>
    </div>
  );
}

function CategorySection({
  category,
  slice,
  start,
  onOpen,
}: {
  category: string;
  slice: PhotoItem[];
  start: number;
  onOpen: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 mb-5 text-left group"
        aria-expanded={open}
      >
        <span className="w-1 h-5 bg-orange rounded-full shrink-0" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-dark tracking-tight">{categoryLabel(category)}</h3>
        <span className="text-sm text-neutral-500">
          {slice.length} {slice.length === 1 ? "photo" : "photos"}
        </span>
        <span className="ml-auto text-neutral-400 group-hover:text-orange transition-colors">
          <ChevronIcon open={open} />
        </span>
      </button>

      {open ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {slice.map((item, i) => (
            <Tile key={item.key} item={item} onOpen={() => onOpen(start + i)} />
          ))}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="group text-left">
          <CategoryStack items={slice} />
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-dark group-hover:text-orange transition-colors">
            View all {slice.length} photos
            <ChevronIcon open={false} />
          </span>
        </button>
      )}
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
        <CategorySection
          key={section.category}
          category={section.category}
          slice={section.slice}
          start={section.start}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
