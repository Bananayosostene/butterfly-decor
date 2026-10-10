import { cookies } from "next/headers";
import { DECOR_SLUG, decorHref, iconForCategory, slugify } from "@/lib/category-icons";
import {
  getCategoryTabs,
  getCollectionItem,
  getCollectionItems,
  getGallerySocial,
  getLikedIds,
  isObjectId,
  parsePage,
  PAGE_SIZE,
  MAX_PAGES,
} from "@/lib/data";
import { getVendorCategories } from "@/lib/vendors";
import { VISITOR_COOKIE } from "@/lib/visitor";
import { stripHtmlToText } from "@/lib/text";
import CollectionPageClient, { type Crumb, type FilterTab } from "./collection-page-client";

const WEDDING_INTRO =
  "Bridal gowns, groom suits, invitations, gifts and decor, browse everything we prepare for your wedding day.";
const DECOR_INTRO =
  "Backdrops for your introduction and reception, bridal showers, birthdays, graduations and flowers.";

/**
 * Server-side body of /collection.
 *   ?cat=<slug>                  one collection category
 *   ?cat=decor                   every decor item
 *   ?cat=decor&decor=<id>        one decor category
 *   &item=<id>                   opens that item in the popup (shared links)
 *
 * Everything the popup needs (descriptions, likes, comments) is loaded here with the gallery, so
 * opening an image is instant and makes no request.
 */
export async function CollectionListing({
  searchParams,
}: {
  searchParams: { cat?: string; decor?: string; page?: string; item?: string };
}) {
  const page = parsePage(searchParams.page);
  const activeSlug = searchParams.cat ?? "all";
  const inDecor = activeSlug === DECOR_SLUG;

  const [categories, decorCategories, vendorCategories] = await Promise.all([
    getCategoryTabs("COLLECTION"),
    getCategoryTabs("DECOR"),
    getVendorCategories(),
  ]);
  const activeCategory = inDecor ? undefined : categories.find((c) => slugify(c.name) === activeSlug);
  const activeDecor = inDecor ? decorCategories.find((c) => c.id === searchParams.decor) : undefined;

  const { items, total } = inDecor
    ? await getCollectionItems(activeDecor?.id ?? null, page * PAGE_SIZE, "DECOR")
    : await getCollectionItems(activeCategory?.id ?? null, page * PAGE_SIZE, "COLLECTION");

  // Inside Decor the collection filters are replaced by the decor filters.
  const decorTabs: FilterTab[] = [
    { key: "all-decor", label: "All decor", icon: "all.svg", href: decorHref(), active: !activeDecor },
    ...decorCategories.map((c) => ({
      key: c.id,
      label: c.name,
      icon: iconForCategory(c.name, c.icon),
      href: decorHref(c.id),
      active: c.id === activeDecor?.id,
    })),
  ];

  const collectionTabs: FilterTab[] = [
    { key: "all", label: "All", icon: "all.svg", href: "/collection", active: activeSlug === "all" },
    ...categories.map((c) => ({
      key: c.id,
      label: c.name,
      icon: iconForCategory(c.name, c.icon),
      href: `/collection?cat=${slugify(c.name)}`,
      active: c.id === activeCategory?.id,
    })),
    { key: DECOR_SLUG, label: "Decor", icon: "decor.svg", href: decorHref(), active: false },
    // Vendor categories (cakes, photographers…) open the vendors page.
    ...vendorCategories.map((c) => ({
      key: `vendor-${c.id}`,
      label: c.name,
      icon: iconForCategory(c.name, c.icon),
      href: `/vendors?cat=${c.id}`,
      active: false,
    })),
  ];

  // Wedding / Decor / Bridal Shower — the last crumb is the page we are on, so it is not a link.
  const current = inDecor ? activeDecor : activeCategory;
  const breadcrumb: Crumb[] = [
    { label: "Wedding", href: "/collection" },
    ...(inDecor ? [{ label: "Decor", href: decorHref() }] : []),
    ...(current ? [{ label: current.name }] : []),
  ];
  delete breadcrumb[breadcrumb.length - 1].href;

  const title = current?.name ?? (inDecor ? "Decor" : "Wedding Collections");
  const description = current?.description
    ? stripHtmlToText(current.description)
    : inDecor
      ? DECOR_INTRO
      : WEDDING_INTRO;

  // A shared link may point at an item that is not among the images loaded for this view.
  const sharedId = searchParams.item && isObjectId(searchParams.item) ? searchParams.item : null;
  const sharedItem = sharedId && !items.some((i) => i.id === sharedId) ? await getCollectionItem(sharedId) : null;
  const ids = [...items.map((i) => i.id), ...(sharedItem ? [sharedItem.id] : [])];

  const cookieStore = await cookies();
  const [social, likedIds] = await Promise.all([
    getGallerySocial(ids),
    getLikedIds(cookieStore.get(VISITOR_COOKIE)?.value),
  ]);
  // Only decides whether the comment delete buttons are drawn; the delete API checks the real
  // session, so no database lookup is needed here.
  const canModerate = !!cookieStore.get("admin_session")?.value;

  return (
    <CollectionPageClient
      social={social}
      likedIds={likedIds}
      canModerate={canModerate}
      sharedItem={sharedItem}
      initialItemId={sharedItem || items.some((i) => i.id === sharedId) ? sharedId : null}
      // A new filter starts again from the five-image preview.
      key={`${activeSlug}-${activeDecor?.id ?? ""}`}
      items={items}
      total={total}
      tabs={inDecor ? decorTabs : collectionTabs}
      breadcrumb={breadcrumb}
      title={title}
      description={description}
      inDecor={inDecor}
      page={page}
      hasMore={items.length < total && page < MAX_PAGES}
    />
  );
}

