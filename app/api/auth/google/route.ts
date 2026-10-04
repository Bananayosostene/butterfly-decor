import { randomBytes } from "crypto"
import { GOOGLE_STATE_COOKIE, googleRedirectUri } from "@/lib/google-oauth"
import { type NextRequest, NextResponse } from "next/server"

/** Sends the visitor to Google's sign-in screen. */
export async function GET(req: NextRequest) {
  if (!process.env.CLIENT_ID) return NextResponse.redirect(new URL("/login?error=google", req.url))

  const state = randomBytes(16).toString("hex")
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.search = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: googleRedirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString()

  const res = NextResponse.redirect(url)
  res.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  })
  return res
}
