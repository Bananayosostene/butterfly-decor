import { prisma } from "@/lib/db";
import { isObjectId } from "@/lib/data";
import { getSessionAdminId } from "@/lib/auth";
import { getUserByToken, USER_COOKIE } from "@/lib/user-auth";
import { isBot, parseUserAgent } from "@/lib/user-agent";
import { VISITOR_COOKIE } from "@/lib/visitor";
import { OWNER_COOKIE, OWNER_COOKIE_OPTIONS } from "@/lib/visits";
import { type NextRequest, NextResponse } from "next/server";
import { adminEmails, sendEmail, siteUrl } from "@/lib/email";
import { notifyAdmin } from "@/lib/notify";

const MAX_SECONDS = 12 * 60 * 60;
/** Set on a browser's first visit; a later visit with it counts as a returning visitor. */
const SEEN_COOKIE = "bfly_seen";
/** The address that has always received the visitor emails, besides the admin accounts. */
const VISITOR_EMAIL = "sbananayo99@gmail.com";
/** Addresses a request has when it comes from the same computer the site is running on. */
const LOCAL_ADDRESSES = ["::1", "127.0.0.1", "::ffff:127.0.0.1"];

const text = (value: unknown, max: number) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null);
const whole = (value: unknown, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(0, Math.round(value))) : null;

/** City, region and country from the hosting platform's headers (set by Vercel in production). */
function locationOf(req: NextRequest) {
  const header = (name: string) => {
    const value = req.headers.get(name);
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };
  const code = header("x-vercel-ip-country");
  let country = code;
  try {
    if (code) country = new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {}
  return { country, region: header("x-vercel-ip-country-region"), city: header("x-vercel-ip-city") };
}

/**
 * Who is behind this request: the signed-in account's name (if any), whether this is the site
 * owner (admin signed in, or a browser the admin has used before), and the id used for likes.
 */
async function whoIs(req: NextRequest) {
  const [user, adminId] = await Promise.all([
    getUserByToken(req.cookies.get(USER_COOKIE)?.value),
    getSessionAdminId(req.cookies.get("admin_session")?.value),
  ]);
  const account = adminId ? { userName: "Admin", userEmail: null } : user ? { userName: user.name, userEmail: user.email } : null;
  return {
    account,
    admin: !!adminId,
    owner: !!adminId || !!req.cookies.get(OWNER_COOKIE)?.value,
    visitorId: req.cookies.get(VISITOR_COOKIE)?.value?.slice(0, 64),
  };
}

/** Marks the browser as the owner's when the admin is signed in on it. */
function respond(body: object, admin: boolean) {
  const res = NextResponse.json(body);
  if (admin) res.cookies.set(OWNER_COOKIE, "1", OWNER_COOKIE_OPTIONS);
  return res;
}

/**
 * Called by the visit tracker. Without an `id` it records a new visit and returns its id; with
 * an `id` it updates that visit's time on site and page count (sent when the visitor leaves).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // ── Update of a visit already recorded ──
    if (body?.id !== undefined) {
      if (typeof body.id !== "string" || !isObjectId(body.id)) return NextResponse.json({ ok: false }, { status: 400 });
      const { account, admin, owner, visitorId } = await whoIs(req);
      await prisma.deviceVisit.updateMany({
        where: { id: body.id },
        data: {
          durationSeconds: whole(body.seconds, MAX_SECONDS) ?? undefined,
          pageViews: whole(body.pages, 1000) ?? undefined,
          ...(Array.isArray(body.paths)
            ? { pages: body.paths.filter((p: unknown) => typeof p === "string" && p.startsWith("/")).slice(0, 30).map((p: string) => p.slice(0, 200)) }
            : {}),
          lastSeenAt: new Date(),
          // Someone who signed in during the visit gets their name on it.
          ...(account ?? {}),
          // The admin signing in part-way makes the whole visit the owner's.
          ...(owner ? { isOwner: true } : {}),
          // The first like or comment gives the browser its id; keep it with the visit.
          ...(visitorId ? { visitorId } : {}),
        },
      });
      return respond({ ok: true }, admin);
    }

    // ── New visit ──
    const ua = req.headers.get("user-agent") || "";
    if (isBot(ua)) return NextResponse.json({ ok: true });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "Unknown";
    const info = parseUserAgent(ua);
    const location = locationOf(req);
    const { account, admin, owner, visitorId } = await whoIs(req);
    // The browser can name the phone model and exact system version when the user-agent hides them.
    const model = text(body?.model, 80) ?? info.model;
    const osVersion = text(body?.osVersion, 40) ?? info.osVersion;

    const visit = await prisma.deviceVisit.create({
      data: {
        userAgent: ua.slice(0, 500),
        ip,
        device: info.device,
        browser: info.browser,
        browserVersion: info.browserVersion,
        os: info.os,
        osVersion,
        model,
        ...location,
        timezone: text(body?.timezone, 60),
        language: text(body?.language, 20),
        screen: text(body?.screen, 20),
        connection: text(body?.connection, 20),
        referrer: text(body?.referrer, 300),
        landingPage: text(body?.path, 300),
        pageViews: 1,
        pages: text(body?.path, 200) ? [text(body?.path, 200)!.split("?")[0]] : [],
        durationSeconds: 0,
        lastSeenAt: new Date(),
        // A visit to the test server on the owner's own computer is never a real visitor.
        isOwner: owner || LOCAL_ADDRESSES.includes(ip),
        visitorId,
        // A browser that has been here before (in another visit) carries this cookie.
        returning: !!req.cookies.get(SEEN_COOKIE)?.value,
        ...(account ?? {}),
      },
      select: { id: true },
    });

    // The owner's own visits are recorded without a notification.
    if (owner || LOCAL_ADDRESSES.includes(ip)) return respond({ ok: true, id: visit.id }, admin);

    const returning = !!req.cookies.get(SEEN_COOKIE)?.value;
    const who = account ? account.userName : returning ? "A returning visitor" : "A new visitor";
    const place = [location.city, location.country].filter(Boolean).join(", ") || "an unknown place";
    const device = [info.device, model].filter(Boolean).join(", ");
    await notifyAdmin({
      type: "VISIT",
      title: `${who} is on the site`,
      body: `From ${place}, on ${device} (${info.browser}). Opened ${text(body?.path, 120) ?? "/"}.`,
      href: "/account/visitors",
    });
    await sendEmail({
      to: [VISITOR_EMAIL, ...(await adminEmails())],
      subject: `${who} on Butterfly Decor`,
      paragraphs: [
        `${who} just opened the site from ${place}, on ${device} with ${info.browser} on ${[info.os, osVersion].filter(Boolean).join(" ")}.`,
        `First page: ${text(body?.path, 120) ?? "/"}. Came from: ${text(body?.referrer, 120) ?? "a direct visit"}.`,
      ],
      action: { label: "See all visitors", href: siteUrl("/account/visitors") },
    });

    const res = respond({ ok: true, id: visit.id }, admin);
    if (!returning) res.cookies.set(SEEN_COOKIE, "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 365 * 24 * 60 * 60, path: "/" });
    return res;
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
