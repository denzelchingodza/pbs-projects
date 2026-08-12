/**
 * Footer — a plain Server Component (no "use client", no interactivity needed).
 * Receives real business info as a prop from the layout's server-side fetch,
 * so if the address/phone/email ever changes in the admin panel, this updates
 * automatically without a code change.
 *
 * More breathing room and firmer type weight than before (taller top padding,
 * wider column gaps, medium-weight links) for a more considered, less
 * cramped close to the page, echoing the footer treatment on the
 * jdwglass.co.za reference site. No social icons added, SiteSettings has no
 * social links to draw from, and a row of dead icon links would be worse
 * than none at all.
 */
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import type { SiteSettings } from "@/types";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-neutral-300 px-6 pt-20 pb-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 pb-10 border-b border-neutral-700">
        <div>
          <Logo className="mb-4" dark />
          <p className="text-sm text-neutral-500 leading-relaxed">
            Glass &amp; aluminum specialists based in Harare, serving clients across Zimbabwe.
          </p>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Navigate</h4>
          <div className="flex flex-col gap-3 text-sm font-medium">
            <Link href="/#work" className="hover:text-orange transition-colors">Our Work</Link>
            <Link href="/#products" className="hover:text-orange transition-colors">Products</Link>
            <Link href="/#quote" className="hover:text-orange transition-colors">Get a Quote</Link>
            <Link href="/#about" className="hover:text-orange transition-colors">About</Link>
            <Link href="/testimonial" className="hover:text-orange transition-colors">Leave a Testimonial</Link>
          </div>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Products</h4>
          <div className="flex flex-col gap-3 text-sm font-medium text-neutral-300">
            <span>Windows &amp; Doors</span>
            <span>Shop Fronts</span>
            <span>Ceilings &amp; Cabinets</span>
          </div>
        </div>

        <div>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Contact</h4>
          <div className="flex flex-col gap-3 text-sm font-medium">
            <span className="text-neutral-300">{settings.address}</span>
            <a href={`tel:${settings.phone_primary.replace(/\s/g, "")}`} className="hover:text-orange transition-colors">
              {settings.phone_primary}
            </a>
            <a href={`mailto:${settings.email}`} className="hover:text-orange transition-colors">
              {settings.email}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-7 flex flex-wrap justify-between gap-2 text-xs text-neutral-500">
        <span>© {year} {settings.business_name}. All rights reserved.</span>
        <span className="uppercase tracking-widest">
          Windows · Doors · Shower Cubicles · Shop Fronts · Suspended Ceilings · Cabinets
        </span>
      </div>
    </footer>
  );
}
