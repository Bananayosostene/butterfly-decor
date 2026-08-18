import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/db"

const SESSION_DAYS = 7
const RESET_TOKEN_MINUTES = 60
const MAX_FAILED_ATTEMPTS = 3

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("scrypt:")) {
    const [, salt, hash] = stored.split(":")
    const candidate = scryptSync(password, salt, 64)
    const expected = Buffer.from(hash, "hex")
    if (candidate.length !== expected.length) return false
    return timingSafeEqual(candidate, expected)
  }
  // Legacy plain SHA-256 hash (pre-upgrade admin records)
  const legacy = createHash("sha256").update(password).digest("hex")
  const candidate = Buffer.from(legacy, "hex")
  const expected = Buffer.from(stored, "hex")
  if (candidate.length !== expected.length) return false
  return timingSafeEqual(candidate, expected)
}

function generateToken(): string {
  return randomBytes(32).toString("hex")
}

export async function createSession(adminId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await prisma.session.create({ data: { token, adminId, expiresAt } })
  return token
}

export async function getSessionAdminId(token: string | undefined): Promise<string | null> {
  if (!token) return null
  const session = await prisma.session.findUnique({ where: { token } })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => {})
    return null
  }
  return session.adminId
}

export async function deleteSession(token: string | undefined): Promise<void> {
  if (!token) return
  await prisma.session.deleteMany({ where: { token } })
}

export async function recordFailedLogin(
  adminId: string
): Promise<{ locked: boolean; attemptsRemaining: number; resetToken?: string }> {
  const admin = await prisma.adminUser.update({
    where: { id: adminId },
    data: { failedAttempts: { increment: 1 } },
  })

  if (admin.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    const resetToken = generateToken()
    const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000)
    await prisma.adminUser.update({
      where: { id: adminId },
      data: { lockedAt: new Date(), resetToken, resetTokenExpiry },
    })
    return { locked: true, attemptsRemaining: 0, resetToken }
  }

  return { locked: false, attemptsRemaining: MAX_FAILED_ATTEMPTS - admin.failedAttempts }
}

export async function clearFailedLogins(adminId: string): Promise<void> {
  await prisma.adminUser.update({
    where: { id: adminId },
    data: { failedAttempts: 0, lockedAt: null },
  })
}

export async function requireAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_session")?.value
  const adminId = await getSessionAdminId(token)
  return !!adminId
}

export async function createPasswordResetToken(adminId: string): Promise<string> {
  const resetToken = generateToken()
  const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000)
  await prisma.adminUser.update({
    where: { id: adminId },
    data: { resetToken, resetTokenExpiry },
  })
  return resetToken
}
