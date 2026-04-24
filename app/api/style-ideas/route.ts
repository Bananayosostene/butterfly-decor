import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const ideas = await prisma.styleIdea.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ success: true, message: "Style ideas fetched", statusCode: 200, data: ideas })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch style ideas", statusCode: 500 }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, imageUrl, tags } = await req.json()
    if (!title || !imageUrl)
      return NextResponse.json({ success: false, message: "title and imageUrl are required", statusCode: 400 }, { status: 400 })
    const idea = await prisma.styleIdea.create({ data: { title, description, imageUrl, tags: tags ?? [] } })
    return NextResponse.json({ success: true, message: "Style idea created", statusCode: 201, data: idea }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create style idea", statusCode: 500 }, { status: 500 })
  }
}
