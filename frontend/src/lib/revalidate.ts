/**
 * Tells the running Next.js server to immediately drop its cached copy of
 * specific public pages. Call this right after an admin save succeeds so a
 * visitor sees the change on their very next page load, instead of
 * whatever is left of the normal 60 second cache window (lib/api.ts).
 *
 * Best effort only: if this fails for any reason (offline, server hiccup),
 * it's swallowed silently. The admin action itself already succeeded, and
 * the public page still catches up on its own within 60 seconds either
 * way, so a failure here should never be shown to the admin as an error.
 */
export async function revalidatePublicPaths(paths: string[]): Promise<void> {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
  } catch {
    // Intentionally ignored, see doc comment above.
  }
}
