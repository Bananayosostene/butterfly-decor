import { prisma } from "@/lib/db";
import CollectionPageClient from "./collection-page-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const activeCategory = sp.cat && sp.cat !== "all" ? categories.find((c) => slugify(c.name) === sp.cat) : null;
  const where = activeCategory ? { categoryId: activeCategory.id } : undefined;

  const [items, total] = await Promise.all([
    prisma.collectionItem.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.collectionItem.count({ where }),
  ]);

  return (
    <CollectionPageClient
      initialItems={JSON.parse(JSON.stringify(items))}
      initialCategories={JSON.parse(JSON.stringify(categories))}
      initialPage={page}
      initialTotalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
    />
  );
}
