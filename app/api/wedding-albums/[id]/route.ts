import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { isObjectId } from "@/lib/data"
import { cleanAlbum, refreshWeddingAlbums } from "@/lib/wedding-albums"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    if (!isObjectId(id)) return NextResponse.json({ success: false, message: "Album not found", statusCode: 404 }, { status: 404 })
    const data = cleanAlbum(await req.json())
    if (typeof data === "string") return NextResponse.json({ success: false, message: data, statusCode: 400 }, { status: 400 })

    const album = await prisma.weddingAlbum.update({ where: { id }, data })
    refreshWeddingAlbums()
    return NextResponse.json({ success: true, message: "Album updated", statusCode: 200, data: album })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update the album", statusCode: 500 }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    if (!isObjectId(id)) return NextResponse.json({ success: false, message: "Album not found", statusCode: 404 }, { status: 404 })
    await prisma.weddingAlbum.delete({ where: { id } })
    refreshWeddingAlbums()
    return NextResponse.json({ success: true, message: "Album deleted", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete the album", statusCode: 500 }, { status: 500 })
  }
}
