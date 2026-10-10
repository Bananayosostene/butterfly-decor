import { unstable_cache, revalidateTag } from "next/cache"
import { prisma } from "@/lib/db"
import { isObjectId } from "@/lib/data"

/** Most photos one album can hold. */
export const MAX_ALBUM_IMAGES = 20

export type AlbumCard = { id: string; title: string; weddingDate: string | null; cover: string; count: number }
export type Album = { id: string; title: string; weddingDate: string | null; images: string[] }

const HOUR = 60 * 60

/** Every album that has photos, newest first, as cards (cover + number of photos). */
export const getWeddingAlbums = unstable_cache(
  async (): Promise<AlbumCard[]> => {
    const albums = await prisma.weddingAlbum.findMany({ orderBy: { createdAt: "desc" } })
    return albums
      .filter((a) => a.images.length)
      .map((a) => ({ id: a.id, title: a.title, weddingDate: a.weddingDate, cover: a.images[0], count: a.images.length }))
  },
  ["wedding-albums-v1"],
  { tags: ["wedding-albums"], revalidate: HOUR },
)

/** One album with all its photos. */
export const getWeddingAlbum = unstable_cache(
  async (id: string): Promise<Album | null> => {
    if (!isObjectId(id)) return null
    const album = await prisma.weddingAlbum.findUnique({ where: { id } })
    return album && album.images.length ? { id: album.id, title: album.title, weddingDate: album.weddingDate, images: album.images } : null
  },
  ["wedding-album-v1"],
  { tags: ["wedding-albums"], revalidate: HOUR },
)

export function refreshWeddingAlbums() {
  revalidateTag("wedding-albums", { expire: 0 })
}

/** Checks what the admin sent for an album. Returns an error message when it cannot be saved. */
export function cleanAlbum(body: any): { title: string; weddingDate: string | null; images: string[] } | string {
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : ""
  if (!title) return "Write the couple's names"
  if (!Array.isArray(body.images)) return "Add at least one photo"
  const images = [...new Set<string>(body.images.filter((url: unknown) => typeof url === "string" && url.startsWith("https://") && url.length <= 500))]
  if (!images.length) return "Add at least one photo"
  if (images.length > MAX_ALBUM_IMAGES) return `An album can have at most ${MAX_ALBUM_IMAGES} photos`
  const weddingDate = typeof body.weddingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.weddingDate) ? body.weddingDate : null
  return { title, weddingDate, images }
}

/** "14 February 2027" */
export function albumDate(weddingDate: string | null) {
  if (!weddingDate) return ""
  return new Date(`${weddingDate}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
}
