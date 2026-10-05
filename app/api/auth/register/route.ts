import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { homeFor } from "@/lib/account-paths"
import { startUserSession } from "@/lib/user-auth"
import { type NextRequest, NextResponse } from "next/server"

const fail = (message: string, status = 400) =>
  NextResponse.json({ success: false, message, statusCode: status }, { status })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const phone = typeof body.phone === "string" ? body.phone.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!name || name.length > 60) return fail("Please enter your name.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return fail("Please enter a valid email address.")
    if (!/^\+?[\d\s-]{9,16}$/.test(phone)) return fail("Please enter a valid phone number.")
    if (password.length < 8 || password.length > 100) return fail("Password must be at least 8 characters.")

    // The admin's address is taken too: sign-in checks admin accounts first.
    const taken =
      (await prisma.user.findUnique({ where: { email }, select: { id: true } })) ||
      (await prisma.adminUser.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } }))
    if (taken)
      return fail("An account with this email already exists. Please sign in instead.", 409)

    const user = await prisma.user.create({
      data: { name, email, phone, password: hashPassword(password) },
      select: { id: true },
    })
    await startUserSession(user.id)
    return NextResponse.json({ success: true, message: "Account created", statusCode: 201, data: { next: homeFor(null) } }, { status: 201 })
  } catch {
    return fail("Could not create your account. Please try again.", 500)
  }
}
