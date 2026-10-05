import { unstable_cache, revalidateTag } from "next/cache"
import { prisma } from "@/lib/db"
import { kindOf, type CategoryKind } from "@/lib/category-icons"

/**
 * Cached reads for the public pages. Every read is tagged, and the admin API routes call
 * `refreshPublicData` after a write, so visitors get cached results (no database round trip)
 * until an admin actually changes something.
 */

export const PAGE_SIZE = 24
/** Upper bound on `?page=` so a crafted URL can't ask for an unbounded result set. */
export const MAX_PAGES = 40

type Tag = "categories" | "collection-items" | "style-ideas" | "settings"

const HOUR = 60 * 60

export function refreshPublicData(...tags: Tag[]) {
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
}

export function isObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(id)
}

export function parsePage(value: string | undefined) {
  return Math.min(MAX_PAGES, Math.max(1, parseInt(value ?? "1", 10) || 1))
}

const itemSelect = {
  id: true,
  name: true,
  imageUrl: true,
  categoryId: true,
  category: { select: { id: true, name: true, kind: true } },
} as const

export { kindOf }

/** Ids of every category of one kind (collection or decor). */
async function categoryIdsOf(kind: CategoryKind) {
  const categories = await prisma.category.findMany({ select: { id: true, name: true, kind: true } })
  return categories.filter((c) => kindOf(c) === kind).map((c) => c.id)
}

const ideaSelect = { id: true, title: true, imageUrl: true } as const

/** Categories for the filter tabs of /collection or /decor. */
export const getCategoryTabs = unstable_cache(
  async (kind: CategoryKind) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, icon: true, kind: true, description: true },
    })
    // The old "Decor" category is the parent of the decor categories: its items count as decor,
    // but it is not a decor filter of its own.
    return categories
      .filter((c) => kindOf(c) === kind && !(kind === "DECOR" && !c.kind))
      .map(({ id, name, icon, description }) => ({ id, name, icon, description }))
  },
  ["category-tabs-v4"],
  { tags: ["categories"], revalidate: HOUR },
)

/** Photo pairs of the homepage butterfly animation, in the order they were added. */
export const getButterflySlides = unstable_cache(
  () =>
    prisma.butterflySlide.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, leftImageUrl: true, rightImageUrl: true },
    }),
  ["butterfly-slides"],
  { tags: ["settings"], revalidate: HOUR },
)

/** The newest `take` items of one category, or of every category of `kind`, plus the total count. */
export const getCollectionItems = unstable_cache(
  async (categoryId: string | null, take: number, kind: CategoryKind = "COLLECTION") => {
    const where = categoryId ? { categoryId } : { categoryId: { in: await categoryIdsOf(kind) } }
    const [items, total] = await Promise.all([
      // Descriptions come along so the gallery popup can open without another request.
      prisma.collectionItem.findMany({ where, select: { ...itemSelect, description: true }, orderBy: { createdAt: "desc" }, take }),
      prisma.collectionItem.count({ where }),
    ])
    return { items, total }
  },
  ["collection-items-v3"],
  { tags: ["collection-items", "categories"], revalidate: HOUR },
)

/** Newest items from the bridal and groom categories, for the homepage showcase. */
export const getLatestBridalItems = unstable_cache(
  async (take: number) => {
    const categories = await prisma.category.findMany({ select: { id: true, name: true } })
    const ids = categories.filter((c) => /bridal|bride|groom|suit/i.test(c.name)).map((c) => c.id)
    if (!ids.length) return []
    return prisma.collectionItem.findMany({
      where: { categoryId: { in: ids } },
      select: itemSelect,
      orderBy: { createdAt: "desc" },
      take,
    })
  },
  ["latest-bridal-items"],
  { tags: ["collection-items", "categories"], revalidate: HOUR },
)

export const getCollectionItem = unstable_cache(
  (id: string) =>
    prisma.collectionItem.findUnique({ where: { id }, select: { ...itemSelect, description: true } }),
  ["collection-item"],
  { tags: ["collection-items", "categories"], revalidate: HOUR },
)

