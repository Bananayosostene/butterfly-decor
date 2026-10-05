import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"
import { ACCOUNT_HINT_COOKIE } from "@/lib/account-hint"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  await deleteSession(token)
  cookieStore.delete("admin_session")
  cookieStore.delete(ACCOUNT_HINT_COOKIE)
  return NextResponse.json({ success: true, message: "Logged out", statusCode: 200 })
}
