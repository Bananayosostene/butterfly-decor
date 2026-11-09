import nodemailer, { type Transporter } from "nodemailer"
import { prisma } from "@/lib/db"
import { BUSINESS } from "@/lib/business"

/**
 * Plain, personal emails from Butterfly Decor: a greeting, a few short paragraphs, at most one
 * link, and a sign-off. No pictures or emojis, so they read like a message from a person.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.butterflydec.com"
export const siteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`

export type Email = {
  to: string | string[]
  subject: string
  /** e.g. "Hello Aline," */
  greeting?: string
  paragraphs: string[]
  action?: { label: string; href: string }
  /** A last line, e.g. how to stop news emails. */
  note?: string
}

let transporter: Transporter | null = null
const transport = () =>
  (transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.NODEMAILER_USER, pass: process.env.NODEMAILER_PASS },
  }))

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** Sends one email. Failures are logged and never break the page that triggered them. */
export async function sendEmail(email: Email) {
  if (!process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASS) return
  const to = Array.isArray(email.to) ? email.to.filter(Boolean) : email.to
  if (!to || (Array.isArray(to) && !to.length)) return

  const signOff = [`Warm regards,`, `The ${BUSINESS.name} team`, `${BUSINESS.phone} · ${SITE_URL.replace(/^https?:\/\//, "")}`]
  const text = [
    email.greeting,
    ...email.paragraphs,
    email.action && `${email.action.label}: ${email.action.href}`,
    signOff.join("\n"),
    email.note,
  ]
    .filter(Boolean)
    .join("\n\n")

  const p = (content: string, style = "") => `<p style="margin:0 0 14px;${style}">${content}</p>`
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2b1807;max-width:560px">
${email.greeting ? p(escapeHtml(email.greeting)) : ""}
${email.paragraphs.map((line) => p(escapeHtml(line))).join("\n")}
${email.action ? p(`<a href="${escapeHtml(email.action.href)}" style="color:#835105;font-weight:bold">${escapeHtml(email.action.label)}</a>`) : ""}
${p(signOff.map(escapeHtml).join("<br>"))}
${email.note ? p(escapeHtml(email.note), "font-size:12px;color:#7a6654") : ""}
</div>`

  try {
    await transport().sendMail({ from: `"${BUSINESS.name}" <${process.env.NODEMAILER_USER}>`, to, subject: email.subject, text, html })
    console.log("Email sent:", email.subject, "->", Array.isArray(to) ? to.join(", ") : to)
  } catch (error) {
    console.error("Email not sent:", email.subject, error)
  }
}

/** Addresses of the site admins (the admin accounts' emails). */
export async function adminEmails(): Promise<string[]> {
  const admins = await prisma.adminUser.findMany({ select: { email: true } })
  return admins.map((a) => a.email)
}
