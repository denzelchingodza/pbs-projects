"use client";

/**
 * A home for admin account settings, starting with changing the login
 * password. More site level settings (address, phone, owner bio) could
 * live here in the future too, for now this page's one job is letting
 * the admin move off whatever password the site was first set up with.
 *
 * Redesign notes: this used to be just the password form sitting alone on
 * an otherwise empty page. Added a Security info card above it laying out
 * the two real protections already built in (session length, login rate
 * limiting), both true today, just never shown anywhere, so the page
 * actually explains the account's security instead of only offering one
 * action with no other context.
 */
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import PageHeader from "@/components/admin/PageHeader";
import Reveal from "@/components/ui/Reveal";

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="m13.4 10.6 2.6-2.6" />
      <path d="M4.9 19.1A9 9 0 1 1 19 19" />
    </svg>
  );
}

export default function AdminSettingsPage() {
  return (
    <Reveal>
    <div>
      <PageHeader title="Account Settings" description="Manage your admin login." />

      <div className="flex flex-col gap-6 max-w-md">
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-9 h-9 rounded-full bg-dark/5 text-dark flex items-center justify-center shrink-0">
              <ShieldIcon />
            </span>
            <p className="text-sm font-semibold text-dark">Security</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0 mt-0.5">
                <ClockIcon />
              </span>
              <p className="text-sm text-neutral-600 leading-relaxed">
                <span className="font-medium text-dark">Sessions last 24 hours.</span> After that,
                signing back in requires the password again, so a device left logged in
                does not stay that way forever.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0 mt-0.5">
                <GaugeIcon />
              </span>
              <p className="text-sm text-neutral-600 leading-relaxed">
                <span className="font-medium text-dark">Login attempts are rate limited</span> to
                10 tries per 15 minutes, so the login page cannot just be guessed by brute
                force. A strong, real password is still the actual protection, this is a
                backstop, not a substitute for one.
              </p>
            </div>
          </div>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
    </Reveal>
  );
}
