import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import WeddingAlbumsClient from "./wedding-albums-client";

export default async function WeddingAlbumsAdminPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const albums = await prisma.weddingAlbum.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <WeddingAlbumsClient
      albums={albums.map((a) => ({ id: a.id, title: a.title, weddingDate: a.weddingDate, images: a.images }))}
    />
  );
}
