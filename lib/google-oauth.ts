import type { NextRequest } from "next/server"

export const GOOGLE_STATE_COOKIE = "google_oauth_state"

const DEFAULT_CALLBACK_PATH = "/users/google/callback"

/**
 * Where Google sends the visitor back to. It must exactly match an "Authorized redirect URI" of
 * the OAuth client in Google Cloud Console.
 *
 * Always built from the site the visitor is on, so the same code works on localhost and on the
 * live domain. CALLBACK_URL may be a path ("/users/google/callback") or a full URL; only its
 * path is used.
 */
export function googleRedirectUri(req: NextRequest) {
  const configured = process.env.CALLBACK_URL?.trim() || DEFAULT_CALLBACK_PATH
  let path = configured
  if (/^https?:\/\//i.test(configured)) {
    try {
      path = new URL(configured).pathname
    } catch {
      path = DEFAULT_CALLBACK_PATH
    }
  }
  return `${req.nextUrl.origin}${path.startsWith("/") ? path : `/${path}`}`
}
