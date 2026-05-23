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

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://butterfly-decor.vercel.app";

    let itemsText = "";
    if (selectedItems.length) {
      const items = await prisma.collectionItem.findMany({
        where: { id: { in: selectedItems } },
        select: { id: true, name: true },
      });
      const lines = selectedItems.map((id: string) => {
        const item = items.find((i) => i.id === id);
        const name = item?.name ?? "Item";
        return `• ${name}: ${BASE_URL}/collection/${id}`;
      });
      itemsText = `\n\nSelected items:\n${lines.join("\n")}`;
    }

    const message = `Hello Butterfly Decor, I'd like to book for my event on ${eventDate}.${itemsText}\n\nPhone: ${phone}`;
    const whatsappUrl = `https://wa.me/+250788724867?text=${encodeURIComponent(message)}`;

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
