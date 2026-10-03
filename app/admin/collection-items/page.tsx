import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { isObjectId } from "@/lib/data";
import CollectionItemsClient from "./collection-items-client";

const PAGE_SIZE = 10;

export default async function CollectionItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; cat?: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/admin/login");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filterCat = sp.cat && isObjectId(sp.cat) ? sp.cat : "";
  const where = filterCat ? { categoryId: filterCat } : undefined;

  const [items, total, categories] = await Promise.all([
    prisma.collectionItem.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.collectionItem.count({ where }),
    prisma.category.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, kind: true } }),
  ]);

  return (
    <CollectionItemsClient
      items={items}
      categories={categories}
      filterCat={filterCat}
      page={page}
      totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
      total={total}
    />
  );
}
