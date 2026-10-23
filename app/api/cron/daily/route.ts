import { prisma } from "@/lib/db"
import { kigaliToday, unsubscribeToken } from "@/lib/birthday"
import { adminEmails, sendEmail, siteUrl } from "@/lib/email"
import { realVisits } from "@/lib/visits"
import { type NextRequest, NextResponse } from "next/server"

const DAY = 24 * 60 * 60 * 1000
/** News emails sent in one run, to stay inside the email account's daily limit. */
const MAX_NEWS_EMAILS = 300

export const maxDuration = 60

const unsubscribeNote = (userId: string) =>
  `You receive this because you have an account on Butterfly Decor. To stop these news emails: ${siteUrl(`/api/unsubscribe?u=${userId}&t=${unsubscribeToken(userId)}`)}`

const subscribed = { OR: [{ emailOptOut: false }, { emailOptOut: null }, { emailOptOut: { isSet: false } }] }

/**
 * Runs every morning (Vercel Cron, see vercel.json):
 *  - birthday wishes to clients and vendors, and the admin is told whose birthday it is;
 *  - reminders two days before a booked event, to the admin and to the customer;
 *  - on Mondays, a short weekly email: what is new (clients), how their page did (vendors),
 *    and a summary of the week (admin).
 */
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

  const { monthDay, year, weekday } = kigaliToday()
  const report: Record<string, number> = {}
  const admins = await adminEmails()

  // ── Birthdays ──
  const birthdays = await prisma.user.findMany({
    where: { birthday: { endsWith: `-${monthDay}` }, OR: [{ birthdayWishedYear: { not: year } }, { birthdayWishedYear: null }, { birthdayWishedYear: { isSet: false } }] },
    select: { id: true, name: true, email: true, role: true, businessName: true, phone: true },
  })
  for (const person of birthdays) {
    const vendor = person.role === "VENDOR"
    await sendEmail({
      to: person.email,
      subject: `Happy birthday, ${person.name}`,
      greeting: `Dear ${person.name},`,
      paragraphs: vendor
        ? [
            "Everyone at Butterfly Decor wishes you a very happy birthday.",
            `Thank you for being part of our family of wedding vendors with ${person.businessName ?? "your business"}. May this new year bring you many happy couples and beautiful events.`,
          ]
        : [
            "Everyone at Butterfly Decor wishes you a very happy birthday.",
            "May this new year be full of love and celebrations. If you are planning a party, we would be glad to make it beautiful for you.",
          ],
    })
    await prisma.user.update({ where: { id: person.id }, data: { birthdayWishedYear: year } })
  }
  if (birthdays.length) {
    const names = birthdays.map((p) => `${p.name}${p.role === "VENDOR" ? ` (vendor, ${p.businessName ?? ""})` : ""}${p.phone ? `, ${p.phone}` : ""}`)
    await prisma.notification.create({
      data: { audience: "ADMIN", type: "BIRTHDAY", title: `Birthday today: ${birthdays.map((p) => p.name).join(", ")}`, body: "A birthday email was sent. A call or message from you would mean a lot.", href: "/account/users" },
    })
    await sendEmail({
      to: admins,
      subject: `Birthdays today (${birthdays.length})`,
      greeting: "Hello,",
      paragraphs: [`It is the birthday of: ${names.join("; ")}.`, "Each of them received a birthday email from Butterfly Decor. A short call or WhatsApp message from you would make it personal."],
    })
  }
  report.birthdays = birthdays.length

  // ── Events in two days ──
  const startToday = new Date(new Date().setHours(0, 0, 0, 0))
  const from = new Date(startToday.getTime() + 2 * DAY)
  const events = await prisma.booking.findMany({
    where: { eventDate: { gte: from, lt: new Date(from.getTime() + DAY) }, status: { in: ["NEW", "CONFIRMED"] } },
    select: { id: true, name: true, email: true, phone: true, eventDate: true, selectedItems: true, status: true },
  })
  for (const b of events) {
    const date = b.eventDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    await prisma.notification.create({
      data: { audience: "ADMIN", type: "EVENT", title: `Event in 2 days: ${b.name ?? b.phone}`, body: `${date}, ${b.selectedItems.length} items, booking ${b.status === "NEW" ? "not confirmed yet" : "confirmed"}.`, href: `/account/bookings/${b.id}` },
    })
    if (b.email)
      await sendEmail({
        to: b.email,
        subject: "Your event is in two days",
        greeting: `Hello ${b.name ?? ""},`.replace(" ,", ","),
        paragraphs: [`This is a short reminder that your event is on ${date}. We are getting everything ready for you.`, "If anything has changed, please call us as soon as possible."],
      })
  }
  if (events.length)
    await sendEmail({
      to: admins,
      subject: `${events.length} event${events.length === 1 ? "" : "s"} in two days`,
      greeting: "Hello,",
      paragraphs: events.map((b) => `${b.name ?? "Guest"} (${b.phone}): ${b.selectedItems.length} items, ${b.status === "NEW" ? "not confirmed yet" : "confirmed"}.`),
      action: { label: "Open the bookings", href: siteUrl("/account/bookings") },
    })
  report.events = events.length

  // ── Weekly emails, on Mondays ──
  if (weekday === "Monday") {
    const weekAgo = new Date(Date.now() - 7 * DAY)
    const [newItems, newAlbums, visitors, bookings, accounts] = await Promise.all([
      prisma.collectionItem.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.weddingAlbum.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.deviceVisit.count({ where: realVisits({ createdAt: { gte: weekAgo } }) }),
      prisma.booking.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    ])
    let sent = 0

    // Clients: only when there is something new to show.
    if (newItems + newAlbums > 0) {
      const clients = await prisma.user.findMany({
        where: { AND: [{ OR: [{ role: "CLIENT" }, { role: null }, { role: { isSet: false } }] }, subscribed] },
        select: { id: true, name: true, email: true },
        take: MAX_NEWS_EMAILS,
      })
      for (const c of clients) {
        await sendEmail({
          to: c.email,
          subject: "New at Butterfly Decor this week",
          greeting: `Hello ${c.name},`,
          paragraphs: [
            [newItems && `${newItems} new outfit${newItems === 1 ? "" : "s"} and decor piece${newItems === 1 ? "" : "s"}`, newAlbums && `${newAlbums} new real wedding album${newAlbums === 1 ? "" : "s"}`].filter(Boolean).join(" and ") + " were added this week.",
            "Have a look, save the ones you like, and book them when your date is set.",
          ],
          action: { label: "See what is new", href: siteUrl("/collection") },
          note: unsubscribeNote(c.id),
        })
        sent++
      }
    }

    // Vendors: how their page did this week.
    const vendors = await prisma.user.findMany({
      where: { AND: [{ role: "VENDOR" }, subscribed] },
      select: { id: true, name: true, email: true, businessName: true, items: { select: { id: true } } },
      take: Math.max(0, MAX_NEWS_EMAILS - sent),
    })
    for (const v of vendors) {
      const [views, messages] = await Promise.all([
        prisma.imageView.count({ where: { kind: "VENDOR", key: { in: v.items.map((i) => i.id) }, createdAt: { gte: weekAgo } } }),
        prisma.inquiry.count({ where: { vendorId: v.id, createdAt: { gte: weekAgo } } }),
      ])
      await sendEmail({
        to: v.email,
        subject: `Your week on Butterfly Decor`,
        greeting: `Hello ${v.name},`,
        paragraphs: [
          `This week, people viewed the photos of ${v.businessName ?? "your business"} ${views} time${views === 1 ? "" : "s"}, and you received ${messages} message${messages === 1 ? "" : "s"}.`,
          v.items.length < 6
            ? "Pages with at least six good photos get far more attention. Adding a few more is the quickest way to get more messages."
            : "Fresh photos keep your page at the top of couples' minds. Adding your latest work helps.",
        ],
        action: { label: "Open your dashboard", href: siteUrl("/account/my-gallery") },
        note: unsubscribeNote(v.id),
      })
      sent++
    }

    await sendEmail({
      to: admins,
      subject: "Your week at Butterfly Decor",
      greeting: "Hello,",
      paragraphs: [
        `Last 7 days: ${visitors} real visitors, ${bookings} booking${bookings === 1 ? "" : "s"}, ${accounts} new account${accounts === 1 ? "" : "s"}, ${newItems} new pieces and ${newAlbums} new album${newAlbums === 1 ? "" : "s"}.`,
        `${sent} weekly email${sent === 1 ? " was" : "s were"} sent to clients and vendors this morning.`,
      ],
      action: { label: "Open the dashboard", href: siteUrl("/account") },
    })
    report.weekly = sent
  }

  return NextResponse.json({ success: true, report })
}
