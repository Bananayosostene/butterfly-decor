import type { NextRequest } from "next/server"
import { parseUserAgent } from "@/lib/user-agent"

/** The caller's IP address. */
export const ipOf = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "Unknown"

/** City, region and country from the hosting platform's headers (set by Vercel in production). */
export function locationOf(req: NextRequest) {
  const header = (name: string) => {
    const value = req.headers.get(name)
    if (!value) return null
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }
  const code = header("x-vercel-ip-country")
  let country = code
  try {
    if (code) country = new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code
  } catch {}
  return { country, region: header("x-vercel-ip-country-region"), city: header("x-vercel-ip-city") }
}

/** "Chrome on Android", "Safari on iOS", … */
export function deviceOf(userAgent: string) {
  const info = parseUserAgent(userAgent)
  return `${info.browser} on ${info.os}${info.device !== "Desktop" ? ` (${info.device.toLowerCase()})` : ""}`
}
