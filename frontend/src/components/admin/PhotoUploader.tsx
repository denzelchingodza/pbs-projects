"use client";

/**
 * Upload form for POST /api/admin/gallery (multipart: title, category,
 * is_featured, file). Fields are ordered as a real decision flow: pick the
 * category first (that's what determines where the photo shows up on the
 * site), then title, then the file itself, then the optional homepage
 * feature toggle, so filling this in top to bottom matches the order the
 * decisions actually need to be made in.
 */
import { useState } from "react";
import { uploadGalleryPhoto } from "@/lib/adminApi";
import { GALLERY_CATEGORIES } from "@/lib/categories";

export default function PhotoUploader({ onUploaded }: { onUploaded: () => void }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    if (!(data.get("file") as File)?.size) {
      setStatus("error");
      setErrorMsg("Please choose a photo to upload.");
      return;
    }

    try {
      await uploadGalleryPhoto(data);
      form.reset();
      setStatus("idle");
      onUploaded();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
        <p className="text-sm font-semibold text-dark">Add a photo</p>
        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
          Category decides which section it lands in below and which filter shows
          it on the public portfolio page. Photos are automatically resized for
          phones after upload, so any reasonably sized photo works. Turning on
          &ldquo;Feature this&rdquo; also shows it in the Our Work section on the
          homepage.
        </p>
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
          <label className="block text-sm font-medium mb-1">2. Photo title</label>
          <input
            name="title"
            required
            placeholder="e.g. Sherwood Rd shop front"
            className="w-full border border-neutral-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">3. Photo file</label>
          <input
            type="file"
            name="file"
            accept="image/*"
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
          {status === "submitting" ? "Uploading..." : "Upload Photo"}
        </button>
      </form>
    </div>
  );
}
