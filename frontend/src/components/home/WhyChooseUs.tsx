/**
 * Three real reasons to hire PBS, used on the About page just above the
 * founder section. Plain inline SVG icons (no icon library needed for
 * three simple shapes), each paired with a short, honest line rather than
 * generic marketing language, this is meant to read like something a real
 * tradesman would say about his own work.
 */
function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
      {children}
    </span>
  );
}

const VALUES = [
  {
    title: "Real trade experience",
    body: "Years actually cutting, fitting, and sealing glass and aluminum, not just running a business that sells it.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2 4.5 11.5a2.1 2.1 0 0 0 3 3L17.5 5" />
        <path d="M17.5 5 19 3.5 21.5 6 20 7.5" />
        <path d="M8.5 14.5 4 19l1 1 4.5-4.5" />
      </svg>
    ),
  },
  {
    title: "Measured and built to fit",
    body: "Every window, door, or cubicle is measured for its own opening and built to that size, not sold off a shelf.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="10" rx="1" />
        <path d="M7 7v3M11 7v3M15 7v3M19 7v3" />
      </svg>
    ),
  },
  {
    title: "Local, based in Harare",
    body: "On the ground in Zimbabwe, available for a site visit, a straight quote, and support after the job is done.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8622D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="px-6 md:px-8 py-16 bg-neutral-50">
      <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
        {VALUES.map((v) => (
          <div key={v.title} className="text-center sm:text-left">
            <div className="flex justify-center sm:justify-start mb-4">
              <IconBadge>{v.icon}</IconBadge>
            </div>
            <h3 className="font-semibold text-dark mb-1.5">{v.title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
