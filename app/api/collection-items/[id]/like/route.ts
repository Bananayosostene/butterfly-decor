import { prisma } from "@/lib/db"
import { isObjectId, refreshItemSocial, refreshVisitorLikes } from "@/lib/data"
import { ensureVisitorId } from "@/lib/visitor"
import { type NextRequest, NextResponse } from "next/server"

/** Toggles the current visitor's like on an item. */
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!isObjectId(id) || !(await prisma.collectionItem.findUnique({ where: { id }, select: { id: true } })))
      return NextResponse.json({ success: false, message: "Item not found", statusCode: 404 }, { status: 404 })

    const visitorId = await ensureVisitorId()
    const { count: removed } = await prisma.itemLike.deleteMany({ where: { itemId: id, visitorId } })
    if (!removed) {
      // A double-click can race two creates; the unique index rejects the second, which is fine.
      await prisma.itemLike.create({ data: { itemId: id, visitorId } }).catch(() => {})
    }

    const count = await prisma.itemLike.count({ where: { itemId: id } })
    refreshItemSocial()
    refreshVisitorLikes(visitorId)
    return NextResponse.json({ success: true, message: "Like updated", statusCode: 200, data: { liked: !removed, count } })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update like", statusCode: 500 }, { status: 500 })
  }
}
