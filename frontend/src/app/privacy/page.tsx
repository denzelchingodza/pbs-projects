/**
 * Privacy Policy, a plain Server Component, static content describing what
 * this site actually does with visitor data (matches the real behavior of
 * QuoteForm.tsx, TestimonialForm.tsx, and the reCAPTCHA/Cloudinary setup
 * elsewhere in the codebase, nothing here is aspirational or copied from a
 * generic template). Linked from the footer on every page.
 */
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/api";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PBS Projects collects, uses, and protects your information.",
};

const LAST_UPDATED = "14 September 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-9">
      <h2 className="text-lg font-semibold text-dark tracking-tight mb-2.5">{title}</h2>
      <div className="text-neutral-600 text-[15px] leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <main>
      <section className="px-6 md:px-8 py-20 bg-neutral-50">
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            align="left"
            eyebrow="Legal"
            title="Privacy Policy"
            intro={`Last updated ${LAST_UPDATED}. This page explains what information ${settings.business_name} collects through this website, why, and how it's handled.`}
          />

          <Section title="Information We Collect">
            <p>
              We only collect what you choose to give us, directly through
              this site&apos;s forms:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-dark">Quote requests</strong>: your name, phone
                number, the product you&apos;re asking about, and any project
                details you write in.
              </li>
              <li>
                <strong className="text-dark">Testimonials</strong>: your name, an
                optional role or description, your rating, and the text of
                your review.
              </li>
            </ul>
            <p>We don&apos;t use cookies to track you, and we don&apos;t run any advertising or analytics scripts on this site.</p>
          </Section>

          <Section title="How We Use It">
            <p>
              Quote request details are used only to get back to you about
              your project, by phone or WhatsApp. Testimonials are reviewed
              by our team before they&apos;re published, we only ever show
              your name, the role you gave (if any), your rating, and your
              quote, on this website. We never publish your phone number or
              any contact details from a testimonial submission.
            </p>
          </Section>

          <Section title="Where It's Stored">
            <p>
              Quote requests and testimonials are stored on our own database
              and are not sold, rented, or shared with any third party for
              marketing purposes. Photos and videos of our completed work
              may be hosted through Cloudinary, a media hosting service, to
              keep the site fast, this applies only to project photos we
              upload ourselves, not to anything you submit.
            </p>
          </Section>

          <Section title="Google reCAPTCHA">
            <p>
              The quote form uses Google reCAPTCHA to help block automated
              spam submissions. Google may collect hardware and software
              information (such as device data) and send it to Google for
              this purpose. Use of reCAPTCHA is subject to Google&apos;s own{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark underline hover:text-orange transition-colors"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark underline hover:text-orange transition-colors"
              >
                Terms of Service
              </a>
              .
            </p>
          </Section>

          <Section title="WhatsApp">
            <p>
              The WhatsApp button on this site opens a chat directly in
              WhatsApp (or wa.me), outside of this website entirely. Any
              conversation you have with us there is subject to
              WhatsApp&apos;s own privacy policy, not this one.
            </p>
          </Section>

          <Section title="Your Choices">
            <p>
              You can ask us at any time to tell you what information we
              hold about you, to correct it, or to delete it, including
              removing a published testimonial. Reach us using the contact
              details below.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              If how we handle information ever changes in a meaningful way,
              we&apos;ll update this page and the date at the top.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              Questions about this policy or your information?{" "}
              <a
                href={`mailto:${settings.email}`}
                className="text-dark underline hover:text-orange transition-colors"
              >
                {settings.email}
              </a>{" "}
              or{" "}
              <a
                href={`tel:${settings.phone_primary.replace(/\s/g, "")}`}
                className="text-dark underline hover:text-orange transition-colors"
              >
                {settings.phone_primary}
              </a>
              .
            </p>
          </Section>
        </div>
      </section>
    </main>
  );
}
