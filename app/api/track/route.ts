import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function parseUserAgent(ua: string) {
  const browser =
    ua.includes("Chrome") ? "Chrome" :
    ua.includes("Firefox") ? "Firefox" :
    ua.includes("Safari") ? "Safari" :
    ua.includes("Edge") ? "Edge" : "Unknown";

  const os =
    ua.includes("Windows") ? "Windows" :
    ua.includes("Android") ? "Android" :
    ua.includes("iPhone") || ua.includes("iPad") ? "iOS" :
    ua.includes("Mac") ? "macOS" :
    ua.includes("Linux") ? "Linux" : "Unknown";

  const device =
    ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone") ? "Mobile" :
    ua.includes("iPad") ? "Tablet" : "Desktop";

  return { browser, os, device };
}

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") || "Unknown";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "Unknown";
    const { browser, os, device } = parseUserAgent(ua);

    await prisma.deviceVisit.create({
      data: { userAgent: ua, ip, browser, os, device },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: "sbananayo99@gmail.com",
      subject: "New Visitor on Butterfly Decor",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#0f0b06;margin-bottom:16px;">New Visitor</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Device</td><td style="padding:8px 0;font-weight:600;">${device}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Browser</td><td style="padding:8px 0;font-weight:600;">${browser}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">OS</td><td style="padding:8px 0;font-weight:600;">${os}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">IP</td><td style="padding:8px 0;font-weight:600;">${ip}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Time</td><td style="padding:8px 0;font-weight:600;">${new Date().toLocaleString()}</td></tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
