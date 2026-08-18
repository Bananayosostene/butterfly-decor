import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  await deleteSession(token)
  cookieStore.delete("admin_session")
  return NextResponse.json({ success: true, message: "Logged out", statusCode: 200 })
}
