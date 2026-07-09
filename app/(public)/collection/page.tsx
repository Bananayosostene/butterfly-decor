import { prisma } from "@/lib/db";
import CollectionPageClient from "./collection-page-client";

export const dynamic = "force-dynamic";

export default async function CollectionPage() {
  const [items, categories] = await Promise.all([
    prisma.collectionItem.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <CollectionPageClient
      initialItems={JSON.parse(JSON.stringify(items))}
      initialCategories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
