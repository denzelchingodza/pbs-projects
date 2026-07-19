/** Wraps all /admin/* pages — should redirect to /admin/login if not authenticated. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
