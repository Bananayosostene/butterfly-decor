import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const idea = await prisma.styleIdea.findUnique({ where: { id } })
    if (!idea) return NextResponse.json({ success: false, message: "Style idea not found", statusCode: 404 }, { status: 404 })
    return NextResponse.json({ success: true, message: "Style idea fetched", statusCode: 200, data: idea })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch style idea", statusCode: 500 }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const idea = await prisma.styleIdea.update({ where: { id }, data: body })
    return NextResponse.json({ success: true, message: "Style idea updated", statusCode: 200, data: idea })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update style idea", statusCode: 500 }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.styleIdea.delete({ where: { id } })
    return NextResponse.json({ success: true, message: "Style idea deleted", statusCode: 200, data: null })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete style idea", statusCode: 500 }, { status: 500 })
  }
}
