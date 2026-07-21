"use client";

/**
 * One project (job) in the admin gallery. Redesign notes: showing every
 * single photo as its own thumbnail on every card at once (an earlier
 * version) got overwhelming fast once there were dozens of real projects,
 * some with 3 or 4 photos each, it read as a wall of thumbnails rather
 * than a list of jobs. Now each card leads with just its cover photo (like
 * the public site and homepage already show projects), a small "+N" badge
 * if there are more, and the individual photo thumbnails, delete-a-photo
 * controls, and the "add another photo" tile all live behind a "Manage
 * Photos" toggle instead of always being on screen. Editing the title,
 * category, and featured flag still happens inline, no separate page.
 *
 * Confirmation notes: deleting a photo or a whole project used to rely on
 * the browser's own native confirm() popup, a plain system dialog with no
 * PBS styling at all. Both now use the shared ConfirmDialog instead, and
 * every action that succeeds (saving an edit, removing a photo, deleting
 * a project) shows a real toast message inside the app, not just a
 * silent refresh.
 */
import { useState } from "react";
import AddPhotoButton from "./AddPhotoButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
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
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [managingPhotos, setManagingPhotos] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [category, setCategory] = useState(project.category);
  const [featured, setFeatured] = useState(!!project.is_featured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmPhotoId, setConfirmPhotoId] = useState<number | null>(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  const cover = project.media[0];
  const extraCount = project.media.length - 1;

  async function handleSave() {
    setBusy(true);
    setError("");
    try {
      await updateProject(project.id, { title, category, is_featured: featured });
      setEditing(false);
      onChanged();
      showToast("Project updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePhoto() {
    if (confirmPhotoId === null) return;
    setError("");
    try {
      await deleteProjectMedia(project.id, confirmPhotoId);
      onChanged();
      showToast("Photo removed.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not remove that photo.", "error");
    } finally {
      setConfirmPhotoId(null);
    }
  }

  async function handleDeleteProject() {
    setBusy(true);
    setError("");
    try {
      await deleteProject(project.id);
      onChanged();
      showToast("Project deleted.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not delete this project.", "error");
      setBusy(false);
    } finally {
      setConfirmDeleteProject(false);
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {cover && (
        <div className="relative aspect-[4/3] bg-neutral-900">
          {cover.media_type === "video" ? (
            <video src={mediaUrl(cover.image_url)} muted playsInline preload="metadata" className="w-full h-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(cover.image_url)} alt={project.title} className="w-full h-full object-cover" />
          )}
          {extraCount > 0 && (
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              +{extraCount} more
            </span>
          )}
          {project.is_featured && (
            <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-widest text-orange bg-white/95 rounded-full px-2.5 py-1">
              Featured
            </span>
          )}
        </div>
      )}

      <div className="p-4">
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
            <div className="text-sm font-semibold text-dark">{project.title}</div>
            <div className="text-xs text-neutral-400 mt-1">
              {categoryLabel(project.category)} &middot; {project.media.length}{" "}
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
                onClick={() => setManagingPhotos((v) => !v)}
                className="text-xs font-semibold text-dark hover:text-orange transition-colors"
              >
                {managingPhotos ? "Hide Photos" : "Manage Photos"}
              </button>
              <button
                onClick={() => setConfirmDeleteProject(true)}
                disabled={busy}
                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60 ml-auto"
              >
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        {managingPhotos && !editing && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 mb-3">
              Every photo and video in this project. Hover one to remove it, or add another below.
            </p>
            <div className="flex flex-wrap gap-3">
              {project.media.map((m) => (
                <div key={m.id} className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-900 shrink-0 group">
                  {m.media_type === "video" ? (
                    <video src={mediaUrl(m.image_url)} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(m.image_url)} alt={project.title} className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => setConfirmPhotoId(m.id)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="Remove this photo"
                    title="Remove this photo"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <AddPhotoButton
                projectId={project.id}
                onAdded={() => {
                  onChanged();
                  showToast("Photo added.");
                }}
                onError={(msg) => showToast(msg, "error")}
              />
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      </div>

      <ConfirmDialog
        open={confirmPhotoId !== null}
        title="Remove this photo?"
        message="This photo will be permanently removed from the project. This cannot be undone."
        onConfirm={handleDeletePhoto}
        onCancel={() => setConfirmPhotoId(null)}
      />

      <ConfirmDialog
        open={confirmDeleteProject}
        title="Delete this project?"
        message={
          project.media.length > 1
            ? `This will delete the whole project and all ${project.media.length} of its photos. This cannot be undone.`
            : "This project will be permanently deleted. This cannot be undone."
        }
        busy={busy}
        onConfirm={handleDeleteProject}
        onCancel={() => setConfirmDeleteProject(false)}
      />
    </div>
  );
}
