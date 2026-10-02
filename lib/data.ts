import { unstable_cache, revalidateTag } from "next/cache"
import { prisma } from "@/lib/db"

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
  category: { select: { id: true, name: true } },
} as const

const ideaSelect = { id: true, title: true, imageUrl: true } as const

/** Category names for the collection filter tabs. */
export const getCategoryTabs = unstable_cache(
  () => prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ["category-tabs"],
  { tags: ["categories"], revalidate: HOUR },
)

/** Categories with their gallery, for the homepage services section. */
export const getHomeCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        images: { orderBy: { order: "asc" }, take: 2, select: { id: true, imageUrl: true } },
      },
    }),
  ["home-categories"],
  { tags: ["categories"], revalidate: HOUR },
)

/** The newest `take` items (optionally within one category) plus the total count. */
export const getCollectionItems = unstable_cache(
  async (categoryId: string | null, take: number) => {
    const where = categoryId ? { categoryId } : undefined
    const [items, total] = await Promise.all([
      prisma.collectionItem.findMany({ where, select: itemSelect, orderBy: { createdAt: "desc" }, take }),
      prisma.collectionItem.count({ where }),
    ])
    return { items, total }
  },
  ["collection-items"],
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

export const getHeroVideoUrl = unstable_cache(
  async () => (await prisma.siteSettings.findFirst())?.heroVideoUrl ?? null,
  ["hero-video-url"],
  { tags: ["settings"], revalidate: HOUR },
)

/**
 * Right-hand feed of the item page: the rest of the item's category first, then the rest of the
 * collection once the category runs out. Also returns the previous/next item within the category.
 */
export const getItemFeed = unstable_cache(
  async (itemId: string, categoryId: string, take: number) => {
    const [sameCategory, total] = await Promise.all([
      prisma.collectionItem.findMany({
        where: { categoryId },
        select: itemSelect,
        orderBy: { createdAt: "desc" },
        take: take + 1,
      }),
      prisma.collectionItem.count(),
    ])

    const index = sameCategory.findIndex((i) => i.id === itemId)
    const hasNeighbours = index !== -1 && sameCategory.length > 1
    const prevId = hasNeighbours ? sameCategory[(index - 1 + sameCategory.length) % sameCategory.length].id : null
    const nextId = hasNeighbours ? sameCategory[(index + 1) % sameCategory.length].id : null

    const related = sameCategory.filter((i) => i.id !== itemId).slice(0, take)
    const others =
      related.length < take
        ? await prisma.collectionItem.findMany({
            where: { categoryId: { not: categoryId } },
            select: itemSelect,
            orderBy: { createdAt: "desc" },
            take: take - related.length,
          })
        : []

    const feed = [...related, ...others]
    return { feed, hasMore: feed.length < total - 1, prevId, nextId }
  },
  ["item-feed"],
  { tags: ["collection-items", "categories"], revalidate: HOUR },
)

/** Newest comments shown on an item page. */
export const COMMENTS_SHOWN = 50

const socialTag = (itemId: string) => `item-social-${itemId}`

/** Like count and comments of one item. Cached per item and refreshed when someone likes or comments. */
export function getItemSocial(itemId: string) {
  return unstable_cache(
    async () => {
      const [likeCount, commentCount, comments] = await Promise.all([
        prisma.itemLike.count({ where: { itemId } }),
        prisma.itemComment.count({ where: { itemId } }),
        prisma.itemComment.findMany({
          where: { itemId },
          select: { id: true, name: true, text: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: COMMENTS_SHOWN,
        }),
      ])
      return {
        likeCount,
        commentCount,
        comments: comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
      }
    },
    ["item-social", itemId],
    { tags: [socialTag(itemId)], revalidate: HOUR },
  )()
}

export function refreshItemSocial(itemId: string) {
  revalidateTag(socialTag(itemId), { expire: 0 })
}

/** Per-visitor, so never cached. */
export async function hasLiked(itemId: string, visitorId: string | undefined) {
  if (!visitorId) return false
  return !!(await prisma.itemLike.findFirst({ where: { itemId, visitorId }, select: { id: true } }))
}
