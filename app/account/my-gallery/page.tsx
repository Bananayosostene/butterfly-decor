import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/user-auth";
import MyGalleryClient from "./my-gallery-client";

/** A vendor's own photos (including any the admin has hidden). */
export default async function MyGalleryPage() {
  const user = await getCurrentUser();
  if (user?.role !== "VENDOR") redirect("/login");

  const items = await prisma.vendorItem.findMany({
    where: { vendorId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, imageUrl: true, description: true, active: true },
  });

  return <MyGalleryClient items={items} vendorId={user.id} />;
}
