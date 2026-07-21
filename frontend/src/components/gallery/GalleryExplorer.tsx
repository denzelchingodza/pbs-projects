"use client";

/**
 * The full "see everything" gallery browser: every photo and video across
 * every project, flattened out of the projects list (a project with 3
 * photos contributes 3 tiles here, not 1), filterable by category. Laid
 * out as real gallery sections, one per category, each with its own
 * heading and count, rather than one undifferentiated camera roll, so it
 * reads as a curated portfolio instead of a raw photo dump. Clicking any
 * tile opens it in the Lightbox with previous/next across the current
 * filter and an optional slideshow.
 *
 * Projects still matter, just not here: the homepage teaser (FeaturedWork)
 * and the admin panel (ProjectCard) both work at the project level, one
 * cover photo per job. This page is the one place meant for scrolling
 * through literally all of them.
 */
import { useMemo, useState } from "react";
import FilterBar from "./FilterBar";
import GalleryGrid from "./GalleryGrid";
import Lightbox from "./Lightbox";
import type { PhotoItem } from "./types";
import type { Project } from "@/types";
import { GALLERY_CATEGORIES } from "@/lib/categories";

export default function GalleryExplorer({ projects }: { projects: Project[] }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const allItems = useMemo<PhotoItem[]>(
    () =>
      projects.flatMap((p) =>
        p.media.map((m) => ({
          key: `${p.id}-${m.id}`,
          image_url: m.image_url,
          media_type: m.media_type,
          title: p.title,
          category: p.category,
        }))
      ),
    [projects]
  );

  // With "All" selected, items are grouped by category (in the same fixed
  // order as the filter chips) rather than raw upload order, so the same
  // category's photos always sit together as one real section instead of
  // however they happened to land in the database. A single category
  // filter just needs its own photos, in their existing order.
  const items = useMemo(() => {
    if (activeFilter !== "all") return allItems.filter((i) => i.category === activeFilter);
    return GALLERY_CATEGORIES.flatMap((cat) => allItems.filter((i) => i.category === cat.value));
  }, [allItems, activeFilter]);

  return (
    <>
      <FilterBar active={activeFilter} onSelect={setActiveFilter} />
      <GalleryGrid items={items} grouped={activeFilter === "all"} onOpen={setOpenIndex} />
      <Lightbox items={items} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
    </>
  );
}
