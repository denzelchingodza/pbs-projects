"use client";

/**
 * One project (job) in the admin gallery: its photos/videos as a row of
 * thumbnails (each removable on hover), an "add photo" tile at the end for
 * more of the same job, and a header that switches to an inline edit form
 * for title/category/featured instead of a separate page or modal.
 */
import { useState } from "react";
import AddPhotoButton from "./AddPhotoButton";
import { GALLERY_CATEGORIES, categoryLabel } from "@/lib/categories";
import { mediaUrl } from "@/lib/media";
import { deleteProject, deleteProjectMedia, updateProject } from "@/lib/adminApi";
import type { Project } from "@/types";

export default function ProjectCard({
  project,
  onChanged,
}: {
  project: Project;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [category, setCategory] = useState(project.category);
  const [featured, setFeatured] = useState(!!project.is_featured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setBusy(true);
    setError("");
    try {
      await updateProject(project.id, { title, category, is_featured: featured });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePhoto(mediaId: number) {
    if (!confirm("Remove this photo from the project? This can't be undone.")) return;
    setError("");
    try {
      await deleteProjectMedia(project.id, mediaId);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove that photo.");
    }
  }

  async function handleDeleteProject() {
    const warning =
      project.media.length > 1
        ? `Delete this whole project and all ${project.media.length} of its photos? This can't be undone.`
        : "Delete this project? This can't be undone.";
    if (!confirm(warning)) return;
    setBusy(true);
    setError("");
    try {
      await deleteProject(project.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this project.");
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex flex-wrap gap-3 mb-4">
        {project.media.map((m) => (
          <div key={m.id} className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-900 shrink-0 group">
            {m.media_type === "video" ? (
              <video src={mediaUrl(m.image_url)} muted playsInline preload="metadata" className="w-full h-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(m.image_url)} alt={project.title} className="w-full h-full object-cover" />
            )}
            <button
              onClick={() => handleDeletePhoto(m.id)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              aria-label="Remove this photo"
              title="Remove this photo"
            >
              &times;
            </button>
          </div>
        ))}
        <AddPhotoButton projectId={project.id} onAdded={onChanged} onError={setError} />
      </div>

      {editing ? (
        <div className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
            placeholder="Project title"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
          >
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Feature this on the homepage
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={busy}
              className="text-xs font-semibold bg-orange text-white px-3 py-2 rounded-md hover:brightness-95 transition disabled:opacity-60"
            >
              {busy ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setTitle(project.title);
                setCategory(project.category);
                setFeatured(!!project.is_featured);
                setError("");
              }}
              className="text-xs font-semibold text-neutral-500 px-3 py-2 rounded-md hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm font-semibold text-dark">{project.title}</div>
            {project.is_featured && (
              <span className="text-[10px] font-semibold uppercase tracking-widest text-orange bg-orange/10 rounded-full px-2 py-1 shrink-0">
                Featured
              </span>
            )}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            {categoryLabel(project.category)} · {project.media.length}{" "}
            {project.media.length === 1 ? "photo" : "photos"}
          </div>
          <div className="flex gap-4 mt-3">
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-dark hover:text-orange transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteProject}
              disabled={busy}
              className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
            >
              {busy ? "Deleting..." : "Delete Project"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
    </div>
  );
}
