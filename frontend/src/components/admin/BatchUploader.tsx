"use client";

/**
 * Batch upload — picks many files at once and creates one project per file,
 * all under the same category. Titles are auto-generated from the filename
 * and can be renamed afterwards via the Edit button on each project card.
 *
 * Uploads sequentially (not all at once) so the backend and Cloudinary
 * aren't hit with 80 simultaneous requests. A progress bar shows how far
 * along the batch is, and any individual failures are counted and reported
 * at the end without stopping the rest of the queue.
 */
import { useRef, useState } from "react";
import { createProject } from "@/lib/adminApi";
import { GALLERY_CATEGORIES } from "@/lib/categories";
import { IMAGE_ACCEPT, validateMediaFile, VIDEO_ACCEPT } from "@/lib/media";
import { useToast } from "@/components/ui/ToastProvider";

/** "shop_front-main.jpg" → "Shop Front Main" */
function titleFromFilename(filename: string): string {
  return (
    filename
      .replace(/\.[^/.]+$/, "")      // strip extension
      .replace(/[_\-]+/g, " ")       // underscores / dashes → spaces
      .replace(/\b\w/g, (c) => c.toUpperCase()) // title-case
      .trim() || "Untitled"
  );
}

export default function BatchUploader({ onUploaded }: { onUploaded: () => void }) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<string>(GALLERY_CATEGORIES[0].value);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, failed: 0 });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []);
    const valid: File[] = [];
    let skipped = 0;
    for (const file of picked) {
      if (validateMediaFile(file)) {
        skipped++;
      } else {
        valid.push(file);
      }
    }
    setFiles(valid);
    if (skipped > 0) showToast(`${skipped} file(s) skipped — wrong type or too large.`);
  }

  async function handleUpload() {
    if (files.length === 0 || uploading) return;
    setUploading(true);
    setProgress({ current: 0, total: files.length, failed: 0 });

    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      try {
        const form = new FormData();
        form.append("category", category);
        form.append("title", titleFromFilename(files[i].name));
        form.append("file", files[i]);
        await createProject(form);
      } catch {
        failed++;
      }
      setProgress({ current: i + 1, total: files.length, failed });
    }

    setUploading(false);
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
    onUploaded();

    if (failed === 0) {
      showToast(`${files.length} photos uploaded.`);
    } else {
      showToast(`${files.length - failed} uploaded, ${failed} failed — check your connection and retry those.`);
    }
  }

  const pct =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
        <p className="text-sm font-semibold text-dark">Batch upload</p>
        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
          Select as many photos as you like at once. Each photo becomes its own
          project in the category you pick below — the filename is used as the
          title, and you can rename any of them afterwards using the Edit button
          on the project card.
        </p>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Category <span className="text-neutral-400 font-normal">(applies to all)</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={uploading}
            className="w-full border border-neutral-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow disabled:opacity-60"
          >
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* File picker */}
        <div>
          <label className="block text-sm font-medium mb-1">Photos</label>
          <input
            ref={inputRef}
            type="file"
            accept={`${IMAGE_ACCEPT},${VIDEO_ACCEPT}`}
            multiple
            disabled={uploading}
            onChange={handleFileChange}
            className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-neutral-100 file:text-sm file:font-medium hover:file:bg-neutral-200 disabled:opacity-60"
          />
          {files.length > 0 && !uploading && (
            <p className="text-xs text-neutral-500 mt-1">
              {files.length} photo{files.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {/* Progress bar */}
        {uploading && (
          <div>
            <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
              <span>
                Uploading {progress.current} of {progress.total}
                {progress.failed > 0 && (
                  <span className="text-red-500 ml-2">({progress.failed} failed)</span>
                )}
              </span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange transition-all duration-300 ease-out rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="bg-orange text-white font-semibold py-3 rounded-md hover:brightness-95 transition disabled:opacity-60"
        >
          {uploading
            ? `Uploading ${progress.current} / ${progress.total}...`
            : files.length > 0
            ? `Upload ${files.length} photo${files.length !== 1 ? "s" : ""}`
            : "Select photos first"}
        </button>
      </div>
    </div>
  );
}
