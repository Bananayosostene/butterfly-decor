import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.collectionItem.findUnique({ where: { id: params.id }, include: { category: true } })
    if (!item) return NextResponse.json({ success: false, message: "Item not found", statusCode: 404 }, { status: 404 })
    return NextResponse.json({ success: true, message: "Item fetched", statusCode: 200, data: item })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch item", statusCode: 500 }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const item = await prisma.collectionItem.update({ where: { id: params.id }, data: body, include: { category: true } })
    return NextResponse.json({ success: true, message: "Item updated", statusCode: 200, data: item })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update item", statusCode: 500 }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.collectionItem.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: "Item deleted", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete item", statusCode: 500 }, { status: 500 })
  }
}
