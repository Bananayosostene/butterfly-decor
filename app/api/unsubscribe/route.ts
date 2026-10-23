import { prisma } from "@/lib/db"
import { isObjectId } from "@/lib/data"
import { unsubscribeToken } from "@/lib/birthday"
import { type NextRequest, NextResponse } from "next/server"

const page = (message: string) =>
  new NextResponse(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Butterfly Decor</title>
<div style="font-family:Arial,sans-serif;max-width:480px;margin:15vh auto;padding:0 16px;color:#2b1807;line-height:1.6">
<p>${message}</p><p><a href="/" style="color:#835105">Back to Butterfly Decor</a></p></div>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  )

/** The link at the bottom of news emails: stops them for that account (account emails continue). */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("u") ?? ""
  const token = req.nextUrl.searchParams.get("t") ?? ""
  if (!isObjectId(userId) || token !== unsubscribeToken(userId)) return page("This link is not valid.")
  await prisma.user.updateMany({ where: { id: userId }, data: { emailOptOut: true } })
  return page("Done. You will not receive news emails from Butterfly Decor any more. You can turn them back on from your profile page.")
}
