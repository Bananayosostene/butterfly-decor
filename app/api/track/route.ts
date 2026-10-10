import { prisma } from "@/lib/db";
import { isObjectId } from "@/lib/data";
import { getSessionAdminId } from "@/lib/auth";
import { getUserByToken, USER_COOKIE } from "@/lib/user-auth";
import { isBot, parseUserAgent } from "@/lib/user-agent";
import { after, type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const MAX_SECONDS = 12 * 60 * 60;

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

/** The signed-in person behind this request, if any. */
async function accountOf(req: NextRequest) {
  const user = await getUserByToken(req.cookies.get(USER_COOKIE)?.value);
  if (user) return { userName: user.name, userEmail: user.email };
  if (await getSessionAdminId(req.cookies.get("admin_session")?.value)) return { userName: "Admin", userEmail: null };
  return null;
}

function notifyByEmail(v: { device: string; model: string | null; browser: string; os: string; ip: string; place: string; name: string }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.NODEMAILER_USER, pass: process.env.NODEMAILER_PASS },
  });
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">${label}</td><td style="padding:8px 0;font-weight:600;">${value}</td></tr>`;
  return transporter.sendMail({
    from: process.env.NODEMAILER_USER,
    to: "sbananayo99@gmail.com",
    subject: "New Visitor on Butterfly Decor",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#0f0b06;margin-bottom:16px;">New Visitor</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${row("Visitor", v.name)}
          ${row("Location", v.place)}
          ${row("Device", [v.device, v.model].filter(Boolean).join(" · "))}
          ${row("Browser", v.browser)}
          ${row("OS", v.os)}
          ${row("IP", v.ip)}
          ${row("Time", new Date().toLocaleString("en-GB", { timeZone: "Africa/Kigali" }))}
        </table>
      </div>
    `,
  });
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

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
      const account = await accountOf(req);
      await prisma.deviceVisit.updateMany({
        where: { id: body.id },
        data: {
          durationSeconds: whole(body.seconds, MAX_SECONDS) ?? undefined,
          pageViews: whole(body.pages, 1000) ?? undefined,
          lastSeenAt: new Date(),
          // Someone who signed in during the visit gets their name on it.
          ...(account ?? {}),
        },
      });
      return NextResponse.json({ ok: true });
    }

    // ── New visit ──
    const ua = req.headers.get("user-agent") || "";
    if (isBot(ua)) return NextResponse.json({ ok: true });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "Unknown";
    const info = parseUserAgent(ua);
    const location = locationOf(req);
    const account = await accountOf(req);
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
        durationSeconds: 0,
        lastSeenAt: new Date(),
        ...(account ?? {}),
      },
      select: { id: true },
    });

    // The email goes out after the response, so the visitor's browser is not kept waiting.
    after(() =>
      notifyByEmail({
        device: info.device,
        model: model && escapeHtml(model),
        browser: [info.browser, info.browserVersion].filter(Boolean).join(" "),
        os: escapeHtml([info.os, osVersion].filter(Boolean).join(" ")),
        ip: escapeHtml(ip),
        place: escapeHtml([location.city, location.region, location.country].filter(Boolean).join(", ") || "Unknown"),
        name: escapeHtml(account ? [account.userName, account.userEmail].filter(Boolean).join(" · ") : "Guest"),
      }).catch((error) => console.error("Visit email error:", error)),
    );

    return NextResponse.json({ ok: true, id: visit.id });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
