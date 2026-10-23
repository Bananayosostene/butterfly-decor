/** Steps a booking goes through, in order. */
export const BOOKING_STATUSES = ["NEW", "CONFIRMED", "COMPLETED", "CANCELLED"] as const

export const statusLabel: Record<string, string> = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

/** Chip colours of each status, from the dashboard theme. */
export const statusStyle = (status: string) =>
  status === "NEW"
    ? { background: "var(--dash-soft)", color: "var(--dash-accent)" }
    : status === "CONFIRMED"
      ? { background: "var(--dash-ok-bg)", color: "var(--dash-ok)" }
      : status === "CANCELLED"
        ? { background: "var(--dash-danger-bg)", color: "var(--dash-danger)" }
        : { background: "var(--muted)", color: "var(--muted-foreground)" }

/** "in 3 days", "today", "5 days ago" for an event date. */
export function untilEvent(date: Date) {
  const day = 24 * 60 * 60 * 1000
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const event = new Date(date)
  event.setHours(0, 0, 0, 0)
  const days = Math.round((event.getTime() - start.getTime()) / day)
  if (days === 0) return "today"
  if (days === 1) return "tomorrow"
  if (days === -1) return "yesterday"
  return days > 0 ? `in ${days} days` : `${-days} days ago`
}
