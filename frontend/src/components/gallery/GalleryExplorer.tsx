"use client";

/**
 * The full "see everything" gallery browser: every photo and video across
 * every project, flattened out of the projects list (a project with 3
 * photos contributes 3 tiles here, not 1), filterable by category, laid
 * out as a dense iPhone Photos style grid. Clicking any tile opens it in
 * the Lightbox with previous/next across the current filter and an
 * optional slideshow.
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

  const items = useMemo(
    () => (activeFilter === "all" ? allItems : allItems.filter((i) => i.category === activeFilter)),
    [allItems, activeFilter]
  );

  return (
    <>
      <FilterBar active={activeFilter} onSelect={setActiveFilter} />
      <GalleryGrid items={items} onOpen={setOpenIndex} />
      <Lightbox items={items} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
    </>
  );
}
