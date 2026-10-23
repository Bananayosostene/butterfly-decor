import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { isObjectId } from "@/lib/data"
import { siteUrl } from "@/lib/email"
import { notifyUser } from "@/lib/notify"
import { refreshVendors } from "@/lib/vendors"
import { type NextRequest, NextResponse } from "next/server"

const STATUSES = ["APPROVED", "PENDING", "SUSPENDED"]

/** The admin approves, suspends or reopens a vendor. Approved vendors are shown to couples. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req)))
      return NextResponse.json({ success: false, message: "Unauthorized", statusCode: 401 }, { status: 401 })
    const { id } = await params
    const { status } = await req.json().catch(() => ({}))
    if (!isObjectId(id) || !STATUSES.includes(status))
      return NextResponse.json({ success: false, message: "Unknown vendor or status", statusCode: 400 }, { status: 400 })

    const vendor = await prisma.user.update({
      where: { id },
      data: { vendorStatus: status },
      select: { id: true, name: true, email: true, businessName: true },
    })
    refreshVendors()

    if (status === "APPROVED") {
      await notifyUser(vendor, {
        type: "VENDOR",
        title: "Your page is live",
        body: "Couples can now find you on Butterfly Decor.",
        href: "/account/my-gallery",
        email: {
          subject: "Your Butterfly Decor page is live",
          greeting: `Hello ${vendor.name},`,
          paragraphs: [
            `Good news: we approved ${vendor.businessName ?? "your business"}. Your page is now visible to couples planning their wedding on Butterfly Decor.`,
            "Pages with many good photos and a clear description get the most messages, so keep your gallery fresh.",
          ],
          action: { label: "See your page", href: siteUrl(`/vendors/${vendor.id}`) },
        },
      })
    } else if (status === "SUSPENDED") {
      await notifyUser(vendor, {
        type: "VENDOR",
        title: "Your page is hidden for now",
        body: "Please contact Butterfly Decor to know more.",
        email: {
          subject: "Your Butterfly Decor page is hidden",
          greeting: `Hello ${vendor.name},`,
          paragraphs: ["Your vendor page is hidden from couples for now. Please reply to this email or call us, and we will tell you what is needed to show it again."],
        },
      })
    }
    return NextResponse.json({ success: true, message: "Vendor updated", statusCode: 200 })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update the vendor", statusCode: 500 }, { status: 500 })
  }
}
