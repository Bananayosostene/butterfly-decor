import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { sanitizeRichText } from "@/lib/sanitize"
import { parsePagination, buildMeta } from "@/lib/pagination"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim()
    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined
    const pagination = parsePagination(req.nextUrl.searchParams, 16)

    if (!pagination) {
      const ideas = await prisma.styleIdea.findMany({ where, orderBy: { createdAt: "desc" } })
      return NextResponse.json({ success: true, message: "Style ideas fetched", statusCode: 200, data: ideas })
    }

    const [ideas, total] = await Promise.all([
      prisma.styleIdea.findMany({ where, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.limit }),
      prisma.styleIdea.count({ where }),
    ])
    return NextResponse.json({
      success: true,
      message: "Style ideas fetched",
      statusCode: 200,
      data: ideas,
      pagination: buildMeta(pagination.page, pagination.limit, total),
    })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch style ideas", statusCode: 500 }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { title, description, imageUrl } = await req.json()
    if (!title || !imageUrl)
      return NextResponse.json({ success: false, message: "title and imageUrl are required", statusCode: 400 }, { status: 400 })
    const idea = await prisma.styleIdea.create({
      data: { title, description: description ? sanitizeRichText(description) : description, imageUrl },
    })
    return NextResponse.json({ success: true, message: "Style idea created", statusCode: 201, data: idea }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create style idea", statusCode: 500 }, { status: 500 })
  }
}
