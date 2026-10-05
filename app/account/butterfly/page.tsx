import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import ButterflyClient from "./butterfly-client";

/** Photo pairs for the homepage butterfly animation. */
export default async function ButterflySlidesPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const [slides, categoriesWithPhotos] = await Promise.all([
    prisma.butterflySlide.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, leftImageUrl: true, rightImageUrl: true },
    }),
    // Only used to offer the one-time import while there are no slides yet.
    prisma.category.count({ where: { OR: [{ imageUrl: { not: null } }, { images: { some: {} } }] } }),
  ]);

  return <ButterflyClient slides={slides} canImport={slides.length === 0 && categoriesWithPhotos > 0} />;
}
