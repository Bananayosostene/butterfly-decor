import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { isObjectId } from "@/lib/data"
import { siteUrl } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"

const cell = (value: string) => `"${value.replace(/"/g, '""')}"`

/** Every item of one booking as a CSV file (opens in Excel), for the admin. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const booking = isObjectId(id) ? await prisma.booking.findUnique({ where: { id }, select: { selectedItems: true, phone: true, eventDate: true } }) : null
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  const items = await prisma.collectionItem.findMany({
    where: { id: { in: booking.selectedItems } },
    orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: { select: { name: true } } },
  })
  const rows = [
    ["No", "Item", "Category", "Link"],
    ...items.map((item, i) => [String(i + 1), item.name, item.category.name.trim(), siteUrl(`/collection?item=${item.id}`)]),
  ]
  // The byte-order mark makes Excel read the accents correctly.
  const csv = "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n")
  const day = booking.eventDate.toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="booking-${day}-${booking.phone.replace(/[^\d]/g, "")}.csv"`,
    },
  })
}
