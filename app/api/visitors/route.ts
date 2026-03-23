import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [total, today, thisMonth, thisHour, recent, byDevice, byBrowser] = await Promise.all([
      prisma.deviceVisit.count(),
      prisma.deviceVisit.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.deviceVisit.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.deviceVisit.count({ where: { createdAt: { gte: oneHourAgo } } }),
      prisma.deviceVisit.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.deviceVisit.groupBy({ by: ["device"], _count: true }),
      prisma.deviceVisit.groupBy({ by: ["browser"], _count: true }),
    ]);

    return NextResponse.json({ total, today, thisMonth, thisHour, recent, byDevice, byBrowser });
  } catch (error) {
    console.error("Visitors error:", error);
    return NextResponse.json({ error: "Failed to fetch visitors" }, { status: 500 });
  }
}
