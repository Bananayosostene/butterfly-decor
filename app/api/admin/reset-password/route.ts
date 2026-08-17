import { prisma } from "@/lib/db"
import { hashPassword, createSession } from "@/lib/auth"
import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password || password.length < 8) {
      return NextResponse.json(
        { success: false, message: "A reset token and a password of at least 8 characters are required." },
        { status: 400 }
      )
    }

    const admin = await prisma.adminUser.findFirst({ where: { resetToken: token } })

    if (!admin || !admin.resetTokenExpiry || admin.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { success: false, message: "This reset link is invalid or has expired." },
        { status: 400 }
      )
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        password: hashPassword(password),
        failedAttempts: 0,
        lockedAt: null,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    const sessionToken = await createSession(admin.id)
    const cookieStore = await cookies()
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return NextResponse.json({ success: true, message: "Password updated." })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 })
  }
}
