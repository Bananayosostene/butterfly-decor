import { createHmac } from "crypto"

/** A birthday as typed in a date field ("YYYY-MM-DD"), or null when empty or impossible. */
export function cleanBirthday(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === "") return null
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(`${value}T00:00:00Z`)
  const year = date.getUTCFullYear()
  if (Number.isNaN(date.getTime()) || year < 1900 || date > new Date()) return undefined
  return value
}

/** Today's month and day in Kigali, e.g. "10-20", and the year. */
export function kigaliToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kigali", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)!.value
  return { monthDay: `${get("month")}-${get("day")}`, year: Number(get("year")), weekday: new Date().toLocaleDateString("en-GB", { timeZone: "Africa/Kigali", weekday: "long" }) }
}

// ── Links that stop news emails ──────────────────────────────────────────────────────────

const secret = () => process.env.CRON_SECRET || process.env.NODEMAILER_PASS || "butterfly"

/** A token proving an unsubscribe link was made by the site for this account. */
export const unsubscribeToken = (userId: string) => createHmac("sha256", secret()).update(`unsubscribe:${userId}`).digest("hex").slice(0, 32)
