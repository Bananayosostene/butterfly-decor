import { after } from "next/server"
import { prisma } from "@/lib/db"
import { adminEmails, sendEmail, type Email } from "@/lib/email"

/**
 * Tells the admin, or one site account, that something happened: a notification under the bell
 * in the dashboard and, when `email` is given, an email too. Emails go out after the response,
 * so the person who caused the event is not kept waiting.
 */

export type NotificationType =
  | "BOOKING" | "ACCOUNT" | "VENDOR" | "LOGIN" | "SECURITY" | "VISIT" | "INQUIRY" | "PLANNING" | "BIRTHDAY" | "EVENT"

type Notice = {
  type: NotificationType
  title: string
  body?: string
  href?: string
  /** Also email it; the admin's addresses are filled in for admin notices. */
  email?: Omit<Email, "to">
}

export async function notifyAdmin(notice: Notice) {
  try {
    await prisma.notification.create({
      data: { audience: "ADMIN", type: notice.type, title: notice.title, body: notice.body, href: notice.href },
    })
  } catch (error) {
    console.error("Notification not saved:", error)
  }
  if (notice.email) {
    const email = notice.email
    after(async () => sendEmail({ ...email, to: await adminEmails() }))
  }
}

/** A notification for one site account (shown in a vendor's dashboard), and optionally an email. */
export async function notifyUser(user: { id: string; email?: string | null }, notice: Notice) {
  try {
    await prisma.notification.create({
      data: { audience: "USER", userId: user.id, type: notice.type, title: notice.title, body: notice.body, href: notice.href },
    })
  } catch (error) {
    console.error("Notification not saved:", error)
  }
  if (notice.email && user.email) {
    const email = notice.email
    const to = user.email
    after(() => sendEmail({ ...email, to }))
  }
}

/** An email only (no dashboard notification), sent after the response. */
export function emailLater(email: Email) {
  after(() => sendEmail(email))
}
