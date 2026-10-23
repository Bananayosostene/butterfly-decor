import { prisma } from "@/lib/db"
import { isObjectId } from "@/lib/data"
import { siteUrl } from "@/lib/email"
import { notifyAdmin, notifyUser } from "@/lib/notify"
import { getCurrentUser } from "@/lib/user-auth"
import { type NextRequest, NextResponse } from "next/server"

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "")

/**
 * A visitor writes to a vendor from the vendor's page. The message is kept (so the business sees
 * every lead it brings), the vendor is told by email, and the admin sees it in the dashboard.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const vendorId = typeof body.vendorId === "string" && isObjectId(body.vendorId) ? body.vendorId : null
    const name = text(body.name, 60)
    const message = text(body.message, 600)
    if (!vendorId || !name || !message) return NextResponse.json({ success: false, message: "Missing details", statusCode: 400 }, { status: 400 })

    const vendor = await prisma.user.findFirst({ where: { id: vendorId, role: "VENDOR" }, select: { id: true, name: true, email: true, businessName: true } })
    if (!vendor) return NextResponse.json({ success: false, message: "Vendor not found", statusCode: 404 }, { status: 404 })

    const user = await getCurrentUser()
    const eventDate = typeof body.eventDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.eventDate) ? body.eventDate : null
    const phone = text(body.phone, 20) || null
    await prisma.inquiry.create({ data: { vendorId, userId: user?.id ?? null, name, phone, eventDate, message } })

    const business = vendor.businessName ?? vendor.name
    const when = eventDate ? ` for ${eventDate.split("-").reverse().join("/")}` : ""
    await notifyUser(vendor, {
      type: "INQUIRY",
      title: `New message from ${name}`,
      body: `${message.slice(0, 140)}${when ? ` (event${when})` : ""}`,
      href: "/account/my-inquiries",
      email: {
        subject: `New message from ${name} on Butterfly Decor`,
        greeting: `Hello ${vendor.name},`,
        paragraphs: [
          `${name} found ${business} on Butterfly Decor and wrote to you${when}:`,
          `"${message}"`,
          phone ? `You can reach them on ${phone}.` : "They were sent to your WhatsApp to continue the conversation.",
        ],
        action: { label: "See your messages", href: siteUrl("/account/my-inquiries") },
      },
    })
    await notifyAdmin({ type: "INQUIRY", title: `${name} wrote to ${business}`, body: message.slice(0, 140), href: "/account/vendors" })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Inquiry error:", error)
    return NextResponse.json({ success: false, message: "Failed to send", statusCode: 500 }, { status: 500 })
  }
}
