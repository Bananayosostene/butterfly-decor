"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

/**
 * The dashboard charts. They only draw what the server page sends: no data is fetched here.
 * Colours are the brand's (gold, rose, sage, cocoa), readable in light and dark mode.
 */
export const PALETTE = { gold: "#c8963e", rose: "#b5627a", sage: "#6f9478", cocoa: "#8a5a3b", sand: "#d8b77e" };

/** Visitors and bookings per day. */
export function ActivityChart({ data }: { data: { day: string; visitors: number; bookings: number }[] }) {
  const config = {
    visitors: { label: "Visitors", color: PALETTE.gold },
    bookings: { label: "Bookings", color: PALETTE.rose },
  } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          {Object.entries(config).map(([key, { color }]) => (
            <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.45} />
              <stop offset="95%" stopColor={color} stopOpacity={0.03} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Area dataKey="visitors" type="monotone" stroke="var(--color-visitors)" fill="url(#fill-visitors)" strokeWidth={2} />
        <Area dataKey="bookings" type="monotone" stroke="var(--color-bookings)" fill="url(#fill-bookings)" strokeWidth={2} />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}

/** Bookings by status, as a ring with the total in the middle. */
export function StatusChart({ data }: { data: { status: string; label: string; count: number }[] }) {
  const colours = [PALETTE.gold, PALETTE.sage, PALETTE.cocoa, PALETTE.rose];
  const config = Object.fromEntries(data.map((d, i) => [d.status, { label: d.label, color: colours[i % colours.length] }])) satisfies ChartConfig;
  const total = data.reduce((n, d) => n + d.count, 0);
  return (
    <ChartContainer config={config} className="aspect-square h-56 mx-auto">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
        <Pie data={data} dataKey="count" nameKey="status" innerRadius={58} outerRadius={84} strokeWidth={3} paddingAngle={2}>
          {data.map((d) => <Cell key={d.status} fill={`var(--color-${d.status})`} />)}
          <Label
            content={({ viewBox }) =>
              viewBox && "cx" in viewBox && "cy" in viewBox ? (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">{total}</tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 22} className="fill-muted-foreground text-xs">bookings</tspan>
                </text>
              ) : null
            }
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="status" />} className="flex-wrap" />
      </PieChart>
    </ChartContainer>
  );
}

/** How many pieces each category holds, as horizontal bars (outfits and decor in two colours). */
export function StockChart({ data }: { data: { name: string; items: number; decor: boolean }[] }) {
  const config = { items: { label: "Pieces", color: PALETTE.gold } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(180, data.length * 30) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} hide />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120} />
        <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
        <Bar dataKey="items" radius={6}>
          {data.map((d) => <Cell key={d.name} fill={d.decor ? PALETTE.sage : PALETTE.gold} />)}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

/** Visitors by device, as a ring. */
export function DeviceChart({ data }: { data: { device: string; count: number }[] }) {
  const colours = [PALETTE.gold, PALETTE.rose, PALETTE.sage, PALETTE.cocoa];
  const config = Object.fromEntries(data.map((d, i) => [d.device, { label: d.device, color: colours[i % colours.length] }])) satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="aspect-square h-56 mx-auto">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="device" hideLabel />} />
        <Pie data={data} dataKey="count" nameKey="device" innerRadius={50} outerRadius={84} strokeWidth={3}>
          {data.map((d) => <Cell key={d.device} fill={`var(--color-${d.device})`} />)}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="device" />} />
      </PieChart>
    </ChartContainer>
  );
}
