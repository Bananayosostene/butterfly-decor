import { prisma } from "@/lib/db"
import { homeFor } from "@/lib/account-paths"
import { GOOGLE_STATE_COOKIE, googleRedirectUri } from "@/lib/google-oauth"
import { startUserSession } from "@/lib/user-auth"
import { type NextRequest, NextResponse } from "next/server"

/** Google sends the visitor back here after they approve sign-in. */
export async function GET(req: NextRequest) {
  const failed = NextResponse.redirect(new URL("/login?error=google", req.url))
  try {
    const code = req.nextUrl.searchParams.get("code")
    const state = req.nextUrl.searchParams.get("state")
    if (!code || !state || state !== req.cookies.get(GOOGLE_STATE_COOKIE)?.value) return failed

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.CLIENT_ID ?? "",
        client_secret: process.env.CLIENT_SECRET ?? "",
        redirect_uri: googleRedirectUri(req),
        grant_type: "authorization_code",
      }),
    })
    const { access_token } = await tokenRes.json()
    if (!tokenRes.ok || !access_token) return failed

    const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const profile = await profileRes.json()
    // Only a Google-verified email may claim (or link to) an account with that address.
    if (!profileRes.ok || !profile.email || !profile.email_verified) return failed

    const email = String(profile.email).toLowerCase()
    let user = await prisma.user.findUnique({ where: { email }, select: { id: true, googleId: true, role: true } })
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: profile.name || email.split("@")[0], googleId: profile.sub },
        select: { id: true, googleId: true, role: true },
      })
    } else if (!user.googleId) {
      // The address was registered with a password but never proven. Google has now proven who owns
      // it, so drop the old password and sessions in case someone else created that account first.
      await prisma.userSession.deleteMany({ where: { userId: user.id } })
      await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.sub, password: null } })
    }
    await startUserSession(user.id)

    const res = NextResponse.redirect(new URL(homeFor(user.role), req.url))
    res.cookies.delete(GOOGLE_STATE_COOKIE)
    return res
  } catch {
    return failed
  }
}
