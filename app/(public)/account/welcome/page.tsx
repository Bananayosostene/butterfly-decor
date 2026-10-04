import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { homeFor } from "@/lib/account-paths";
import { getCurrentUser } from "@/lib/user-auth";
import { getVendorCategories } from "@/lib/vendors";
import WelcomeClient from "./welcome-client";

export const metadata: Metadata = { title: "Welcome" };

/** Shown once after sign-up (email or Google): "Are you a vendor?" */
export default async function WelcomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role) redirect(homeFor(user.role));

  return <WelcomeClient name={user.name} categories={await getVendorCategories()} />;
}
