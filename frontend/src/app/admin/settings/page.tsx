"use client";

/**
 * A home for admin account settings, starting with changing the login
 * password. More site level settings (address, phone, owner bio) could
 * live here in the future too, for now this page's one job is letting
 * the admin move off whatever password the site was first set up with.
 */
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-1">Account Settings</h1>
      <p className="text-neutral-500 text-sm mb-8">Manage your admin login.</p>
      <ChangePasswordForm />
    </div>
  );
}
