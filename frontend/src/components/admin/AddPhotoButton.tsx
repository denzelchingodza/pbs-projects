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

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again later if needed
    if (!file) return;

    const validationError = validateMediaFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    setBusy(true);
    try {
      await addProjectMedia(projectId, file);
      onAdded();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not add that photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <label
      className={`shrink-0 w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
        busy
          ? "border-neutral-200 text-neutral-300"
          : "border-neutral-300 text-neutral-400 hover:border-orange hover:text-orange"
      }`}
    >
      <span className="text-xl leading-none">{busy ? "..." : "+"}</span>
      <span className="text-[10px] font-medium mt-1 px-1 leading-tight">
        {busy ? "Adding" : "Add photo"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={`${IMAGE_ACCEPT},${VIDEO_ACCEPT}`}
        disabled={busy}
        onChange={handleChange}
        className="hidden"
      />
    </label>
  );
}
