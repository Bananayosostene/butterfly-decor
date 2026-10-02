import { getCategoryTabs, getCollectionItems, parsePage, PAGE_SIZE, MAX_PAGES } from "@/lib/data";
import CollectionPageClient from "./collection-page-client";

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const activeSlug = sp.cat ?? "all";

  const categories = await getCategoryTabs();
  const activeCategory = categories.find((c) => slugify(c.name) === activeSlug);
  const { items, total } = await getCollectionItems(activeCategory?.id ?? null, page * PAGE_SIZE);

  return (
    <CollectionPageClient
      items={items}
      categories={categories}
      activeSlug={activeSlug}
      page={page}
      hasMore={items.length < total && page < MAX_PAGES}
    />
  );
}
