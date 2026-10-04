import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { refreshPublicData } from "@/lib/data"
import { type NextRequest, NextResponse } from "next/server"

const isUpload = (url: unknown): url is string => typeof url === "string" && url.startsWith("https://res.cloudinary.com/")

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const body = await req.json().catch(() => ({}))

    // { import: true } copies the photos that categories used to supply to the animation.
    if (body.import) {
      const categories = await prisma.category.findMany({
        orderBy: { createdAt: "asc" },
        select: { name: true, imageUrl: true, images: { orderBy: { order: "asc" }, select: { imageUrl: true } } },
      })
      const slides = categories
        .map((c) => ({ title: c.name, photos: [c.imageUrl, ...c.images.map((i) => i.imageUrl)].filter(Boolean) as string[] }))
        .filter((c) => c.photos.length > 0)
        .map((c) => ({ title: c.title, leftImageUrl: c.photos[0], rightImageUrl: c.photos[1] ?? c.photos[0] }))
      // One at a time so the slides keep the categories' order (they are sorted by creation time).
      for (const slide of slides) await prisma.butterflySlide.create({ data: slide })
      refreshPublicData("settings")
      return NextResponse.json({ success: true, message: `${slides.length} slides imported`, statusCode: 201, data: { count: slides.length } }, { status: 201 })
    }

    const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : ""
    if (!title || !isUpload(body.leftImageUrl) || !isUpload(body.rightImageUrl))
      return NextResponse.json({ success: false, message: "A title and both images are required", statusCode: 400 }, { status: 400 })

    const slide = await prisma.butterflySlide.create({
      data: { title, leftImageUrl: body.leftImageUrl, rightImageUrl: body.rightImageUrl },
    })
    refreshPublicData("settings")
    return NextResponse.json({ success: true, message: "Slide created", statusCode: 201, data: slide }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create slide", statusCode: 500 }, { status: 500 })
  }
}
