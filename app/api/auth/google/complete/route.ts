import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { homeFor } from "@/lib/account-paths"
import { startUserSession } from "@/lib/user-auth"
import { welcomeNewAccount } from "@/lib/account-events"
import { recordLogin } from "@/lib/login-events"

const fail = (message: string, status = 400) =>
  NextResponse.json({ success: false, message, statusCode: status }, { status })

export async function POST(req: NextRequest) {
  try {
    const store = await cookies()
    const raw = store.get("google_pending")?.value
    if (!raw) return fail("Session expired. Please sign in with Google again.", 400)

    let pending: { email: string; name: string; sub: string; avatarUrl: string | null }
    try {
      pending = JSON.parse(raw)
    } catch {
      return fail("Invalid session. Please sign in with Google again.", 400)
    }

    const body = await req.json().catch(() => ({}))
    const phone = typeof body.phone === "string" ? body.phone.trim() : ""
    if (!/^\+?[\d\s-]{9,16}$/.test(phone)) return fail("Please enter a valid phone number.")

    const { email, name, sub, avatarUrl } = pending

    const taken =
      (await prisma.user.findUnique({ where: { email }, select: { id: true } })) ||
      (await prisma.adminUser.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } }))
    if (taken) return fail("An account with this email already exists. Please sign in instead.", 409)

    const user = await prisma.user.create({
      data: { email, name, phone, googleId: sub, avatarUrl },
      select: { id: true, name: true, role: true },
    })

    store.delete("google_pending")
    await startUserSession(user.id)
    await welcomeNewAccount({ id: user.id, name: user.name, email, method: "Google" })
    await recordLogin(req, { who: "USER", userId: user.id, email, name: user.name, method: "GOOGLE", success: true })

    return NextResponse.json({ success: true, data: { next: homeFor(user.role) } }, { status: 201 })
  } catch {
    return fail("Could not create your account. Please try again.", 500)
  }
}
