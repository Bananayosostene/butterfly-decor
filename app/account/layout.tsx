import { cookies } from "next/headers";
import { USER_COOKIE } from "@/lib/user-auth";
import DashboardShell, { type DashboardRole } from "./dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts has already checked that the session is real and allowed on this page, so the
  // cookies only need to tell us which menu to show (no database call here).
  const store = await cookies();
  const role: DashboardRole | null = store.get("admin_session")?.value
    ? "ADMIN"
    : store.get(USER_COOKIE)?.value
      ? "VENDOR"
      : null;

  return <DashboardShell role={role}>{children}</DashboardShell>;
}
