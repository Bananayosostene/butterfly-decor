import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { sanitizeRichText } from "@/lib/sanitize"
import { parsePagination, buildMeta } from "@/lib/pagination"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const pagination = parsePagination(req.nextUrl.searchParams, 10)
    const q = req.nextUrl.searchParams.get("q")?.trim()
    const where = q ? { name: { contains: q, mode: "insensitive" as const } } : undefined

    if (!pagination) {
      const categories = await prisma.category.findMany({
        where,
        orderBy: { createdAt: "asc" },
        include: { images: { orderBy: { order: "asc" } } },
      })
      return NextResponse.json({ success: true, message: "Categories fetched", statusCode: 200, data: categories })
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { createdAt: "asc" },
        include: { images: { orderBy: { order: "asc" } } },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.category.count({ where }),
    ])
    return NextResponse.json({
      success: true,
      message: "Categories fetched",
      statusCode: 200,
      data: categories,
      pagination: buildMeta(pagination.page, pagination.limit, total),
    })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch categories", statusCode: 500 }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { name, description, imageUrl } = await req.json()
    if (!name) return NextResponse.json({ success: false, message: "Name is required", statusCode: 400 }, { status: 400 })
    const category = await prisma.category.create({
      data: { name, description: description ? sanitizeRichText(description) : description, imageUrl },
    })
    return NextResponse.json({ success: true, message: "Category created", statusCode: 201, data: category }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create category", statusCode: 500 }, { status: 500 })
  }
}
