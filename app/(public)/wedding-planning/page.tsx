import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getDashboardUser } from "@/lib/user-auth";
import { WEDDING_PLANS } from "@/lib/wedding-plans";
import PlansClient from "./plans-client";

export const metadata: Metadata = {
  title: "Wedding Planning",
  description: "Choose how much time you have before your wedding and follow a guided plan, phase by phase.",
};

/** Signed-in visitors choose the timeline that fits their wedding date. */
export default async function WeddingPlanningPage() {
  const [user, dashboardUser] = await Promise.all([getCurrentUser(), getDashboardUser()]);
  if (!user && !dashboardUser) redirect("/login");

  return <PlansClient plans={WEDDING_PLANS} />;
}
