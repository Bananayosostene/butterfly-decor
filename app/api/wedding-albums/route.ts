import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { cleanAlbum, refreshWeddingAlbums } from "@/lib/wedding-albums"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const data = cleanAlbum(await req.json())
    if (typeof data === "string") return NextResponse.json({ success: false, message: data, statusCode: 400 }, { status: 400 })

    const album = await prisma.weddingAlbum.create({ data })
    refreshWeddingAlbums()
    return NextResponse.json({ success: true, message: "Album created", statusCode: 201, data: album }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create the album", statusCode: 500 }, { status: 500 })
  }
}
