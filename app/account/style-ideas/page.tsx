import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import StyleIdeasClient from "./style-ideas-client";

export default async function StyleIdeasPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const ideas = await prisma.styleIdea.findMany({
    select: { id: true, title: true, description: true, imageUrl: true },
    orderBy: { createdAt: "desc" },
  });

  return <StyleIdeasClient ideas={ideas} />;
}
