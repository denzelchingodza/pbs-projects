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
 * usage). Splitting on that marker here, once, means any translated
 * string can opt into the same highlight without every caller needing to
 * hand-build its own <mark> markup.
 */
import { fillTemplate, t } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

function renderWithHighlight(text: string) {
  const parts = text.split(/==(.+?)==/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="highlight-mark">
        {part}
      </mark>
    ) : (
      part
    )
  );
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
  return <>{renderWithHighlight(filled)}</>;
}