export const getStyleIdeas = unstable_cache(
  async (take: number) => {
    const [ideas, total] = await Promise.all([
      prisma.styleIdea.findMany({ select: ideaSelect, orderBy: { createdAt: "desc" }, take }),
      prisma.styleIdea.count(),
    ])
    return { ideas, total }
  },
  ["style-ideas"],
  { tags: ["style-ideas"], revalidate: HOUR },
)

/** Search is not cached — the query text is free-form, so cache entries would never be reused. */
export async function searchStyleIdeas(q: string, take: number) {
  const where = {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
    ],
  }
  const [ideas, total] = await Promise.all([
    prisma.styleIdea.findMany({ where, select: ideaSelect, orderBy: { createdAt: "desc" }, take }),
    prisma.styleIdea.count({ where }),
  ])
  return { ideas, total }
}

export const getStyleIdea = unstable_cache(
  async (id: string) => {
    const idea = await prisma.styleIdea.findUnique({
      where: { id },
      select: { ...ideaSelect, description: true, createdAt: true },
    })
    return idea && { ...idea, createdAt: idea.createdAt.toISOString() }
  },
  ["style-idea"],
  { tags: ["style-ideas"], revalidate: HOUR },
)

/** Admin-managed homepage media: hero video and decor section background. */
export const getHomeSettings = unstable_cache(
  async () => {
    const settings = await prisma.siteSettings.findFirst()
    return {
      heroVideoUrl: settings?.heroVideoUrl ?? null,
      decorImageUrl: settings?.decorImageUrl ?? null,
    }
  },
  ["home-settings"],
  { tags: ["settings"], revalidate: HOUR },
)

/** Newest comments sent with each gallery item; the popup says when there are more. */
export const COMMENTS_SHOWN = 20

const SOCIAL_TAG = "item-social"

export type ItemComment = { id: string; name: string; text: string; createdAt: string }
export type ItemSocial = { likeCount: number; commentCount: number; comments: ItemComment[] }

/**
 * Likes and comments for every item on a gallery page, in three queries instead of three per
 * item. Cached, and refreshed whenever someone likes or comments.
 */
export const getGallerySocial = unstable_cache(
  async (itemIds: string[]): Promise<Record<string, ItemSocial>> => {
    if (!itemIds.length) return {}
    const where = { itemId: { in: itemIds } }
    const [likeCounts, commentCounts, comments] = await Promise.all([
      prisma.itemLike.groupBy({ by: ["itemId"], where, _count: { _all: true } }),
      prisma.itemComment.groupBy({ by: ["itemId"], where, _count: { _all: true } }),
      prisma.itemComment.findMany({
        where,
        select: { id: true, itemId: true, name: true, text: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        // Upper bound for the whole page; each item keeps its newest COMMENTS_SHOWN below.
        take: itemIds.length * COMMENTS_SHOWN,
      }),
    ])

    const social: Record<string, ItemSocial> = {}
    for (const id of itemIds) social[id] = { likeCount: 0, commentCount: 0, comments: [] }
    for (const row of likeCounts) social[row.itemId].likeCount = row._count._all
    for (const row of commentCounts) social[row.itemId].commentCount = row._count._all
    for (const c of comments) {
      const list = social[c.itemId].comments
      if (list.length < COMMENTS_SHOWN) list.push({ id: c.id, name: c.name, text: c.text, createdAt: c.createdAt.toISOString() })
    }
    return social
  },
  ["gallery-social"],
  { tags: [SOCIAL_TAG], revalidate: HOUR },
)

export function refreshItemSocial() {
  revalidateTag(SOCIAL_TAG, { expire: 0 })
}

/** Which of these items the visitor has liked. Per visitor, so never cached. */
export async function getLikedIds(itemIds: string[], visitorId: string | undefined) {
  if (!visitorId || !itemIds.length) return []
  const likes = await prisma.itemLike.findMany({ where: { visitorId, itemId: { in: itemIds } }, select: { itemId: true } })
  return likes.map((l) => l.itemId)
}
