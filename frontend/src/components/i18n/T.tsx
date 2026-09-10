"use client";

/**
 * Renders one translated string for the visitor's current language.
 * A tiny Client Component so it can be dropped into Server Component
 * pages (the homepage, the About page) without needing to convert the
 * whole page to a Client Component just to show translated text.
 *
 * Usage: <T k="hero.title" /> or, for strings with a value filled in,
 * <T k="about.introWithYears" values={{ business: settings.business_name, years }} />
 *
 * A translation string can wrap one short phrase in ==double equals== to
 * highlight it with a soft highlighter stroke (see globals.css's
 * `.highlight-mark`, and about.title in lib/i18n.ts for the one real
 * usage), or in ~~double tildes~~ to render it in the site's one cursive
 * accent face with an orange tint (see tailwind.config.js's `font-cursive`
 * and hero.title in lib/i18n.ts for the one real usage, the "you can
 * trust" flourish in the hero headline). Splitting on these markers here,
 * once, means any translated string can opt into either treatment without
 * every caller needing to hand-build its own markup, and either marker
 * survives into a future Shona translation of the same string.
 */
import { fillTemplate, t } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

function renderRichText(text: string) {
  const parts = text.split(/(==.+?==|~~.+?~~)/g).filter((part) => part !== "");
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith("==") && part.endsWith("==")) {
      return (
        <mark key={i} className="highlight-mark">
          {part.slice(2, -2)}
        </mark>
      );
    }
    if (part.startsWith("~~") && part.endsWith("~~")) {
      return (
        <span key={i} className="font-cursive text-orange inline-block -rotate-1">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

export default function T({
  k,
  values,
}: {
  k: string;
  values?: Record<string, string | number>;
}) {
  const { lang } = useLanguage();
  const text = t(k, lang);
  const filled = values ? fillTemplate(text, values) : text;
  return <>{renderRichText(filled)}</>;
}
