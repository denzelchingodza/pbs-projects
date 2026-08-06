/**
 * The About content used to live on its own page here. It's now part of
 * the homepage instead (id="about", see components/home/AboutIntro.tsx,
 * WhyChooseUs.tsx, and TeamSection.tsx, assembled in app/page.tsx), so a
 * visitor never has to leave the homepage to learn who PBS Projects is.
 *
 * This route is kept, redirecting straight to the homepage's About
 * section, so any bookmark, old link, or search result pointing at
 * /about still lands somewhere correct instead of a broken page.
 */
import { redirect } from "next/navigation";

export default function AboutPage() {
  redirect("/#about");
}
