import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { isObjectId, parsePage } from "@/lib/data";
import { cldImage } from "@/lib/image";
import { vendorsHref } from "./href";
import VendorFilters from "./vendor-filters";

const PER_PAGE = 25;

/** Every vendor account, searched by name and filtered by category. The filters live in the address. */
export default async function VendorsAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string }> }) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const q = (params.q ?? "").trim().slice(0, 60);
  const category = params.category && isObjectId(params.category) ? params.category : "";
  const page = parsePage(params.page);

  const where: Prisma.UserWhereInput = {
    role: "VENDOR",
    ...(category && { vendorCategoryId: category }),
    // The search matches the business name or the owner's name.
    ...(q && { OR: [{ businessName: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] }),
  };

  const [vendors, total, all, categories] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true, name: true, email: true, phone: true, businessName: true, location: true, coverUrl: true, createdAt: true,
        vendorCategory: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "VENDOR" } }),
    prisma.vendorCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-6">
      <VendorFilters q={q} category={category} categories={categories} summary={q || category ? `${total} of ${all} vendors` : `${all} vendor${all !== 1 ? "s" : ""}`} />

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {["Vendor", "Category", "Contact", "Location", "Photos", "Joined", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => {
                const title = v.businessName || v.name;
                return (
                  <tr key={v.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {v.coverUrl ? (
                          <img src={cldImage(v.coverUrl, 120)} alt="" loading="lazy" className="w-10 h-10 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <span className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-primary text-primary-foreground text-sm font-bold uppercase">{title.charAt(0)}</span>
                        )}
                        <div className="min-w-0">
                          <p className="text-foreground font-medium truncate">{title}</p>
                          {v.businessName && <p className="text-xs text-muted-foreground truncate">{v.name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{v.vendorCategory?.name ?? "Not chosen"}</td>
                    <td className="px-4 py-3">
                      <p className="text-foreground whitespace-nowrap">{v.phone || "-"}</p>
                      <p className="text-xs text-muted-foreground">{v.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{v.location || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v._count.items}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{v.createdAt.toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <a href={`/vendors/${v.id}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap" style={{ color: "var(--dash-accent)" }}>
                        <ExternalLink className="w-3 h-3" /> View page
                      </a>
                    </td>
                  </tr>
                );
              })}
              {vendors.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">{all ? "No vendors match." : "No vendor has signed up yet."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Page {page} of {lastPage}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={vendorsHref(q, category, page - 1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Previous</Link>}
            {page < lastPage && <Link href={vendorsHref(q, category, page + 1)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent">Next</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
