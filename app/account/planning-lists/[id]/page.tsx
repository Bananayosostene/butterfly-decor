import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { isObjectId } from "@/lib/data";
import { getPlanningSections } from "@/lib/planning-data";
import { readEntries, withFirstRecord } from "@/lib/planning-sheet";
import ListClient from "./list-client";

/** One customer planning list: the admin edits it and writes the prices. */
export default async function PlanningListPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, cookieStore] = await Promise.all([params, cookies()]);
  if (!cookieStore.get("admin_session")?.value) redirect("/login");
  if (!isObjectId(id)) notFound();

  const [sheet, sections] = await Promise.all([prisma.planningSheet.findUnique({ where: { id } }), getPlanningSections()]);
  if (!sheet) notFound();
  const user = await prisma.user.findUnique({ where: { id: sheet.userId }, select: { name: true, email: true, phone: true } });

  return (
    <ListClient
      id={sheet.id}
      sections={sections}
      initialEntries={withFirstRecord(readEntries(sheet.entries))}
      initialDate={sheet.weddingDate ?? ""}
      customer={{ name: user?.name ?? "Deleted account", email: user?.email ?? "", phone: user?.phone ?? "" }}
    />
  );
}
