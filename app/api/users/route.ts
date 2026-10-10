import { prisma } from "@/lib/db"
import { hashPassword, requireAdmin } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

const fail = (message: string, status = 400) =>
  NextResponse.json({ success: false, message, statusCode: status }, { status })

/** The admin creates a client account for someone. Vendors sign up themselves. */
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) return fail("Unauthorized", 401)

    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const phone = typeof body.phone === "string" ? body.phone.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!name || name.length > 60) return fail("Please enter the name.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return fail("Please enter a valid email address.")
    if (phone && !/^\+?[\d\s-]{9,16}$/.test(phone)) return fail("Please enter a valid phone number, or leave it empty.")
    if (password.length < 8 || password.length > 100) return fail("Password must be at least 8 characters.")

    // The admin's address is taken too: sign-in checks admin accounts first.
    const taken =
      (await prisma.user.findUnique({ where: { email }, select: { id: true } })) ||
      (await prisma.adminUser.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } }))
    if (taken) return fail("An account with this email already exists.", 409)

    await prisma.user.create({
      data: { name, email, phone: phone || null, password: hashPassword(password), role: "CLIENT" },
    })
    return NextResponse.json({ success: true, message: "Client created", statusCode: 201, data: null }, { status: 201 })
  } catch {
    return fail("Could not create the client. Please try again.", 500)
  }
}
