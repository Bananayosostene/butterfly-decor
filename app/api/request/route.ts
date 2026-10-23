import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { isObjectId } from "@/lib/data"
import { siteUrl } from "@/lib/email"
import { emailLater, notifyAdmin } from "@/lib/notify"
import { getCurrentUser } from "@/lib/user-auth"
import { type NextRequest, NextResponse } from "next/server"

/** Items one booking may hold. */
const MAX_ITEMS = 10000

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message, error: message, statusCode: status }, { status })

/** A visitor books the items they selected. Signed-in customers get their name and email on it. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const phone = typeof body.phone === "string" ? body.phone.trim() : ""
    const eventDate = typeof body.eventDate === "string" ? new Date(body.eventDate) : null
    const selectedItems: string[] = Array.isArray(body.selectedItems)
      ? [...new Set<string>(body.selectedItems.filter((id: unknown) => typeof id === "string" && isObjectId(id)))].slice(0, MAX_ITEMS)
      : []

    if (!/^\+?[\d\s-]{9,16}$/.test(phone)) return fail("Please enter a valid phone number.")
    if (!eventDate || Number.isNaN(eventDate.getTime())) return fail("Please pick an event date.")
    if (!selectedItems.length) return fail("Please select at least one item.")

    const user = await getCurrentUser()
    const booking = await prisma.booking.create({
      data: { phone, eventDate, selectedItems, status: "NEW", userId: user?.id ?? null, name: user?.name ?? null, email: user?.email ?? null },
    })

    const items = await prisma.collectionItem.findMany({ where: { id: { in: selectedItems } }, select: { id: true, name: true } })
    const nameOf = new Map(items.map((i) => [i.id, i.name]))
    const date = eventDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    const who = user?.name ?? phone

    // The WhatsApp message lists the first items; the dashboard always has the full list.
    const shown = selectedItems.slice(0, 30)
    const lines = shown.map((id) => `• ${nameOf.get(id) ?? "Item"}: ${siteUrl(`/collection?item=${id}`)}`)
    if (selectedItems.length > shown.length) lines.push(`…and ${selectedItems.length - shown.length} more items.`)
    const message = `Hello Butterfly Decor, I'd like to book for my event on ${date}.\n\nSelected items (${selectedItems.length}):\n${lines.join("\n")}\n\nPhone: ${phone}`
    const whatsappUrl = `https://wa.me/+250788724867?text=${encodeURIComponent(message)}`

    const firstNames = shown.slice(0, 5).map((id) => nameOf.get(id) ?? "Item").join(", ")
    await notifyAdmin({
      type: "BOOKING",
      title: `New booking from ${who}`,
      body: `${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"} for ${date}: ${firstNames}${selectedItems.length > 5 ? "…" : ""}`,
      href: `/account/bookings/${booking.id}`,
      email: {
        subject: `New booking for ${date}`,
        greeting: "Hello,",
        paragraphs: [
          `${who} has just booked ${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"} for an event on ${date}. Phone: ${phone}${user?.email ? `, email: ${user.email}` : ""}.`,
          `Items: ${firstNames}${selectedItems.length > 5 ? ` and ${selectedItems.length - 5} more` : ""}.`,
        ],
        action: { label: "Open the booking", href: siteUrl(`/account/bookings/${booking.id}`) },
      },
    })
    if (user?.email) {
      emailLater({
        to: user.email,
        subject: "We received your booking",
        greeting: `Hello ${user.name},`,
        paragraphs: [
          `Thank you for choosing Butterfly Decor. We received your booking of ${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"} for your event on ${date}.`,
          `We will call you on ${phone} to confirm availability and the next steps. You can also follow your booking on your profile page.`,
        ],
        action: { label: "See your bookings", href: siteUrl("/profile") },
      })
    }

    return NextResponse.json({ booking: { id: booking.id }, whatsappUrl }, { status: 201 })
  } catch (error) {
    console.error("Booking error:", error)
    return fail("Failed to create booking", 500)
  }
}

/** All bookings, for the admin only (they contain customers' phone numbers). */
export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) return fail("Unauthorized", 401)
    const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 500 })
    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Fetch error:", error)
    return fail("Failed to fetch bookings", 500)
  }
}
