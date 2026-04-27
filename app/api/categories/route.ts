import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } })
    return NextResponse.json({ success: true, message: "Categories fetched", statusCode: 200, data: categories })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch categories", statusCode: 500 }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, imageUrl } = await req.json()
    if (!name) return NextResponse.json({ success: false, message: "Name is required", statusCode: 400 }, { status: 400 })
    const category = await prisma.category.create({ data: { name, description, imageUrl } })
    return NextResponse.json({ success: true, message: "Category created", statusCode: 201, data: category }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create category", statusCode: 500 }, { status: 500 })
  }
}
