/**
 * Contact page, a Server Component fetching real settings directly. Keeps
 * to quick-contact actions (call, WhatsApp, email) plus the address and map
 * rather than duplicating the full quote form already on the home page and
 * /quote, those two pages cover "I want to submit details", this page
 * covers "I just want to reach someone right now."
 */
import type { Metadata } from "next";
import LocationMap from "@/components/layout/LocationMap";
import { getSiteSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Call, WhatsApp, or email PBS Projects directly, or find us at our Waterfalls, Harare workshop.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const telHref = `tel:${settings.phone_primary.replace(/\s/g, "")}`;
  const waDigits = settings.whatsapp_number.replace(/[^\d]/g, "");
  const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    "Hi PBS Projects, I have a question."
  )}`;

  const actions = [
    {
      label: "Call Us",
      value: settings.phone_primary,
      href: telHref,
    },
    {
      label: "WhatsApp",
      value: "Chat with us directly",
      href: waHref,
    },
    {
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
  ];

  return (
    <main>
      <section className="px-6 md:px-8 pt-16 pb-14 md:pt-20 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Get In Touch
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-dark">
            We&apos;d Love to Hear From You
          </h1>
          <p className="mt-5 text-neutral-500 text-[15px] leading-relaxed">
            Whatever you need windows, doors, or a full shop front fit out, reach us
            directly using whichever option works best for you.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-8 pb-16 bg-white">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-5">
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              target={action.label === "WhatsApp" ? "_blank" : undefined}
              rel={action.label === "WhatsApp" ? "noopener noreferrer" : undefined}
              className="bg-white border border-neutral-200 rounded-xl p-6 text-center hover:border-orange/40 hover:shadow-md transition-all"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-orange mb-2">
                {action.label}
              </div>
              <div className="font-semibold text-dark">{action.value}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-8 py-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Visit Us
            </p>
            <h2 className="text-2xl font-bold text-dark tracking-tight mb-4">
              {settings.address}
            </h2>
            <div className="text-sm text-neutral-600 space-y-2">
              <p>
                Primary:{" "}
                <a href={telHref} className="font-semibold text-dark hover:text-orange transition-colors">
                  {settings.phone_primary}
                </a>
              </p>
              {settings.phone_secondary && (
                <p>
                  Alternative:{" "}
                  <a
                    href={`tel:${settings.phone_secondary.replace(/\s/g, "")}`}
                    className="font-semibold text-dark hover:text-orange transition-colors"
                  >
                    {settings.phone_secondary}
                  </a>
                </p>
              )}
              <p>
                Email:{" "}
                <a href={`mailto:${settings.email}`} className="hover:text-orange transition-colors">
                  {settings.email}
                </a>
              </p>
            </div>
          </div>
          <LocationMap settings={settings} />
        </div>
      </section>
    </main>
  );
}
