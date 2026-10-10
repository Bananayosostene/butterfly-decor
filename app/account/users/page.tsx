import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parsePage } from "@/lib/data";
import UsersClient from "./users-client";

const PER_PAGE = 25;

/**
 * The clients (buyers): every site account that is not a vendor, searched by name. Vendors are
 * managed from the Vendors pages. The search lives in the address.
 */
export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  if (!cookieStore.get("admin_session")?.value) redirect("/login");

  const q = (params.q ?? "").trim().slice(0, 60);
  const page = parsePage(params.page);

  // Clients, including accounts that have not answered "Are you a vendor?" yet.
  // An account without a role has the field empty or missing, which a plain "not vendor" skips.
  const clients: Prisma.UserWhereInput = { OR: [{ role: "CLIENT" }, { role: null }, { role: { isSet: false } }] };
  const where: Prisma.UserWhereInput = { ...clients, ...(q && { name: { contains: q, mode: "insensitive" } }) };

  const [users, total, all] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true, googleId: true, createdAt: true },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: clients }),
  ]);

  return (
    <UsersClient
      users={users.map(({ googleId, createdAt, ...u }) => ({ ...u, google: !!googleId, joined: createdAt.toISOString() }))}
      total={total}
      all={all}
      q={q}
      page={page}
      lastPage={Math.max(1, Math.ceil(total / PER_PAGE))}
    />
  );
}
