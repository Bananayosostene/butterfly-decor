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
