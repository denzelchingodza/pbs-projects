"use client";

/**
 * Owns the interactive state for the gallery page: which category filter is
 * active, and which project (if any) is open in the lightbox, and at which
 * photo within it. FilterBar/GalleryGrid/Lightbox are all "dumb" components
 * that just receive props, keeping the state in one place here avoids prop
 * drilling or needing a state management library for something this small.
 *
 * Arrangement: picking "All" shows projects grouped into a section per
 * category (skipping any category with zero projects, so the public page
 * never shows an empty placeholder section, that's the admin view's job),
 * instead of one long mixed grid. Picking a specific category filter
 * switches to a single flat grid of just that category. Each card is one
 * project (its cover photo), not one photo, opening a card shows every
 * photo/video that project actually has.
 */
import { useMemo, useState } from "react";
import FilterBar from "./FilterBar";
import GalleryGrid from "./GalleryGrid";
import Lightbox from "./Lightbox";
import { GALLERY_CATEGORIES, categoryLabel } from "@/lib/categories";
import type { Project } from "@/types";

export default function GalleryExplorer({ projects }: { projects: Project[] }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [openIndex, setOpenIndex] = useState(0);

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

  function openAtStart(project: Project) {
    setOpenProject(project);
    setOpenIndex(0);
  }

  return (
    <>
      <FilterBar active={activeFilter} onSelect={setActiveFilter} />

      {activeFilter === "all" ? (
        projects.length === 0 ? (
          <GalleryGrid projects={[]} onOpen={openAtStart} />
        ) : (
          <div className="flex flex-col gap-14">
            {groups.map((group) => (
              <div key={group.value}>
                <h3 className="text-lg font-bold text-dark tracking-tight mb-5">
                  {categoryLabel(group.value)}
                </h3>
                <GalleryGrid projects={group.photos} onOpen={openAtStart} />
              </div>
            ))}
          </div>
        )
      ) : (
        <GalleryGrid projects={filtered} onOpen={openAtStart} />
      )}

      <Lightbox
        title={openProject?.title ?? ""}
        media={openProject?.media ?? []}
        index={openProject ? openIndex : null}
        onClose={() => setOpenProject(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
