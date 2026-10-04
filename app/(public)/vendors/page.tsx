import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { iconForCategory } from "@/lib/category-icons";
import { isObjectId, parsePage } from "@/lib/data";
import { displaySerif } from "@/lib/fonts";
import { cldImage } from "@/lib/image";
import { getVendorCategories, getVendors, VENDORS_PAGE_SIZE } from "@/lib/vendors";

export const metadata: Metadata = {
  title: "Wedding Vendors",
  description: "Find wedding vendors in Rwanda: photographers, venues, caterers, florists and more.",
};

const INK = "#2b1807";
const ROSE = "#a0566c";

/** /vendors, /vendors?cat=<category id>, optional &q=<name> and &page=<n>. */
export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = (sp.q ?? "").trim().slice(0, 60);

  const categories = await getVendorCategories();
  const active = sp.cat && isObjectId(sp.cat) ? categories.find((c) => c.id === sp.cat) : undefined;
  const { vendors, total } = await getVendors(active?.id ?? null, q, page * VENDORS_PAGE_SIZE);

  const hrefWith = (params: { cat?: string; page?: number }) => {
    const query = new URLSearchParams();
    const cat = "cat" in params ? params.cat : active?.id;
    if (cat) query.set("cat", cat);
    if (q) query.set("q", q);
    if (params.page && params.page > 1) query.set("page", String(params.page));
    const text = query.toString();
    return text ? `/vendors?${text}` : "/vendors";
  };

  return (
    <div className="min-h-screen pb-16" style={{ background: "#fbf7f2" }}>
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <header className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: ROSE }}>Vendor directory</p>
          <h1 className={`${displaySerif.className} mt-2 text-4xl md:text-5xl`} style={{ color: INK }}>
            {active?.name ?? "Wedding Vendors"}
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-sm leading-relaxed" style={{ color: "#57422C" }}>
            Browse photographers, venues, caterers and more — trusted businesses from the Butterfly Decor vendor community.
          </p>
        </header>

        {/* Browse by category */}
        <div className="mt-8 flex items-center gap-4">
          <span className="flex-1 h-px" style={{ background: "#e8d5b7" }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: INK }}>Browse by category</span>
          <span className="flex-1 h-px" style={{ background: "#e8d5b7" }} />
        </div>
        <nav aria-label="Vendor categories" className="mt-4 overflow-x-auto scrollbar-hide border-b pb-5" style={{ borderColor: "#e8d5b7" }}>
          <div className="flex gap-7 w-max mx-auto px-2">
            {[{ id: "", name: "All", icon: "all.svg" }, ...categories.map((c) => ({ id: c.id, name: c.name, icon: iconForCategory(c.name, c.icon) }))].map((c) => {
              const isActive = (active?.id ?? "") === c.id;
              return (
                <Link
                  key={c.id || "all"}
                  href={hrefWith({ cat: c.id || undefined })}
                  className={`group flex flex-col items-center gap-2 shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                >
                  <img src={`/${c.icon}`} alt="" className="w-10 h-10 object-contain" />
                  <span className="text-xs font-semibold whitespace-nowrap" style={{ color: isActive ? ROSE : INK }}>{c.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Search by name: a plain GET form, so it works without JavaScript. */}
        <form action="/vendors" className="mt-6 flex items-center gap-2 max-w-sm">
          {active && <input type="hidden" name="cat" value={active.id} />}
          <div className="relative flex-1">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name"
              aria-label="Search vendors by name"
              className="w-full pl-4 pr-11 py-2.5 rounded-full text-sm outline-none bg-white"
              style={{ border: "1px solid #d9c7ad", color: INK }}
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: INK, color: "#f7efe3" }}
            >
              <Search size={14} />
            </button>
          </div>
          {q && (
            <Link href={active ? `/vendors?cat=${active.id}` : "/vendors"} className="text-xs underline" style={{ color: "#57422C" }}>
              Clear
            </Link>
          )}
        </form>

        <p className="mt-5 text-xs" style={{ color: "#57422C" }}>
          {total} vendor{total === 1 ? "" : "s"}
          {q && <> matching &ldquo;{q}&rdquo;</>}
        </p>

        {vendors.length === 0 ? (
          <p className="py-20 text-center text-sm" style={{ color: "#57422C" }}>
            No vendors here yet. Are you a wedding vendor?{" "}
            <Link href="/login" className="underline font-semibold" style={{ color: INK }}>Create your vendor account</Link>.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9">
            {vendors.map((v, i) => (
              <Link key={v.id} href={`/vendors/${v.id}`} className="group block">
                <div className="relative aspect-square overflow-hidden" style={{ background: "rgba(43,24,7,0.06)" }}>
                  {v.imageUrl ? (
                    <img
                      src={cldImage(v.imageUrl, 600)}
                      alt={v.name}
                      loading={i < 4 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <span className={`${displaySerif.className} absolute inset-0 flex items-center justify-center text-5xl`} style={{ color: "rgba(43,24,7,0.25)" }}>
                      {v.name.charAt(0)}
                    </span>
                  )}
                </div>
                {v.category && (
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#57422C" }}>{v.category}</p>
                )}
                <p className={`${displaySerif.className} mt-1 text-lg leading-tight group-hover:underline`} style={{ color: INK }}>{v.name}</p>
                {v.location && <p className="mt-1 text-xs font-semibold" style={{ color: "#57422C" }}>{v.location}</p>}
              </Link>
            ))}
          </div>
        )}

        {vendors.length < total && (
          <div className="mt-10 text-center">
            <Link
              href={hrefWith({ page: page + 1 })}
              scroll={false}
              className="inline-block px-7 py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em]"
              style={{ background: INK, color: "#f7efe3" }}
            >
              Show more vendors
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
