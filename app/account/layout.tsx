import { cookies } from "next/headers";
import { ACCOUNT_HINT_COOKIE } from "@/lib/account-hint";
import { USER_COOKIE } from "@/lib/user-auth";
import DashboardShell, { DASH_THEME_COOKIE, type DashboardRole } from "./dashboard-shell";

/** Name and email for the sidebar, from the display cookie set at sign-in. */
function accountFrom(raw: string | undefined, role: DashboardRole | null) {
  const fallback = { name: role === "ADMIN" ? "Admin" : "Vendor", email: "" };
  if (!raw) return fallback;
  try {
    // The value may arrive still encoded, depending on how the cookie was written.
    const hint = JSON.parse(raw.trim().startsWith("{") ? raw : decodeURIComponent(raw));
    return typeof hint?.name === "string" ? { name: hint.name, email: typeof hint.email === "string" ? hint.email : "" } : fallback;
  } catch {
    return fallback;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts has already checked that the session is real and allowed on this page, so the
  // cookies only need to tell us which menu to show (no database call here).
  const store = await cookies();
  const role: DashboardRole | null = store.get("admin_session")?.value
    ? "ADMIN"
    : store.get(USER_COOKIE)?.value
      ? "VENDOR"
      : null;

  return (
    <DashboardShell
      role={role}
      // Light is the default; the toggle in the top bar remembers the other choice.
      initialTheme={store.get(DASH_THEME_COOKIE)?.value === "dark" ? "dark" : "light"}
      account={accountFrom(store.get(ACCOUNT_HINT_COOKIE)?.value, role)}
    >
      {children}
    </DashboardShell>
  );
}
