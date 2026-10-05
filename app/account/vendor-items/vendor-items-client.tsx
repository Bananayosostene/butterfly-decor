"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { cldImage } from "@/lib/image";

type Item = {
  id: string;
  imageUrl: string;
  description: string | null;
  active: boolean;
  vendorId: string;
  vendorName: string;
  category: string | null;
};

export default function VendorItemsClient({
  items,
  page,
  totalPages,
  total,
}: {
  items: Item[];
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  // The server page owns the data: after a change we just ask it to render again.
  const reload = () => startTransition(() => router.refresh());

  const setActive = async (item: Item, active: boolean) => {
    setBusyId(item.id);
    await fetch(`/api/vendor/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setBusyId(null);
    reload();
  };

  const handleDelete = async (item: Item) => {
    if (!confirm(`Delete this photo from ${item.vendorName}?`)) return;
    await fetch(`/api/vendor/items/${item.id}`, { method: "DELETE" });
    reload();
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {total} photo{total === 1 ? "" : "s"} added by vendors. Deactivate a photo to hide it from the public pages; the
        vendor still sees it in their gallery, marked as hidden.
      </p>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">Vendors have not added any photos yet.</p>
      ) : (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${loading ? "opacity-60" : ""}`}>
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={cldImage(item.imageUrl, 500)}
                  alt={item.description ?? item.vendorName}
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover ${item.active ? "" : "opacity-40 grayscale"}`}
                />
                <span
                  className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={item.active ? { background: "#dcfce7", color: "#166534" } : { background: "#fee2e2", color: "#991b1b" }}
                >
                  {item.active ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="p-3">
                <Link href={`/vendors/${item.vendorId}`} target="_blank" className="font-semibold text-foreground text-sm truncate block hover:underline">
                  {item.vendorName}
                </Link>
                {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setActive(item, !item.active)}
                    disabled={busyId === item.id}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    {item.active ? <><EyeOff className="w-3 h-3" /> Deactivate</> : <><Eye className="w-3 h-3" /> Activate</>}
                  </button>
                  <button onClick={() => handleDelete(item)} aria-label="Delete" className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => startTransition(() => router.push(`/account/vendor-items?page=${p}`))}
      />
    </div>
  );
}
