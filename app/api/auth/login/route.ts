import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { loginAdmin } from "@/lib/admin-login"
import { homeFor } from "@/lib/account-paths"
import { endUserSession, startUserSession } from "@/lib/user-auth"
import { type NextRequest, NextResponse } from "next/server"

/** The one sign-in for everyone: the site admin, vendors and clients. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""
    if (!email || !password)
      return NextResponse.json({ success: false, message: "Wrong email or password.", statusCode: 401 }, { status: 401 })

    // Admin accounts are checked first (they keep their lock-after-3-attempts rule).
    // An admin email saved with capital letters is matched as typed.
    const typedEmail = String(body.email).trim()
    const admin =
      (await loginAdmin(email, password, req.nextUrl.origin)) ??
      (typedEmail !== email ? await loginAdmin(typedEmail, password, req.nextUrl.origin) : null)
    if (admin) {
      if (!admin.ok)
        return NextResponse.json({ success: false, message: admin.message, statusCode: admin.status }, { status: admin.status })
      // One identity at a time: leave any client/vendor session behind.
      await endUserSession()
      return NextResponse.json({ success: true, message: "Signed in", statusCode: 200, data: { next: "/account" } })
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true, role: true } })
    // Accounts created with Google have no password; the same message is used for every failure.
    if (!user?.password || !verifyPassword(password, user.password))
      return NextResponse.json({ success: false, message: "Wrong email or password.", statusCode: 401 }, { status: 401 })

    await startUserSession(user.id)
    ;(await cookies()).delete("admin_session")
    return NextResponse.json({ success: true, message: "Signed in", statusCode: 200, data: { next: homeFor(user.role) } })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Could not sign you in. Please try again.", statusCode: 500 }, { status: 500 })
  }
}
