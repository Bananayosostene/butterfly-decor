import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import {
  getCollectionItem,
  getItemFeed,
  getItemSocial,
  hasLiked,
  isObjectId,
  parsePage,
  PAGE_SIZE,
  MAX_PAGES,
} from "@/lib/data";
import { VISITOR_COOKIE } from "@/lib/visitor";
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
  const [{ id }, sp, cookieStore] = await Promise.all([params, searchParams, cookies()]);
  const page = parsePage(sp.page);

  const item = isObjectId(id) ? await getCollectionItem(id) : null;
  if (!item) notFound();

  const adminToken = cookieStore.get("admin_session")?.value;
  const [{ feed, hasMore, prevId, nextId }, social, liked, adminId] = await Promise.all([
    getItemFeed(item.id, item.categoryId, page * PAGE_SIZE),
    getItemSocial(item.id),
    hasLiked(item.id, cookieStore.get(VISITOR_COOKIE)?.value),
    // Only logged-in admins pay for this lookup; it enables the comment delete buttons.
    adminToken ? getSessionAdminId(adminToken) : null,
  ]);

  return (
    <CollectionItemClient
      key={item.id}
      item={item}
      feed={feed}
      prevId={prevId}
      nextId={nextId}
      page={page}
      hasMore={hasMore && page < MAX_PAGES}
      social={{ ...social, liked }}
      canModerate={!!adminId}
    />
  );
}
