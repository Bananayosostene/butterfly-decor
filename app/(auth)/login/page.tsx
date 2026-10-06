import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { homeFor } from "@/lib/account-paths";
import { getCurrentUser, getDashboardUser } from "@/lib/user-auth";
import AuthPanel from "./auth-panel";
import SignedInCard from "./signed-in-card";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; tab?: string }> }) {
  const [dashboardUser, user, sp] = await Promise.all([getDashboardUser(), getCurrentUser(), searchParams]);
  // Already signed in: the admin goes straight to the dashboard.
  if (dashboardUser?.role === "ADMIN") redirect("/account");
  // Vendors go to their dashboard, new accounts to the "Are you a vendor?" step.
  if (user && user.role !== "CLIENT") redirect(homeFor(user.role));

  return (
    // Fills the rest of the screen under the header (the layout stretches it), so the photo
    // always reaches the bottom of the window.
    <div
      className="relative flex-1 flex items-center justify-center px-4 py-6 overflow-hidden"
      style={{ background: "#fbf7f2" }}
    >
      {/* Faded photo behind the sign-in card: mostly cream, with the picture only hinted at. */}
      <img src="/login-img1.png" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-5" />
      <div className="relative w-full">
        {user ? (
          <SignedInCard name={user.name} email={user.email} />
        ) : (
          <AuthPanel googleFailed={sp.error === "google"} initialMode={sp.tab === "register" ? "register" : "login"} />
        )}
      </div>
    </div>
  );
}
