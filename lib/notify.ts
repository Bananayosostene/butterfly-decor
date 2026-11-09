import { prisma } from "@/lib/db"
import { adminEmails, sendEmail, type Email } from "@/lib/email"

export type NotificationType =
  | "BOOKING" | "ACCOUNT" | "VENDOR" | "LOGIN" | "SECURITY" | "VISIT" | "INQUIRY" | "PLANNING" | "BIRTHDAY" | "EVENT"

type Notice = {
  type: NotificationType
  title: string
  body?: string
  href?: string
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
    await sendEmail({ ...email, to: await adminEmails() })
  }
}

export async function notifyUser(user: { id: string; email?: string | null }, notice: Notice) {
  try {
    await prisma.notification.create({
      data: { audience: "USER", userId: user.id, type: notice.type, title: notice.title, body: notice.body, href: notice.href },
    })
  } catch (error) {
    console.error("Notification not saved:", error)
  }
  if (notice.email && user.email) {
    await sendEmail({ ...notice.email, to: user.email })
  }
}

/** An email only (no dashboard notification), sent immediately. */
export async function emailLater(email: Email) {
  await sendEmail(email)
}
