import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/user-auth";
import MyGalleryClient from "./my-gallery-client";

/** A vendor's own photos (including any the admin has hidden). */
export default async function MyGalleryPage() {
  const user = await getCurrentUser();
  if (user?.role !== "VENDOR") redirect("/login");

  const status = (await prisma.user.findUnique({ where: { id: user.id }, select: { vendorStatus: true } }))?.vendorStatus;
  const items = await prisma.vendorItem.findMany({
    where: { vendorId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, imageUrl: true, description: true, active: true },
  });

  return (
    <div className="space-y-5">
      {status === "PENDING" && (
        <p className="p-4 rounded-2xl border border-border text-sm" style={{ background: "var(--dash-soft)", color: "var(--foreground)" }}>
          Your page is being reviewed and is not visible to couples yet. Add your best photos now, so it is ready when we approve it.
        </p>
      )}
      {status === "SUSPENDED" && (
        <p className="p-4 rounded-2xl text-sm" style={{ background: "var(--dash-danger-bg)", color: "var(--dash-danger)" }}>
          Your page is hidden from couples for now. Please contact Butterfly Decor.
        </p>
      )}
      <MyGalleryClient items={items} vendorId={user.id} />
    </div>
  );
}
