import { prisma } from "@/lib/db"
import { createPasswordResetToken } from "@/lib/auth"
import { NextResponse, type NextRequest } from "next/server"
import nodemailer from "nodemailer"

async function sendResetEmail(email: string, resetToken: string, origin: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.NODEMAILER_USER, pass: process.env.NODEMAILER_PASS },
  })
  const resetLink = `${origin}/admin/reset-password?token=${resetToken}`
  await transporter.sendMail({
    from: process.env.NODEMAILER_USER,
    to: email,
    subject: "Butterfly Decor Admin — Password Reset",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#0f0b06;margin-bottom:16px;">Reset your admin password</h2>
        <p style="color:#374151;font-size:14px;line-height:1.5;">
          We received a request to reset the password for your Butterfly Decor admin account.
        </p>
        <p style="margin:24px 0;">
          <a href="${resetLink}" style="background:#2b1807;color:#e8d5b7;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Reset your password</a>
        </p>
        <p style="color:#6b7280;font-size:12px;">This link expires in 60 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    const genericResponse = NextResponse.json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    })

    if (!email) return genericResponse

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin) return genericResponse

    const resetToken = await createPasswordResetToken(admin.id)
    try {
      await sendResetEmail(admin.email, resetToken, req.nextUrl.origin)
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError)
    }

    return genericResponse
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 })
  }
}
