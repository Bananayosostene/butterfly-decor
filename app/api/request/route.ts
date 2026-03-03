import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const booking = await prisma.booking.create({
      data: {
        fullName: body.fullName,
        phone: body.phone,
        eventType: body.eventType,
        eventDate: new Date(body.eventDate),
        eventLocation: body.eventLocation,
        preferredColors: body.preferredColors || null,
        notes: body.notes || null,
        status: "NEW",
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
