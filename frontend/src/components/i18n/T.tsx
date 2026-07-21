"use client";

/**
 * Renders one translated string for the visitor's current language.
 * A tiny Client Component so it can be dropped into Server Component
 * pages (the homepage, the About page) without needing to convert the
 * whole page to a Client Component just to show translated text.
 *
 * Usage: <T k="hero.title" /> or, for strings with a value filled in,
 * <T k="about.introWithYears" values={{ business: settings.business_name, years }} />
 */
import { fillTemplate, t } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

export default function T({
  k,
  values,
}: {
  k: string;
  values?: Record<string, string | number>;
}) {
  const { lang } = useLanguage();
  const text = t(k, lang);
  return <>{values ? fillTemplate(text, values) : text}</>;
}
