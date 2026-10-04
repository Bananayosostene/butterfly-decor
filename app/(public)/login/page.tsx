import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { homeFor } from "@/lib/account-paths";
import { displaySerif } from "@/lib/fonts";
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
    <div className="min-h-[80vh] px-4 py-12" style={{ background: "#fbf7f2" }}>
      <div className="max-w-md mx-auto text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "#835105" }}>Butterfly Decor</p>
        <h1 className={`${displaySerif.className} mt-2 text-4xl`} style={{ color: "#2b1807" }}>
          {user ? "Your account" : "Welcome"}
        </h1>
        {!user && (
          <p className="mt-2 text-sm" style={{ color: "#57422C" }}>
            Sign in to your account or create one with Butterfly Decor.
          </p>
        )}
      </div>
      {user ? <SignedInCard name={user.name} email={user.email} /> : <AuthPanel googleFailed={sp.error === "google"} initialMode={sp.tab === "register" ? "register" : "login"} />}
    </div>
  );
}
