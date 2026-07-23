"use client";

/**
 * A home for admin account settings, starting with changing the login
 * password. More site level settings (address, phone, owner bio) could
 * live here in the future too, for now this page's one job is letting
 * the admin move off whatever password the site was first set up with.
 */
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import PageHeader from "@/components/admin/PageHeader";

export default function AdminSettingsPage() {
  return (
    <div>
      <PageHeader title="Account Settings" description="Manage your admin login." />
      <ChangePasswordForm />
    </div>
  );
}
