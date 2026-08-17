import { prisma } from "@/lib/db"
import { verifyPassword, hashPassword, createSession, recordFailedLogin, clearFailedLogins } from "@/lib/auth"
import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"
import nodemailer from "nodemailer"

async function sendLockoutEmail(email: string, resetToken: string, origin: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.NODEMAILER_USER, pass: process.env.NODEMAILER_PASS },
  })
  const resetLink = `${origin}/admin/reset-password?token=${resetToken}`
  await transporter.sendMail({
    from: process.env.NODEMAILER_USER,
    to: email,
    subject: "Butterfly Decor Admin — Account Locked",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#0f0b06;margin-bottom:16px;">Account locked after 3 failed login attempts</h2>
        <p style="color:#374151;font-size:14px;line-height:1.5;">
          Someone (hopefully you) failed to sign in to your Butterfly Decor admin panel 3 times in a row.
          Your account is locked until you reset your password.
        </p>
        <p style="margin:24px 0;">
          <a href="${resetLink}" style="background:#2b1807;color:#e8d5b7;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Reset your password</a>
        </p>
        <p style="color:#6b7280;font-size:12px;">This link expires in 60 minutes. If this wasn't you, reset your password anyway to stay safe.</p>
      </div>
    `,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const admin = await prisma.adminUser.findUnique({ where: { email } })

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (admin.lockedAt) {
      return NextResponse.json(
        { error: "Account locked after 3 failed attempts. Check your email for a reset link." },
        { status: 423 }
      )
    }

    if (!verifyPassword(password, admin.password)) {
      const { locked, attemptsRemaining, resetToken } = await recordFailedLogin(admin.id)

      if (locked && resetToken) {
        const origin = req.nextUrl.origin
        try {
          await sendLockoutEmail(admin.email, resetToken, origin)
        } catch (emailError) {
          console.error("Failed to send lockout email:", emailError)
        }
        return NextResponse.json(
          { error: "Account locked after 3 failed attempts. Check your email for a reset link." },
          { status: 423 }
        )
      }

      return NextResponse.json(
        { error: `Invalid credentials. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining before lockout.` },
        { status: 401 }
      )
    }

    await clearFailedLogins(admin.id)

    if (!admin.password.startsWith("scrypt:")) {
      await prisma.adminUser.update({ where: { id: admin.id }, data: { password: hashPassword(password) } })
    }

    const sessionToken = await createSession(admin.id)

    const cookieStore = await cookies()
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
