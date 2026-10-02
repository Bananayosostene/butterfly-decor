import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import CategoriesClient from "./categories-client";

const PAGE_SIZE = 10;

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/admin/login");

  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        images: { orderBy: { order: "asc" }, select: { id: true, imageUrl: true, order: true } },
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.count(),
  ]);

  return (
    <CategoriesClient
      categories={categories}
      page={page}
      totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
      total={total}
    />
  );
}
