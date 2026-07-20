"use client";

/**
 * Admin gallery management. Photos are grouped into a section per category
 * (matching how the public portfolio page is now organized too, see
 * gallery/page.tsx), so it's immediately obvious which product lines have
 * real photos and which don't, rather than one long mixed grid you'd have
 * to scan through to check.
 */
import { useEffect, useState } from "react";
import PhotoUploader from "@/components/admin/PhotoUploader";
import { GALLERY_CATEGORIES } from "@/lib/categories";
import { deleteGalleryPhoto, getAdminGallery } from "@/lib/adminApi";
import type { Project } from "@/types";

export default function AdminGalleryPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function loadGallery() {
    getAdminGallery()
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load gallery photos."));
  }

  useEffect(loadGallery, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this photo? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await deleteGalleryPhoto(id);
      setProjects((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-1">Gallery</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Photos are grouped by category below, so you can see at a glance which
        product lines still need real photos.
      </p>

      <div className="mb-10">
        <PhotoUploader onUploaded={loadGallery} />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {projects === null ? (
        <p className="text-sm text-neutral-400">Loading photos...</p>
      ) : (
        <div className="flex flex-col gap-10">
          {GALLERY_CATEGORIES.map((cat) => {
            const photos = projects.filter((p) => p.category === cat.value);
            return (
              <div key={cat.value}>
                <div className="flex items-baseline gap-2 mb-4">
                  <h2 className="text-sm font-semibold text-dark">{cat.label}</h2>
                  <span className="text-xs text-neutral-400">
                    {photos.length} {photos.length === 1 ? "photo" : "photos"}
                  </span>
                </div>

                {photos.length === 0 ? (
                  <div className="border border-dashed border-neutral-300 rounded-xl py-6 text-center">
                    <p className="text-xs text-neutral-400">No photos in this category yet.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {photos.map((p) => (
                      <div key={p.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                        {p.media_type === "video" ? (
                          <video
                            src={p.image_url}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full aspect-[4/3] object-cover bg-neutral-900"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt={p.title} className="w-full aspect-[4/3] object-cover" />
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-sm font-semibold text-dark">
                              {p.title}
                              {p.media_type === "video" && (
                                <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                                  Video
                                </span>
                              )}
                            </div>
                            {p.is_featured && (
                              <span className="text-[10px] font-semibold uppercase tracking-widest text-orange bg-orange/10 rounded-full px-2 py-1 shrink-0">
                                Featured
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                            className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
                          >
                            {deletingId === p.id ? "Deleting..." : "Delete Photo"}
                          </button>
                        </div>
                      </div>
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
