"use client";

/**
 * Starts a brand new project (a real job) with its first photo or video,
 * POST /api/admin/gallery. If a job has more than one photo, don't create a
 * second project for it here, use the "Add photo" tile on the project's own
 * card further down the page instead, that's what actually keeps a 3 photo
 * job as 1 project instead of 3 unrelated ones.
 *
 * Accepts both photos and short videos, the backend
 * (app/services/image_service.py) tells them apart by file extension and
 * treats them very differently: photos get auto-resized, videos are stored
 * exactly as uploaded (no compression, see that file's docstring for why).
 * That asymmetry is exactly why this form is upfront about size limits and
 * accepted formats before the admin picks a file, not after a failed upload.
 */
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { createProject } from "@/lib/adminApi";
import { GALLERY_CATEGORIES } from "@/lib/categories";
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, VIDEO_ACCEPT, validateMediaFile } from "@/lib/media";

export default function PhotoUploader({ onUploaded }: { onUploaded: () => void }) {
  const { showToast } = useToast();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("file") as File;

    if (!file?.size) {
      setStatus("error");
      setErrorMsg("Please choose a photo or video to upload.");
      return;
    }

    const validationError = validateMediaFile(file);
    if (validationError) {
      setStatus("error");
      setErrorMsg(validationError);
      return;
    }

    try {
      await createProject(data);
      form.reset();
      setStatus("idle");
      onUploaded();
      showToast("Project created.");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
        <p className="text-sm font-semibold text-dark">Start a new project</p>
        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
          Use this for a job you haven&apos;t added yet. Category decides which
          section it lands in below and which filter shows it on the public
          portfolio page. Photos are automatically resized for phones after
          upload, so any reasonably sized photo works. Got more photos of a
          job that&apos;s already listed below? Use the &quot;Add photo&quot; tile on
          that project&apos;s own card instead of starting a new one here.
        </p>
        <div className="mt-3 flex flex-col gap-1 text-xs text-neutral-600">
          <p>
            <span className="font-semibold text-dark">Photos:</span> JPG, PNG, or WEBP,
            up to {MAX_IMAGE_BYTES / 1024 / 1024}MB.
          </p>
          <p>
            <span className="font-semibold text-dark">Videos:</span> MP4, MOV, or WEBM,
            up to {MAX_VIDEO_BYTES / 1024 / 1024}MB. Videos are stored as uploaded, not
            compressed, so keep clips short and export at a reasonable resolution
            before uploading, a phone video straight off a recent iPhone can easily
            be several hundred MB.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">1. Category</label>
          <select
            name="category"
            required
            className="w-full border border-neutral-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
          >
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">2. Title</label>
          <input
            name="title"
            required
            placeholder="e.g. Sherwood Rd shop front"
            className="w-full border border-neutral-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">3. Photo or video file</label>
          <input
            type="file"
            name="file"
            accept={`${IMAGE_ACCEPT},${VIDEO_ACCEPT}`}
            required
            className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-neutral-100 file:text-sm file:font-medium hover:file:bg-neutral-200"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" name="is_featured" value="true" className="rounded border-neutral-300" />
          4. Feature this on the homepage
        </label>

        {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="bg-orange text-white font-semibold py-3 rounded-md hover:brightness-95 transition disabled:opacity-60"
        >
          {status === "submitting" ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}
