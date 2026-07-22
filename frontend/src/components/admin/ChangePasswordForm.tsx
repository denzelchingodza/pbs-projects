"use client";

/**
 * Lets the logged in admin set a new password for their own account,
 * requires typing the current password first (so a session left open on
 * a shared computer can't be used to lock the real owner out), and the
 * new password twice, to catch a typo before it's saved. Shows a real
 * toast on success instead of just clearing the form silently.
 */
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { changePassword } from "@/lib/adminApi";

export default function ChangePasswordForm() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change the password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 max-w-md shadow-sm">
      <p className="text-sm font-semibold text-dark mb-1">Change Password</p>
      <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
        Update the password used to log in to this admin panel. You will need
        your current password to confirm the change.
      </p>

      <label className="block text-sm font-medium mb-1">Current Password</label>
      <input
        type="password"
        required
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
      />

      <label className="block text-sm font-medium mb-1">New Password</label>
      <input
        type="password"
        required
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
      />
      <p className="text-xs text-neutral-500 mb-4">At least 8 characters.</p>

      <label className="block text-sm font-medium mb-1">Confirm New Password</label>
      <input
        type="password"
        required
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full border border-neutral-300 rounded-md px-4 py-2.5 mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-shadow"
      />

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="bg-orange text-white font-semibold px-5 py-2.5 rounded-md hover:brightness-95 transition disabled:opacity-60"
      >
        {busy ? "Saving..." : "Change Password"}
      </button>
    </form>
  );
}
