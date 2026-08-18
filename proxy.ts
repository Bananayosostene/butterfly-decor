import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSessionAdminId } from "@/lib/auth"

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    const sessionToken = request.cookies.get("admin_session")?.value
    const adminId = await getSessionAdminId(sessionToken)

    if (!adminId) {
      const loginUrl = new URL("/admin/login", request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete("admin_session")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
