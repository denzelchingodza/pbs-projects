"use client";

/**
 * Holds the visitor's chosen language (English or Shona) in React state,
 * remembered in localStorage so it sticks across pages and future visits
 * instead of resetting to English every time. Wraps the whole app in
 * layout.tsx, a Client Component, but that's fine sitting inside a Server
 * Component's tree, it just wraps the already-rendered children rather
 * than needing to fetch anything itself.
 */
import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

const STORAGE_KEY = "pbs-language";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "sn") setLangState(stored);
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
