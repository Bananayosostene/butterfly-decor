import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.butterflydec.com";

/** Every public page Google should know about. Pages that need signing in are left out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [items, albums, vendors] = await Promise.all([
    prisma.collectionItem.findMany({ select: { id: true, updatedAt: true } }),
    prisma.weddingAlbum.findMany({ select: { id: true, createdAt: true } }),
    prisma.user.findMany({ where: { role: "VENDOR" }, select: { id: true, updatedAt: true } }),
  ]);

  const staticPages = [
    { url: BASE_URL, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE_URL}/collection`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/wedding-albums`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/vendors`, changeFrequency: "weekly" as const, priority: 0.8 },
  ].map((page) => ({ ...page, lastModified: new Date() }));

  const itemPages = items.map((item) => ({
    url: `${BASE_URL}/collection?item=${item.id}`,
    lastModified: item.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const albumPages = albums.map((album) => ({
    url: `${BASE_URL}/wedding-albums/${album.id}`,
    lastModified: album.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const vendorPages = vendors.map((vendor) => ({
    url: `${BASE_URL}/vendors/${vendor.id}`,
    lastModified: vendor.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...itemPages, ...albumPages, ...vendorPages];
}
