/**
 * A plain walk-through of what actually happens after someone gets in
 * touch, sitting right before the Quote form on the homepage (see
 * app/page.tsx), the natural place to answer "ok, but what happens next"
 * right before someone actually fills the form in.
 *
 * Two things here are worded carefully to stay honest rather than
 * generic: a site visit is not a required step, plenty of jobs get quoted
 * straight from a description, reference photos, or word of mouth, a
 * visit only happens when an accurate measurement is actually needed.
 * And there is no invented turnaround time, how long a job takes
 * genuinely depends on its size and scope, so the copy says that
 * plainly instead of a made up "done in 3 days" promise.
 *
 * The step badge is a small square pane (rounded-md, not a plain circle)
 * with a faint mullion cross behind the number, the same window-pane
 * language used elsewhere on the site (see globals.css's .pane-grid),
 * shrunk down to a single tile.
 */
function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative w-11 h-11 rounded-md bg-orange/10 text-orange flex items-center justify-center shrink-0 font-bold text-sm overflow-hidden">
      <svg aria-hidden="true" viewBox="0 0 44 44" className="absolute inset-0 w-full h-full">
        <path d="M22 2v40M2 22h40" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

const STEPS = [
  {
    title: "Get in touch",
    body: "Call, WhatsApp, or send a quote request. Tell us what you need, a description, reference photos, or rough measurements are all a good start.",
  },
  {
    title: "Get a straight quote",
    body: "Plenty of jobs can be quoted right from what you've told us. If an accurate measurement matters for your job, we'll arrange a site visit first, either way, you get a real quote before anything starts.",
  },
  {
    title: "We do the install",
    body: "How long it takes depends on the size and scope of the job itself, there's no one-size-fits-all timeline, but we work quickly and firmly without cutting corners.",
  },
  {
    title: "Handover",
    body: "We walk the finished job through with you. Done right the first time.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 md:px-8 py-20 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl mx-auto text-center mb-14">
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            How It Works
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-dark tracking-tight">
            From first message to finished job
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center sm:text-left">
              <div className="flex justify-center sm:justify-start mb-4">
                <StepIcon>{i + 1}</StepIcon>
              </div>
              <h3 className="font-semibold text-dark mb-1.5">{step.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
