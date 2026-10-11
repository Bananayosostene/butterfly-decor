import { prisma } from "@/lib/db"
import { isBot } from "@/lib/user-agent"
import { ensureVisitorId } from "@/lib/visitor"
import { OWNER_COOKIE } from "@/lib/visits"
import { type NextRequest, NextResponse } from "next/server"

const KINDS = ["ITEM", "ALBUM", "VENDOR"]
const KEY = /^[\w.-]{1,80}$/
const MAX_KEYS = 40

/**
 * Records that this device saw some images (opened, or scrolled past) and returns how many
 * devices have viewed each of them. Anyone counts, signed in or not; each device counts once
 * per image. The site owner's own views and bots are not recorded.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const kind = KINDS.includes(body?.kind) ? (body.kind as string) : null
    const keys: string[] = Array.isArray(body?.keys)
      ? [...new Set<string>(body.keys.filter((key: unknown) => typeof key === "string" && KEY.test(key)))].slice(0, MAX_KEYS)
      : []
    if (!kind || !keys.length) return NextResponse.json({ success: false, message: "Nothing to record", statusCode: 400 }, { status: 400 })

    const owner = !!req.cookies.get(OWNER_COOKIE)?.value || !!req.cookies.get("admin_session")?.value
    if (!owner && !isBot(req.headers.get("user-agent") || "")) {
      const viewerId = await ensureVisitorId()
      // Only images this device has not been counted for yet are added.
      const already = await prisma.imageView.findMany({ where: { kind, viewerId, key: { in: keys } }, select: { key: true } })
      const fresh = keys.filter((key) => !already.some((row) => row.key === key))
      if (fresh.length) await prisma.imageView.createMany({ data: fresh.map((key) => ({ kind, key, viewerId })) })
    }

    const rows = await prisma.imageView.groupBy({ by: ["key"], where: { kind, key: { in: keys } }, _count: { key: true } })
    const counts: Record<string, number> = Object.fromEntries(keys.map((key) => [key, 0]))
    for (const row of rows) counts[row.key] = row._count.key
    return NextResponse.json({ success: true, counts })
  } catch (error) {
    console.error("View record error:", error)
    return NextResponse.json({ success: false, message: "Failed to record views", statusCode: 500 }, { status: 500 })
  }
}
