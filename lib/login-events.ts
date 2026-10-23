import type { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { siteUrl } from "@/lib/email"
import { emailLater, notifyAdmin } from "@/lib/notify"
import { deviceOf, ipOf, locationOf } from "@/lib/request-info"

/**
 * Keeps a record of every sign-in attempt and warns when an account is opened from a device it
 * has never used before: the admin gets a dashboard notification and an email; a client or vendor
 * gets an email. A failed admin sign-in is shown to the admin too.
 */
export async function recordLogin(
  req: NextRequest,
  attempt: { who: "ADMIN" | "USER"; userId?: string | null; email: string; name?: string | null; method: "PASSWORD" | "GOOGLE"; success: boolean },
) {
  try {
    const userAgent = (req.headers.get("user-agent") || "").slice(0, 400)
    const device = deviceOf(userAgent)
    const { city, country } = locationOf(req)
    const ip = ipOf(req)
    const place = [city, country].filter(Boolean).join(", ") || "an unknown place"
    const when = new Date().toLocaleString("en-GB", { timeZone: "Africa/Kigali", dateStyle: "medium", timeStyle: "short" })

    // A device is new when this account has signed in before, but never from this browser.
    const earlier = attempt.success
      ? await prisma.loginEvent.findMany({ where: { email: attempt.email, success: true }, select: { userAgent: true }, take: 200, orderBy: { createdAt: "desc" } })
      : []
    const newDevice = earlier.length > 0 && !earlier.some((e) => e.userAgent === userAgent)

    await prisma.loginEvent.create({
      data: { who: attempt.who, userId: attempt.userId ?? null, email: attempt.email, method: attempt.method, success: attempt.success, ip, userAgent, device, city, country },
    })

    if (attempt.who === "ADMIN" && !attempt.success) {
      await notifyAdmin({
        type: "SECURITY",
        title: "Failed admin sign-in",
        body: `Someone tried to sign in as ${attempt.email} with a wrong password, from ${device} in ${place} (IP ${ip}).`,
        href: "/account/security",
      })
      return
    }
    if (!attempt.success || !newDevice) return

    const how = attempt.method === "GOOGLE" ? "with Google" : "with a password"
    if (attempt.who === "ADMIN") {
      await notifyAdmin({
        type: "SECURITY",
        title: "Admin signed in from a new device",
        body: `${device} in ${place}, ${how}, on ${when}.`,
        href: "/account/security",
        email: {
          subject: "New sign-in to the Butterfly Decor dashboard",
          greeting: "Hello,",
          paragraphs: [
            `The admin account was just opened from a device it has not used before: ${device} in ${place} (IP ${ip}), ${how}, on ${when} (Kigali time).`,
            "If this was you, there is nothing to do. If it was not, change the admin password straight away.",
          ],
          action: { label: "See all sign-ins", href: siteUrl("/account/security") },
        },
      })
    } else {
      emailLater({
        to: attempt.email,
        subject: "New sign-in to your Butterfly Decor account",
        greeting: `Hello ${attempt.name || "there"},`,
        paragraphs: [
          `Your account was just opened from a new device: ${device} in ${place}, ${how}, on ${when} (Kigali time).`,
          "If this was you, you can ignore this message. If it was not, reply to this email and we will help you secure your account.",
        ],
      })
    }
  } catch (error) {
    console.error("Sign-in not recorded:", error)
  }
}
