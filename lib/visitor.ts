import { randomUUID } from "crypto"
import { cookies } from "next/headers"

/** Anonymous id that lets a visitor like and comment without an account. */
export const VISITOR_COOKIE = "bfly_visitor"

export async function getVisitorId(): Promise<string | undefined> {
  return (await cookies()).get(VISITOR_COOKIE)?.value
}

/** Route handlers only — creates the cookie on a visitor's first like or comment. */
export async function ensureVisitorId(): Promise<string> {
  const store = await cookies()
  const existing = store.get(VISITOR_COOKIE)?.value
  if (existing) return existing
  const id = randomUUID()
  store.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  })
  return id
}
