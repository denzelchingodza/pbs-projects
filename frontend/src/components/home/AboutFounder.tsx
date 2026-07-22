"use client";

/**
 * "Meet the Founder" section, pulls owner_name/owner_bio/owner_photo_url/
 * years_experience from GET /api/settings, so the owner can update his own
 * bio and photo from the admin panel without a code change. Shows an
 * honest fallback (initials badge, generic role text) if the owner hasn't
 * filled these fields in yet, rather than a broken empty layout.
 *
 * Now a Client Component so the "Meet the Founder" label and the fallback
 * bio text follow the current language, the real bio itself is admin
 * entered content and shows exactly as written.
 */
import Image from "next/image";
import type { SiteSettings } from "@/types";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AboutFounder({ settings }: { settings: SiteSettings }) {
  const { lang } = useLanguage();
  const name = settings.owner_name ?? "The PBS Team";
  const role = settings.owner_role ?? "Founder";

  return (
    <section className="px-6 md:px-8 py-20 bg-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[220px_1fr] gap-10 items-start">
        {settings.owner_photo_url ? (
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md ring-4 ring-orange/10">
            <Image
              src={settings.owner_photo_url}
              alt={name}
              fill
              sizes="220px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full aspect-square rounded-2xl bg-dark text-white flex items-center justify-center text-4xl font-bold shadow-md ring-4 ring-orange/10">
            {initials(name)}
          </div>
        )}

        <div>
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            {t("aboutFounder.eyebrow", lang)}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-dark tracking-tight">{name}</h2>
          <p className="text-neutral-500 text-sm font-medium mt-2 mb-5">
            {role}
            {settings.years_experience ? ` · ${settings.years_experience}+ years in the trade` : ""}
          </p>
          <p className="text-neutral-600 text-[15px] leading-relaxed max-w-2xl">
            {settings.owner_bio ?? t("aboutFounder.fallbackBio", lang)}
          </p>
        </div>
      </div>
    </section>
  );
}
