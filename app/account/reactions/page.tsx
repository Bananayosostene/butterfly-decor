import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { cldImage } from "@/lib/image";
import { itemHref } from "@/lib/category-icons";
import { OWNER_VISITS } from "@/lib/visits";
import { StatCard } from "@/components/account/stat-card";

const RECENT = 20;
const TOP = 8;

const kigali = (date: Date) =>
  date.toLocaleString("en-GB", { timeZone: "Africa/Kigali", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

/** What visitors liked and wrote: most liked images, newest comments and newest likes. */
export default async function ReactionsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  // The owner's own test likes and comments are left out.
  const ownerVisits = await prisma.deviceVisit.findMany({ where: { ...OWNER_VISITS, visitorId: { not: null } }, distinct: ["visitorId"], select: { visitorId: true } });
  const real = { visitorId: { notIn: ownerVisits.map((v) => v.visitorId!) } };

  const [likeCount, commentCount, top, comments, likes, viewCount, mostViewed] = await Promise.all([
    prisma.itemLike.count({ where: real }),
    prisma.itemComment.count({ where: real }),
    prisma.itemLike.groupBy({ by: ["itemId"], where: real, _count: { itemId: true }, orderBy: { _count: { itemId: "desc" } }, take: TOP }),
    prisma.itemComment.findMany({ where: real, orderBy: { createdAt: "desc" }, take: RECENT }),
    prisma.itemLike.findMany({ where: real, orderBy: { createdAt: "desc" }, take: RECENT }),
    prisma.imageView.count(),
    prisma.imageView.groupBy({ by: ["key"], where: { kind: "ITEM" }, _count: { key: true }, orderBy: { _count: { key: "desc" } }, take: TOP }),
  ]);

  // The images these reactions are about, and where each visitor was (when a visit recorded it).
  const itemIds = [...new Set([...top.map((t) => t.itemId), ...comments.map((c) => c.itemId), ...likes.map((l) => l.itemId), ...mostViewed.map((v) => v.key)])];
  const visitorIds = [...new Set([...comments.map((c) => c.visitorId), ...likes.map((l) => l.visitorId)])];
  const [items, visits] = await Promise.all([
    prisma.collectionItem.findMany({ where: { id: { in: itemIds } }, select: { id: true, name: true, imageUrl: true } }),
    prisma.deviceVisit.findMany({
      where: { visitorId: { in: visitorIds } },
      orderBy: { createdAt: "desc" },
      select: { visitorId: true, userName: true, city: true, country: true, device: true },
    }),
  ]);
  const itemOf = new Map(items.map((i) => [i.id, i]));
  const who = (visitorId: string) => {
    const visit = visits.find((v) => v.visitorId === visitorId);
    if (!visit) return "Guest";
    return [visit.userName || "Guest", [visit.city, visit.country].filter(Boolean).join(", "), visit.device].filter(Boolean).join(" · ");
  };

  const Thumb = ({ itemId }: { itemId: string }) => {
    const item = itemOf.get(itemId);
    return item ? (
      <a href={itemHref(item.id)} target="_blank" className="flex items-center gap-3 min-w-0">
        <img src={cldImage(item.imageUrl, 120)} alt="" loading="lazy" className="w-11 h-11 shrink-0 rounded-lg object-cover" />
        <span className="text-sm text-foreground truncate">{item.name}</span>
      </a>
    ) : (
      <span className="text-sm text-muted-foreground">Deleted image</span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 max-w-3xl">
        <StatCard label="Image views" value={viewCount} icon={Eye} />
        <StatCard label="Likes" value={likeCount} icon={Heart} />
        <StatCard label="Comments" value={commentCount} icon={MessageCircle} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Most viewed collection images</h2>
        {mostViewed.length === 0 ? (
          <p className="text-sm text-muted-foreground">No views recorded yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {mostViewed.map((v) => (
              <div key={v.key} className="flex items-center justify-between gap-3">
                <Thumb itemId={v.key} />
                <span className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--dash-accent)" }}>
                  <Eye className="w-3.5 h-3.5" /> {v._count.key}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Most liked images</h2>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">No likes yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {top.map((t) => (
              <div key={t.itemId} className="flex items-center justify-between gap-3">
                <Thumb itemId={t.itemId} />
                <span className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--dash-accent)" }}>
                  <Heart className="w-3.5 h-3.5" /> {t._count.itemId}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Newest comments</h2>
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="space-y-1.5">
                  <Thumb itemId={c.itemId} />
                  <p className="text-sm text-foreground"><span className="font-semibold">{c.name}:</span> {c.text}</p>
                  <p className="text-xs text-muted-foreground">{kigali(c.createdAt)} · {who(c.visitorId)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Newest likes</h2>
          {likes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No likes yet.</p>
          ) : (
            <ul className="space-y-3">
              {likes.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3">
                  <Thumb itemId={l.itemId} />
                  <span className="shrink-0 text-xs text-muted-foreground text-right">{kigali(l.createdAt)}<br />{who(l.visitorId)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
