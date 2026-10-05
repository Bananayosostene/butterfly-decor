import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import VendorItemsClient from "./vendor-items-client";

const PAGE_SIZE = 24;

export default async function VendorItemsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);

  const [items, total] = await Promise.all([
    prisma.vendorItem.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        imageUrl: true,
        description: true,
        active: true,
        vendor: { select: { id: true, name: true, businessName: true, vendorCategory: { select: { name: true } } } },
      },
    }),
    prisma.vendorItem.count(),
  ]);

  return (
    <VendorItemsClient
      items={items.map((i) => ({
        id: i.id,
        imageUrl: i.imageUrl,
        description: i.description,
        active: i.active,
        vendorId: i.vendor.id,
        vendorName: i.vendor.businessName || i.vendor.name,
        category: i.vendor.vendorCategory?.name ?? null,
      }))}
      page={page}
      totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
      total={total}
    />
  );
}
