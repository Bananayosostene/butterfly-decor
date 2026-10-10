import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getPlanningSections } from "@/lib/planning-data";
import PlanningSheetClient from "./planning-sheet-client";

export default async function PlanningSheetPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  return <PlanningSheetClient sections={await getPlanningSections()} />;
}
