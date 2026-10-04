import { unstable_cache, revalidateTag } from "next/cache"
import { prisma } from "@/lib/db"

/** Cached reads for the public vendor pages; every vendor-related write calls refreshVendors(). */

const TAG = "vendors"
const HOUR = 60 * 60

export const VENDORS_PAGE_SIZE = 24

export function refreshVendors() {
  revalidateTag(TAG, { expire: 0 })
}

export const getVendorCategories = unstable_cache(
  () => prisma.vendorCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, icon: true } }),
  ["vendor-categories"],
  { tags: [TAG], revalidate: HOUR },
)

/** Vendors for the directory: newest first, optionally in one category and/or matching a name. */
export const getVendors = unstable_cache(
  async (categoryId: string | null, q: string, take: number) => {
    const where = {
      role: "VENDOR",
      ...(categoryId ? { vendorCategoryId: categoryId } : {}),
      ...(q ? { businessName: { contains: q, mode: "insensitive" as const } } : {}),
    }
    const [vendors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        select: {
          id: true,
          name: true,
          businessName: true,
          location: true,
          coverUrl: true,
          vendorCategory: { select: { name: true } },
          // The newest active photo stands in when the vendor has not chosen a cover.
          items: { where: { active: true }, orderBy: { createdAt: "desc" }, take: 1, select: { imageUrl: true } },
        },
      }),
      prisma.user.count({ where }),
    ])
    return {
      total,
      vendors: vendors.map((v) => ({
        id: v.id,
        name: v.businessName || v.name,
        location: v.location,
        category: v.vendorCategory?.name ?? null,
        imageUrl: v.coverUrl || v.items[0]?.imageUrl || null,
      })),
    }
  },
  ["vendors-list"],
  { tags: [TAG], revalidate: HOUR },
)

/** One vendor with their active photos, for the public profile page. */
export const getVendor = unstable_cache(
  async (id: string) => {
    const vendor = await prisma.user.findFirst({
      where: { id, role: "VENDOR" },
      select: {
        id: true,
        name: true,
        businessName: true,
        location: true,
        about: true,
        phone: true,
        vendorCategory: { select: { id: true, name: true } },
        items: {
          where: { active: true },
          orderBy: { createdAt: "desc" },
          select: { id: true, imageUrl: true, description: true },
        },
      },
    })
    return vendor && { ...vendor, name: vendor.businessName || vendor.name }
  },
  ["vendor"],
  { tags: [TAG], revalidate: HOUR },
)
