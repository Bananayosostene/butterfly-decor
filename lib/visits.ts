import type { Prisma } from "@prisma/client"

/**
 * Marks a browser as the site owner's. It is set when the admin signs in and stays for a year,
 * so the owner's visits are still recorded but kept apart from real visitors, even on days the
 * owner browses the site signed out or with a test account.
 */
export const OWNER_COOKIE = "bfly_owner"

export const OWNER_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 365 * 24 * 60 * 60,
  path: "/",
} as const

/** Visits by the site owner. */
export const OWNER_VISITS: Prisma.DeviceVisitWhereInput = { isOwner: true }

// Older visits have no `isOwner` field at all, which a plain "not true" would skip.
const NOT_OWNER: Prisma.DeviceVisitWhereInput = { OR: [{ isOwner: false }, { isOwner: null }, { isOwner: { isSet: false } }] }

/** Visits by real visitors (everyone but the owner), optionally narrowed further. */
export const realVisits = (extra: Prisma.DeviceVisitWhereInput = {}): Prisma.DeviceVisitWhereInput => ({ AND: [NOT_OWNER, extra] })
