import { prisma } from "@/lib/db"
import { homeFor } from "@/lib/account-paths"
import { GOOGLE_STATE_COOKIE, googleRedirectUri } from "@/lib/google-oauth"
import { startAdminSession } from "@/lib/admin-login"
import { adminHintFor, endUserSession, setAccountHint, startUserSession } from "@/lib/user-auth"
import { type NextRequest, NextResponse } from "next/server"

/** Google sends the visitor back here after they approve sign-in. */
export async function GET(req: NextRequest) {
  // The visitor only sees "did not complete"; the reason goes to the server log.
  const fail = (reason: string, detail?: unknown) => {
    console.error("Google sign-in failed:", reason, detail ?? "")
    return NextResponse.redirect(new URL("/login?error=google", req.url))
  }
  try {
    const code = req.nextUrl.searchParams.get("code")
    const state = req.nextUrl.searchParams.get("state")
    if (!code || !state || state !== req.cookies.get(GOOGLE_STATE_COOKIE)?.value)
      return fail("missing code or state mismatch", req.nextUrl.searchParams.get("error"))

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
    const token = await tokenRes.json()
    const access_token = token.access_token
    // "invalid_client" here means CLIENT_SECRET does not belong to CLIENT_ID.
    if (!tokenRes.ok || !access_token) return fail("token exchange rejected", token.error_description ?? token.error)

    const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const profile = await profileRes.json()
    // Only a Google-verified email may claim (or link to) an account with that address.
    if (!profileRes.ok || !profile.email || !profile.email_verified) return fail("no verified email in Google profile")

    const email = String(profile.email).toLowerCase()
    // Google's profile photo; only its own image host is accepted.
    const avatarUrl =
      typeof profile.picture === "string" && /^https:\/\/[a-z0-9-]+\.googleusercontent\.com\//i.test(profile.picture)
        ? profile.picture
        : null

    // The admin signs in with Google too: Google has verified that this person owns the admin's
    // email address. As with the password sign-in, admin accounts are checked first.
    const admin = await prisma.adminUser.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } })
    if (admin) {
      // Keep the photo current on the site account with the same email, where the header reads it.
      if (avatarUrl) await prisma.user.updateMany({ where: { email }, data: { avatarUrl } })
      // One identity at a time: leave any client/vendor session behind.
      await endUserSession()
      await startAdminSession(admin.id)
      const hint = await adminHintFor(admin.id, { name: profile.name, avatarUrl })
      if (hint) await setAccountHint(hint)
      const res = NextResponse.redirect(new URL("/account", req.url))
      res.cookies.delete(GOOGLE_STATE_COOKIE)
      return res
    }

    let user = await prisma.user.findUnique({ where: { email }, select: { id: true, googleId: true, role: true } })
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: profile.name || email.split("@")[0], googleId: profile.sub, avatarUrl },
        select: { id: true, googleId: true, role: true },
      })
    } else if (!user.googleId) {
      // The address was registered with a password but never proven. Google has now proven who owns
      // it, so drop the old password and sessions in case someone else created that account first.
      await prisma.userSession.deleteMany({ where: { userId: user.id } })
      await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.sub, password: null, avatarUrl } })
    } else if (avatarUrl) {
      // Keep the photo current for returning Google users (and add it for older accounts).
      await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } })
    }
    await startUserSession(user.id)

    const res = NextResponse.redirect(new URL(homeFor(user.role), req.url))
    res.cookies.delete(GOOGLE_STATE_COOKIE)
    // One identity at a time: a client or vendor signing in ends any admin session in this browser.
    res.cookies.delete("admin_session")
    return res
  } catch (error) {
    return fail("unexpected error", error)
  }
}
