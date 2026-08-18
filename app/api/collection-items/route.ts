import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { sanitizeRichText } from "@/lib/sanitize"
import { parsePagination, buildMeta } from "@/lib/pagination"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId")
    const ids = searchParams.get("ids")?.split(",").filter(Boolean)
    const where = ids?.length ? { id: { in: ids } } : categoryId ? { categoryId } : undefined
    const pagination = parsePagination(searchParams, 24)

    if (!pagination) {
      const items = await prisma.collectionItem.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json({ success: true, message: "Items fetched", statusCode: 200, data: items })
    }

    const [items, total] = await Promise.all([
      prisma.collectionItem.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.collectionItem.count({ where }),
    ])
    return NextResponse.json({
      success: true,
      message: "Items fetched",
      statusCode: 200,
      data: items,
      pagination: buildMeta(pagination.page, pagination.limit, total),
    })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch items", statusCode: 500 }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { name, description, imageUrl, categoryId } = await req.json()
    if (!name || !imageUrl || !categoryId)
      return NextResponse.json({ success: false, message: "name, imageUrl and categoryId are required", statusCode: 400 }, { status: 400 })
    const item = await prisma.collectionItem.create({
      data: { name, description: description ? sanitizeRichText(description) : description, imageUrl, categoryId },
      include: { category: true },
    })
    return NextResponse.json({ success: true, message: "Item created", statusCode: 201, data: item }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create item", statusCode: 500 }, { status: 500 })
  }
}
