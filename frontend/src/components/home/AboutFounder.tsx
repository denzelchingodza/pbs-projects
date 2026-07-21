/**
 * "Meet the Founder" section, pulls owner_name/owner_bio/owner_photo_url/
 * years_experience from GET /api/settings, so the owner can update his own
 * bio and photo from the admin panel without a code change. Shows an
 * honest fallback (initials badge, generic role text) if the owner hasn't
 * filled these fields in yet, rather than a broken empty layout.
 */
import type { SiteSettings } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AboutFounder({ settings }: { settings: SiteSettings }) {
  const name = settings.owner_name ?? "The PBS Team";
  const role = settings.owner_role ?? "Founder";

  return (
    <section className="px-6 md:px-8 py-20 bg-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[220px_1fr] gap-10 items-start">
        {settings.owner_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.owner_photo_url}
            alt={name}
            className="w-full aspect-square object-cover rounded-2xl shadow-md ring-4 ring-orange/10"
          />
        ) : (
          <div className="w-full aspect-square rounded-2xl bg-dark text-white flex items-center justify-center text-4xl font-bold shadow-md ring-4 ring-orange/10">
            {initials(name)}
          </div>
        )}

        <div>
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Meet the Founder
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-dark tracking-tight">{name}</h2>
          <p className="text-neutral-500 text-sm font-medium mt-2 mb-5">
            {role}
            {settings.years_experience ? ` · ${settings.years_experience}+ years in the trade` : ""}
          </p>
          <p className="text-neutral-600 text-[15px] leading-relaxed max-w-2xl">
            {settings.owner_bio ??
              "Full bio coming soon. In the meantime, get in touch directly, our team is happy to talk through any glass and aluminum project, big or small."}
          </p>
        </div>
      </div>
    </section>
  );
}
