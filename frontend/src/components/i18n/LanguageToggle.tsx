"use client";

/**
 * The small EN / SN switch in the header. Whichever one is active is
 * shown solid, the other is a plain button, tapping it just changes the
 * language everywhere on the page, no reload, no page navigation.
 */
import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`flex items-center rounded-full border border-neutral-300 p-0.5 text-xs font-semibold ${className}`}>
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-full transition-colors ${
          lang === "en" ? "bg-orange text-white" : "text-dark/60 hover:text-dark"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        onClick={() => setLang("sn")}
        className={`px-2.5 py-1 rounded-full transition-colors ${
          lang === "sn" ? "bg-orange text-white" : "text-dark/60 hover:text-dark"
        }`}
        aria-pressed={lang === "sn"}
      >
        SN
      </button>
    </div>
  );
}
