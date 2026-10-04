import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import VendorCategoriesClient from "./vendor-categories-client";

export default async function VendorCategoriesPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const categories = await prisma.vendorCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, icon: true, _count: { select: { vendors: true } } },
  });

  return (
    <VendorCategoriesClient
      categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, vendors: c._count.vendors }))}
    />
  );
}
