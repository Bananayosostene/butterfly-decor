import type { NextRequest } from "next/server"

export const GOOGLE_STATE_COOKIE = "google_oauth_state"

/** Must exactly match an "Authorized redirect URI" of the OAuth client in Google Cloud Console. */
export function googleRedirectUri(req: NextRequest) {
  return `${req.nextUrl.origin}${process.env.CALLBACK_URL ?? "/users/google/callback"}`
}
