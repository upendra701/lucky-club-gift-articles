import { requireAdmin } from "../../../lib/admin-auth";
import { AdminShell } from "./AdminShell";
import "../admin.css";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return <div className="admin-shell"><AdminShell>{children}</AdminShell></div>;
}