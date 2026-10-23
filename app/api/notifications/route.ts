import { prisma } from "@/lib/db"
import { notificationScope } from "@/lib/notifications"
import { type NextRequest, NextResponse } from "next/server"

const unauthorized = () => NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })

/**
 * The bell in the dashboard asks this every half minute: how many notices are unread, and the
 * newest ones. (A live count cannot come with the page itself, so this is the one read the
 * dashboard makes from the browser.)
 */
export async function GET(req: NextRequest) {
  const scope = await notificationScope(req)
  if (!scope) return unauthorized()
  const [unread, items] = await Promise.all([
    prisma.notification.count({ where: { ...scope, readAt: null } }),
    prisma.notification.findMany({
      where: scope,
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, type: true, title: true, body: true, href: true, readAt: true, createdAt: true },
    }),
  ])
  return NextResponse.json({ success: true, unread, items })
}

/** Marks one notice (`id`) or all of them (`all: true`) as read. */
export async function POST(req: NextRequest) {
  const scope = await notificationScope(req)
  if (!scope) return unauthorized()
  const body = await req.json().catch(() => ({}))
  const one = typeof body.id === "string" && /^[a-f\d]{24}$/i.test(body.id) ? body.id : null
  if (!one && body.all !== true) return NextResponse.json({ success: false, message: "Nothing to mark", statusCode: 400 }, { status: 400 })
  await prisma.notification.updateMany({ where: { ...scope, readAt: null, ...(one ? { id: one } : {}) }, data: { readAt: new Date() } })
  return NextResponse.json({ success: true })
}
