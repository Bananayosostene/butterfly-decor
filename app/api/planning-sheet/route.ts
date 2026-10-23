import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/user-auth"
import { getPlanningSections } from "@/lib/planning-data"
import { siteUrl } from "@/lib/email"
import { notifyAdmin } from "@/lib/notify"
import { cleanEntries, isDate, readEntries } from "@/lib/planning-sheet"
import { type NextRequest, NextResponse } from "next/server"

/** A signed-in customer saves their planning list; with `submit` it is also sent to the business. */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ success: false, message: "Sign in to save your list", statusCode: 401 }, { status: 401 })

    const body = await req.json()
    const [sections, stored] = await Promise.all([
      getPlanningSections(),
      prisma.planningSheet.findUnique({ where: { userId: user.id }, select: { entries: true } }),
    ])
    // Prices belong to the admin: a customer save keeps the ones already there.
    const entries = cleanEntries(body?.entries, sections, readEntries(stored?.entries), false)
    if (body?.submit === true && !entries.GUSABA.length && !entries.RECEPTION.length)
      return NextResponse.json({ success: false, message: "Add at least one record before sending.", statusCode: 400 }, { status: 400 })

    const data = {
      entries,
      weddingDate: isDate(body?.weddingDate) ? body.weddingDate : null,
      ...(body?.submit === true ? { submittedAt: new Date() } : {}),
    }
    const sheet = await prisma.planningSheet.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data, select: { id: true } })
    if (body?.submit === true) {
      const records = entries.GUSABA.length + entries.RECEPTION.length
      await notifyAdmin({
        type: "PLANNING",
        title: `${user.name} sent a planning list`,
        body: `${records} record${records === 1 ? "" : "s"}${data.weddingDate ? `, wedding on ${data.weddingDate.split("-").reverse().join("/")}` : ""}. Add the prices when you are ready.`,
        href: `/account/planning-lists/${sheet.id}`,
        email: {
          subject: `New planning list from ${user.name}`,
          greeting: "Hello,",
          paragraphs: [
            `${user.name} (${user.email}) has sent a wedding planning list with ${records} record${records === 1 ? "" : "s"}.`,
            "Open it in the dashboard to check the details and write the prices.",
          ],
          action: { label: "Open the list", href: siteUrl(`/account/planning-lists/${sheet.id}`) },
        },
      })
    }
    return NextResponse.json({ success: true, message: "Saved", statusCode: 200, data: null })
  } catch (error) {
    console.error("Planning list save failed:", error)
    // An old database client is still loaded when the server was not restarted after `prisma generate`.
    const stale = !(prisma as any).planningSheet
    return NextResponse.json(
      { success: false, message: stale ? "The server needs a restart to finish the update. Please try again shortly." : "Failed to save your list", statusCode: 500 },
      { status: 500 },
    )
  }
}
