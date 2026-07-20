"use client";

/**
 * Owns the interactive state for the gallery page: which category filter
 * is active, and which photo/video (if any) is open in the lightbox.
 * FilterBar/GalleryGrid/Lightbox are all "dumb" components that just
 * receive props, keeping the state in one place here avoids prop
 * drilling or needing a state management library for something this small.
 *
 * Arrangement: picking "All" shows photos grouped into a section per
 * category (skipping any category with zero photos, so the public page
 * never shows an empty placeholder section, that's the admin view's job),
 * instead of one long mixed grid. Picking a specific category filter
 * switches to a single flat grid of just that category.
 *
 * The lightbox needs a flat, ordered list to support previous/next
 * navigation regardless of which view is showing, "flatList" below is
 * that list: the filtered category when one's selected, or every visible
 * photo in category order when "All" is active.
 */
import { useMemo, useState } from "react";
import FilterBar from "./FilterBar";
import GalleryGrid from "./GalleryGrid";
import Lightbox from "./Lightbox";
import { GALLERY_CATEGORIES, categoryLabel } from "@/lib/categories";
import type { Project } from "@/types";

export default function GalleryExplorer({ projects }: { projects: Project[] }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (activeFilter === "all" ? [] : projects.filter((p) => p.category === activeFilter)),
    [projects, activeFilter]
  );

  const groups = useMemo(
    () =>
      GALLERY_CATEGORIES.map((cat) => ({
        ...cat,
        photos: projects.filter((p) => p.category === cat.value),
      })).filter((group) => group.photos.length > 0),
    [projects]
  );

  const flatList = useMemo(
    () => (activeFilter === "all" ? groups.flatMap((g) => g.photos) : filtered),
    [activeFilter, groups, filtered]
  );

  function openProject(project: Project) {
    const idx = flatList.findIndex((p) => p.id === project.id);
    if (idx !== -1) setOpenIndex(idx);
  }

  return (
    <>
      <FilterBar active={activeFilter} onSelect={setActiveFilter} />

      {activeFilter === "all" ? (
        projects.length === 0 ? (
          <GalleryGrid projects={[]} onOpen={openProject} />
        ) : (
          <div className="flex flex-col gap-14">
            {groups.map((group) => (
              <div key={group.value}>
                <h3 className="text-lg font-bold text-dark tracking-tight mb-5">
                  {categoryLabel(group.value)}
                </h3>
                <GalleryGrid projects={group.photos} onOpen={openProject} />
              </div>
            ))}
          </div>
        )
      ) : (
        <GalleryGrid projects={filtered} onOpen={openProject} />
      )}

      <Lightbox
        projects={flatList}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
