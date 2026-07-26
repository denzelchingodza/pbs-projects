"use client";

/**
 * Small "add another photo" tile used inside a project card. Uploads
 * immediately on file choice (no separate form/modal), since the project
 * already has its title and category, all this needs is the file itself.
 */
import { useRef, useState } from "react";
import { addProjectMedia } from "@/lib/adminApi";
import { IMAGE_ACCEPT, VIDEO_ACCEPT, validateMediaFile } from "@/lib/media";

export default function AddPhotoButton({
  projectId,
  onAdded,
  onError,
}: {
  projectId: number;
  onAdded: () => void;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // lets the same file be picked again later if needed
    if (files.length === 0) return;

    // Validate all before starting
    for (const file of files) {
      const validationError = validateMediaFile(file);
      if (validationError) {
        onError(`${file.name}: ${validationError}`);
        return;
      }
    }

    setBusy(true);
    setProgress({ current: 0, total: files.length });
    try {
      for (let i = 0; i < files.length; i++) {
        await addProjectMedia(projectId, files[i]);
        setProgress({ current: i + 1, total: files.length });
      }
      onAdded();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not add that photo.");
    } finally {
      setBusy(false);
      setProgress({ current: 0, total: 0 });
    }
  }

  return (
    <label
      className={`shrink-0 w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
        busy
          ? "border-neutral-200 text-neutral-300"
          : "border-neutral-300 text-neutral-500 hover:border-orange hover:text-orange"
      }`}
    >
      <span className="text-xl leading-none">{busy ? "..." : "+"}</span>
      <span className="text-[10px] font-medium mt-1 px-1 leading-tight">
        {busy
          ? progress.total > 1
            ? `${progress.current}/${progress.total}`
            : "Adding"
          : "Add photos"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={`${IMAGE_ACCEPT},${VIDEO_ACCEPT}`}
        multiple
        disabled={busy}
        onChange={handleChange}
        className="hidden"
      />
    </label>
  );
}
