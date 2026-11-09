import { prisma } from "@/lib/db"
import { homeFor } from "@/lib/account-paths"
import { isObjectId } from "@/lib/data"
import { getCurrentUser, setAccountHint } from "@/lib/user-auth"
import { refreshVendors } from "@/lib/vendors"
import { vendorSignedUp } from "@/lib/account-events"
import { cleanBirthday } from "@/lib/birthday"
import { type NextRequest, NextResponse } from "next/server"

const fail = (message: string, status = 400) =>
  NextResponse.json({ success: false, message, statusCode: status }, { status })

/** Answers "Are you a vendor?" once, right after sign-up: sets the account's role. */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return fail("Please sign in.", 401)
    if (user.role) return fail("Your account type is already set.", 409)

    const body = await req.json().catch(() => ({}))
    // Required; a date that is not real is rejected.
    const birthday = cleanBirthday(body.birthday)
    if (!birthday) return fail("Please enter your birthday.")
    if (!body.vendor) {
      await prisma.user.update({ where: { id: user.id }, data: { role: "CLIENT", birthday } })
      await setAccountHint({ name: user.name, email: user.email, kind: "CLIENT", avatarUrl: user.avatarUrl })
      return NextResponse.json({ success: true, message: "Saved", statusCode: 200, data: { next: homeFor("CLIENT") } })
    }

    const businessName = typeof body.businessName === "string" ? body.businessName.trim() : ""
    const categoryId = typeof body.vendorCategoryId === "string" ? body.vendorCategoryId : ""
    if (!businessName || businessName.length > 80) return fail("Please enter your business name.")
    if (!isObjectId(categoryId) || !(await prisma.vendorCategory.findUnique({ where: { id: categoryId }, select: { id: true } })))
      return fail("Please choose your vendor category.")

    const about = typeof body.about === "string" ? body.about.trim().slice(0, 2000) : ""
    if (!about) return fail("Please tell couples about your business.")
    const location = typeof body.location === "string" ? body.location.trim().slice(0, 80) : ""

    await prisma.user.update({
      where: { id: user.id },
      // New vendors appear on the public pages once the admin has approved them.
      data: { role: "VENDOR", businessName, vendorCategoryId: categoryId, about, location: location || null, vendorStatus: "PENDING", birthday },
    })
    await vendorSignedUp({ id: user.id, name: user.name, email: user.email, businessName })
    await setAccountHint({ name: businessName, email: user.email, kind: "VENDOR", avatarUrl: user.avatarUrl })
    refreshVendors()
    return NextResponse.json({ success: true, message: "Saved", statusCode: 200, data: { next: homeFor("VENDOR") } })
  } catch {
    return fail("Could not save. Please try again.", 500)
  }
}
