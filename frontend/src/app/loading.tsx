/**
 * Next.js shows this automatically while a page's Server Component is
 * still fetching its data (Hero's settings, the gallery's projects, and
 * so on, see the various `await getX()` calls across app/*\/page.tsx),
 * instead of the browser just sitting on a blank white tab with nothing
 * to look at until the real page is ready. Kept intentionally small and
 * calm, a moment of "something's happening," not a full branded splash
 * screen, since on a fast connection this shows for a fraction of a
 * second at most.
 */
import Spinner from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Spinner className="w-8 h-8" />
    </div>
  );
}
