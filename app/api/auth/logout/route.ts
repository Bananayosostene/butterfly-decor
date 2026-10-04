import { endUserSession } from "@/lib/user-auth"
import { NextResponse } from "next/server"

export async function POST() {
  await endUserSession()
  return NextResponse.json({ success: true, message: "Signed out", statusCode: 200 })
}
