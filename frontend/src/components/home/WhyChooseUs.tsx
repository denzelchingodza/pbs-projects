"use client";

/**
 * Three real reasons to hire PBS, used on the About page just above the
 * founder section. Plain inline SVG icons (no icon library needed for
 * three simple shapes), each paired with a short, honest line rather than
 * generic marketing language, this is meant to read like something a real
 * tradesman would say about his own work.
 *
 * Now a Client Component so the three titles and body lines follow the
 * current language, see lib/i18n.ts for the English and (once supplied)
 * Shona text.
 */
import { t } from "@/lib/i18n";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
      {children}
    </span>
  );
}

const VALUES = [
  {
    titleKey: "whyChooseUs.title1",
    bodyKey: "whyChooseUs.body1",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2 4.5 11.5a2.1 2.1 0 0 0 3 3L17.5 5" />
        <path d="M17.5 5 19 3.5 21.5 6 20 7.5" />
        <path d="M8.5 14.5 4 19l1 1 4.5-4.5" />
      </svg>
    ),
  },
  {
    titleKey: "whyChooseUs.title2",
    bodyKey: "whyChooseUs.body2",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="10" rx="1" />
        <path d="M7 7v3M11 7v3M15 7v3M19 7v3" />
      </svg>
    ),
  },
  {
    titleKey: "whyChooseUs.title3",
    bodyKey: "whyChooseUs.body3",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  const { lang } = useLanguage();
  return (
    <section className="px-6 md:px-8 py-16 bg-neutral-50">
      <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
        {VALUES.map((v) => (
          <div key={v.titleKey} className="text-center sm:text-left">
            <div className="flex justify-center sm:justify-start mb-4">
              <IconBadge>{v.icon}</IconBadge>
            </div>
            <h3 className="font-semibold text-dark mb-1.5">{t(v.titleKey, lang)}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{t(v.bodyKey, lang)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
