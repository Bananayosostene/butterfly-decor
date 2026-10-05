import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import CategoriesClient from "./categories-client";

const PAGE_SIZE = 10;

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string; kind?: string }> }) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const kind = sp.kind === "decor" ? "DECOR" : "COLLECTION";
  // Categories created before decor existed have no kind at all; they belong to the collection.
  const where =
    kind === "DECOR" ? { kind: "DECOR" } : { OR: [{ kind: { isSet: false } }, { kind: null }, { kind: "COLLECTION" }] };

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        kind: true,
        icon: true,
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.count({ where }),
  ]);

  return (
    <CategoriesClient
      categories={categories}
      kind={kind}
      page={page}
      totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
      total={total}
    />
  );
}
