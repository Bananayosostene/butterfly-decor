import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { VENDOR_DASHBOARD_PATHS } from "@/lib/account-paths"
import { getSessionAdminId } from "@/lib/auth"
import { ACCOUNT_HINT_COOKIE, encodeAccountHint } from "@/lib/account-hint"
import { ACCOUNT_HINT_OPTIONS, adminHintFor, getDashboardUser } from "@/lib/user-auth"

/** True when the header's account cookie already says "admin". */
function hintIsAdmin(raw: string | undefined) {
  if (!raw) return false
  try {
    return JSON.parse(raw.trim().startsWith("{") ? raw : decodeURIComponent(raw))?.kind === "ADMIN"
  } catch {
    return false
  }
}

/** Pages under /account that are not part of the dashboard and need no dashboard session. */
const OPEN_ACCOUNT_PATHS = ["/account/welcome", "/account/forgot-password", "/account/reset-password"]

/**
 * Guards the dashboard. The site admin may open everything under /account; a vendor only their
 * own pages; anyone else is sent to the one sign-in page, /login.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith("/account") || OPEN_ACCOUNT_PATHS.includes(pathname)) return NextResponse.next()

  const me = await getDashboardUser(request)
  if (me?.role === "ADMIN") {
    const response = NextResponse.next()
    // The header reads a small display cookie to show the profile button. If the admin is signed
    // in but that cookie is missing or belongs to another account, write it again.
    if (!hintIsAdmin(request.cookies.get(ACCOUNT_HINT_COOKIE)?.value)) {
      const adminId = await getSessionAdminId(request.cookies.get("admin_session")?.value)
      const hint = adminId ? await adminHintFor(adminId) : null
      if (hint) response.cookies.set(ACCOUNT_HINT_COOKIE, encodeAccountHint(hint), ACCOUNT_HINT_OPTIONS)
    }
    return response
  }

  if (me?.role === "VENDOR") {
    const allowed = VENDOR_DASHBOARD_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
    const response = allowed ? NextResponse.next() : NextResponse.redirect(new URL(VENDOR_DASHBOARD_PATHS[0], request.url))
    // A leftover (expired) admin cookie would make the dashboard show the admin menu.
    response.cookies.delete("admin_session")
    return response
  }

  const response = NextResponse.redirect(new URL("/login", request.url))
  response.cookies.delete("admin_session")
  return response
}

export const config = {
  matcher: ["/account/:path*"],
}
