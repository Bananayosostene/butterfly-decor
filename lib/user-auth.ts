import { randomBytes } from "crypto"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionAdminId } from "@/lib/auth"

/**
 * Sign-in for site accounts (clients and vendors). The site owner signs in separately through
 * lib/auth.ts (AdminUser); both kinds of session can open the dashboard, with different menus.
 */

export const USER_COOKIE = "user_session"
const SESSION_DAYS = 30

export type UserRole = "CLIENT" | "VENDOR"

export async function startUserSession(userId: string) {
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await prisma.userSession.create({ data: { token, userId, expiresAt } })
  ;(await cookies()).set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })
}

export async function endUserSession() {
  const store = await cookies()
  const token = store.get(USER_COOKIE)?.value
  if (token) await prisma.userSession.deleteMany({ where: { token } })
  store.delete(USER_COOKIE)
}

/** The account behind a session token, or null when the token is missing or expired. */
export async function getUserByToken(token: string | undefined) {
  if (!token) return null
  const session = await prisma.userSession.findUnique({
    where: { token },
    select: {
      expiresAt: true,
      user: { select: { id: true, name: true, email: true, role: true, businessName: true, vendorCategoryId: true } },
    },
  })
  if (!session || session.expiresAt < new Date()) return null
  return session.user
}

/** For server components and route handlers. */
export async function getCurrentUser() {
  return getUserByToken((await cookies()).get(USER_COOKIE)?.value)
}

export type DashboardUser = { role: "ADMIN" } | { role: "VENDOR"; id: string; name: string }

/** Who is using the dashboard: the site admin, a vendor, or nobody (null). */
export async function getDashboardUser(req?: NextRequest): Promise<DashboardUser | null> {
  const store = req ? req.cookies : await cookies()
  if (await getSessionAdminId(store.get("admin_session")?.value)) return { role: "ADMIN" }
  const user = await getUserByToken(store.get(USER_COOKIE)?.value)
  if (user?.role === "VENDOR") return { role: "VENDOR", id: user.id, name: user.businessName || user.name }
  return null
}
