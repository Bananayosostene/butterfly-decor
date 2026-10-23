import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import type { Prisma } from "@prisma/client"
import { getSessionAdminId } from "@/lib/auth"
import { getUserByToken, USER_COOKIE } from "@/lib/user-auth"

/**
 * Whose notifications the current dashboard user sees: the admin sees the admin notices, a vendor
 * their own. Returns null when nobody is signed in to the dashboard.
 */
export async function notificationScope(req?: NextRequest): Promise<Prisma.NotificationWhereInput | null> {
  const store = req ? req.cookies : await cookies()
  if (await getSessionAdminId(store.get("admin_session")?.value)) return { audience: "ADMIN" }
  const user = await getUserByToken(store.get(USER_COOKIE)?.value)
  return user ? { audience: "USER", userId: user.id } : null
}
