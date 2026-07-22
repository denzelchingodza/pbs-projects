"use client";

/**
 * Admin gallery management. Projects (real jobs, one or more photos each)
 * are grouped into a section per category (matching how the public
 * portfolio page is organized too, see gallery/page.tsx), so it's
 * immediately obvious which product lines still need real photos.
 */
import { useEffect, useState } from "react";
import PhotoUploader from "@/components/admin/PhotoUploader";
import ProjectCard from "@/components/admin/ProjectCard";
import { GALLERY_CATEGORIES } from "@/lib/categories";
import { getAdminGallery } from "@/lib/adminApi";
import type { Project } from "@/types";

export default function AdminGalleryPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");

  function loadGallery() {
    getAdminGallery()
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load gallery projects."));
  }

  useEffect(loadGallery, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-1">Gallery</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Projects are grouped by category below, so you can see at a glance which
        product lines still need real photos. Each card shows its cover photo
        first, tap &quot;Manage Photos&quot; on a card to see every photo in that
        project, remove one, or add another, a project can have more than one
        photo without creating a new one for the same job.
      </p>

      <div className="mb-10">
        <PhotoUploader onUploaded={loadGallery} />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {projects === null ? (
        <p className="text-sm text-neutral-500">Loading projects...</p>
      ) : (
        <div className="flex flex-col gap-10">
          {GALLERY_CATEGORIES.map((cat) => {
            const catProjects = projects.filter((p) => p.category === cat.value);
            return (
              <div key={cat.value}>
                <div className="flex items-baseline gap-2 mb-4">
                  <h2 className="text-sm font-semibold text-dark">{cat.label}</h2>
                  <span className="text-xs text-neutral-500">
                    {catProjects.length} {catProjects.length === 1 ? "project" : "projects"}
                  </span>
                </div>

                {catProjects.length === 0 ? (
                  <div className="border border-dashed border-neutral-300 rounded-xl py-6 text-center">
                    <p className="text-xs text-neutral-500">No projects in this category yet.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {catProjects.map((p) => (
                      <ProjectCard key={p.id} project={p} onChanged={loadGallery} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
