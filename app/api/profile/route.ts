import { prisma } from "@/lib/db"
import { cleanBirthday } from "@/lib/birthday"
import { getCurrentUser, setAccountHint } from "@/lib/user-auth"
import { type NextRequest, NextResponse } from "next/server"

const fail = (message: string, status = 400) => NextResponse.json({ success: false, message, statusCode: status }, { status })

/** A signed-in client or vendor updates their own details: name, phone, birthday, news emails. */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return fail("Please sign in.", 401)
    const body = await req.json().catch(() => ({}))

    const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : undefined
    if (name !== undefined && !name) return fail("Please enter your name.")
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined
    if (phone && !/^\+?[\d\s-]{9,16}$/.test(phone)) return fail("Please enter a valid phone number.")
    const birthday = cleanBirthday(body.birthday)
    if (body.birthday && birthday === undefined) return fail("Please choose a real date for your birthday.")

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone: phone === undefined ? undefined : phone || null,
        birthday,
        emailOptOut: typeof body.emailUpdates === "boolean" ? !body.emailUpdates : undefined,
      },
    })
    if (name && name !== user.name && user.role !== "VENDOR")
      await setAccountHint({ name, email: user.email, kind: user.role === "CLIENT" ? "CLIENT" : "NEW", avatarUrl: user.avatarUrl })
    return NextResponse.json({ success: true, message: "Saved", statusCode: 200 })
  } catch {
    return fail("Could not save. Please try again.", 500)
  }
}
