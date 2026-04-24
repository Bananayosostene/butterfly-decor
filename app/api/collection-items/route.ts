import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId")
    const items = await prisma.collectionItem.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, message: "Items fetched", statusCode: 200, data: items })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch items", statusCode: 500 }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, imageUrl, categoryId } = await req.json()
    if (!name || !imageUrl || !categoryId)
      return NextResponse.json({ success: false, message: "name, imageUrl and categoryId are required", statusCode: 400 }, { status: 400 })
    const item = await prisma.collectionItem.create({ data: { name, description, imageUrl, categoryId }, include: { category: true } })
    return NextResponse.json({ success: true, message: "Item created", statusCode: 201, data: item }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create item", statusCode: 500 }, { status: 500 })
  }
}
