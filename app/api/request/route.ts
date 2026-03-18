import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { phone, eventDate, selectedItems = [] } = await req.json()

    const booking = await prisma.booking.create({
      data: {
        phone,
        eventDate: new Date(eventDate),
        selectedItems,
        status: "NEW",
      },
    })

    const itemsText = selectedItems.length
      ? `\nSelected items: ${selectedItems.join(", ")}`
      : ""
    const message = `Hello Butterfly Decor, I'd like to book for my event on ${eventDate}.${itemsText}\nPhone: ${phone}`
    const whatsappUrl = `https://wa.me/+250788724867?text=${encodeURIComponent(message)}`

    return NextResponse.json({ booking, whatsappUrl }, { status: 201 })
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
