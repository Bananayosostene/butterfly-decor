import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.butterflydec.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await prisma.collectionItem.findMany({
    select: { id: true, updatedAt: true },
  });

  const styleIdeas = await prisma.styleIdea.findMany({
    select: { id: true, updatedAt: true },
  });

  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/collection`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/style-inspiration`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  const itemPages = items.map((item) => ({
    url: `${BASE_URL}/collection/${item.id}`,
    lastModified: item.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const ideaPages = styleIdeas.map((idea) => ({
    url: `${BASE_URL}/style-inspiration/${idea.id}`,
    lastModified: idea.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...itemPages, ...ideaPages];
}
