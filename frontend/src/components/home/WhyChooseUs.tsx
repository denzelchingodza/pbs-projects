"use client";

/**
 * Three real reasons to hire PBS, part of the homepage's About section
 * (see AboutIntro.tsx directly above this and app/page.tsx for how the
 * two fit together), sitting just above the team spread below it. Plain
 * inline SVG icons (no icon library needed for three simple shapes), each
 * paired with a short, honest line rather than generic marketing language,
 * this is meant to read like something a real tradesman would say about
 * his own work.
 *
 * Icons redrawn to actually be about glass and aluminum, not generic
 * checkmarks: a glass pane catching light for trade experience, a frame
 * corner joint with measurement ticks for "measured and built to fit," and
 * a location pin with a small window inside it for being based in Harare,
 * so even the small icon-badge details point back at what PBS actually
 * builds instead of being interchangeable with any other trade's site.
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
      // A glass pane with light catching it diagonally, real trade
      // experience shows in the finish, not just the frame.
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
        <path d="M7 15 15 7" strokeOpacity="0.55" />
        <path d="M11 17 17 11" strokeOpacity="0.55" />
      </svg>
    ),
  },
  {
    titleKey: "whyChooseUs.title2",
    bodyKey: "whyChooseUs.body2",
    icon: (
      // An aluminum frame corner joint, the exact detail behind "measured
      // and built to fit," with small ruler ticks along the upright.
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 20V9a4 4 0 0 1 4-4h10" />
        <path d="M5 16h2.5M5 12h2.5" strokeOpacity="0.6" />
        <path d="M11.5 5v2.5M15.5 5v2.5" strokeOpacity="0.6" />
      </svg>
    ),
  },
  {
    titleKey: "whyChooseUs.title3",
    bodyKey: "whyChooseUs.body3",
    icon: (
      // A location pin with a small window pane inside it, based in
      // Harare, in the material PBS actually works in.
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
        <rect x="8.75" y="7.75" width="6.5" height="5" rx="0.5" strokeOpacity="0.8" />
        <path d="M12 7.75v5M8.75 10.25h6.5" strokeOpacity="0.5" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  const { lang } = useLanguage();
  return (
    <section className="px-6 md:px-8 pt-8 pb-20 md:pb-24 bg-neutral-50">
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
