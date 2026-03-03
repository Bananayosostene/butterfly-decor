import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const images = await prisma.portfolioImage.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(images)
  } catch (error) {
    console.error("Portfolio fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio images" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const image = await prisma.portfolioImage.create({
      data: {
        title: body.title,
        category: body.category,
        imageUrl: body.imageUrl,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error("Portfolio creation error:", error)
    return NextResponse.json({ error: "Failed to create portfolio image" }, { status: 500 })
  }
}
