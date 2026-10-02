import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionItem, getCollectionItems, isObjectId, parsePage, PAGE_SIZE, MAX_PAGES } from "@/lib/data";
import CollectionItemClient from "./collection-item-client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = isObjectId(id) ? await getCollectionItem(id) : null;
  return item ? { title: item.name } : {};
}

export default async function CollectionItemDetailPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const page = parsePage(sp.page);

  const item = isObjectId(id) ? await getCollectionItem(id) : null;
  if (!item) notFound();

  const { items, total } = await getCollectionItems(item.categoryId, page * PAGE_SIZE);

  return (
    <CollectionItemClient
      item={item}
      categoryItems={items}
      page={page}
      hasMore={items.length < total && page < MAX_PAGES}
    />
  );
}
