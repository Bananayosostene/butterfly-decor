import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { isObjectId, refreshItemSocial } from "@/lib/data"
import { ensureVisitorId } from "@/lib/visitor"
import { type NextRequest, NextResponse } from "next/server"

const MAX_NAME = 40
const MAX_TEXT = 500
/** Minimum gap between two comments from the same visitor. */
const COOLDOWN_MS = 20 * 1000

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!isObjectId(id) || !(await prisma.collectionItem.findUnique({ where: { id }, select: { id: true } })))
      return NextResponse.json({ success: false, message: "Item not found", statusCode: 404 }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const text = typeof body.text === "string" ? body.text.trim() : ""
    if (!name || !text)
      return NextResponse.json({ success: false, message: "Please enter your name and a comment.", statusCode: 400 }, { status: 400 })
    if (name.length > MAX_NAME || text.length > MAX_TEXT)
      return NextResponse.json({ success: false, message: "Your name or comment is too long.", statusCode: 400 }, { status: 400 })

    const visitorId = await ensureVisitorId()
    const recent = await prisma.itemComment.findFirst({
      where: { visitorId, createdAt: { gte: new Date(Date.now() - COOLDOWN_MS) } },
      select: { id: true },
    })
    if (recent)
      return NextResponse.json({ success: false, message: "Please wait a moment before commenting again.", statusCode: 429 }, { status: 429 })

    const comment = await prisma.itemComment.create({
      data: { itemId: id, visitorId, name, text },
      select: { id: true, name: true, text: true, createdAt: true },
    })
    refreshItemSocial(id)
    return NextResponse.json({ success: true, message: "Comment added", statusCode: 201, data: comment }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to add comment", statusCode: 500 }, { status: 500 })
  }
}

/** Admin moderation: DELETE /api/collection-items/:id/comments?commentId=... */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    const commentId = req.nextUrl.searchParams.get("commentId") ?? ""
    if (!isObjectId(id) || !isObjectId(commentId))
      return NextResponse.json({ success: false, message: "Comment not found", statusCode: 404 }, { status: 404 })

    await prisma.itemComment.deleteMany({ where: { id: commentId, itemId: id } })
    refreshItemSocial(id)
    return NextResponse.json({ success: true, message: "Comment deleted", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete comment", statusCode: 500 }, { status: 500 })
  }
}
