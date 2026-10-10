/** What a browser's user-agent string says about the visitor's device. */
export type DeviceInfo = {
  /** "Desktop" | "Mobile" | "Tablet" */
  device: string
  browser: string
  browserVersion: string | null
  os: string
  osVersion: string | null
  /** Phone or tablet model when the browser reveals it, e.g. "SM-A546B". */
  model: string | null
}

const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless|monitor|facebookexternalhit|whatsapp|curl|wget|python|axios|node-fetch/i

export const isBot = (ua: string) => !ua || BOT.test(ua)

// Order matters: Edge, Opera and Samsung Internet also say "Chrome", and Chrome also says "Safari".
const BROWSERS: [string, RegExp][] = [
  ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
  ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
  ["Facebook app", /FBAV\/([\d.]+)/],
  ["Instagram app", /Instagram ([\d.]+)/],
  ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
  ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
  ["Safari", /Version\/([\d.]+).*Safari/],
]

export function parseUserAgent(ua: string): DeviceInfo {
  let browser = "Unknown"
  let browserVersion: string | null = null
  for (const [name, pattern] of BROWSERS) {
    const match = ua.match(pattern)
    if (match) {
      browser = name
      // The major version is enough ("126", not "126.0.6478.71").
      browserVersion = match[1].split(".")[0]
      break
    }
  }

  let os = "Unknown"
  let osVersion: string | null = null
  let match: RegExpMatchArray | null
  if ((match = ua.match(/Android ([\d.]+)/))) {
    os = "Android"
    osVersion = match[1]
  } else if ((match = ua.match(/(?:iPhone|CPU) OS ([\d_]+)/))) {
    os = "iOS"
    osVersion = match[1].replace(/_/g, ".")
  } else if ((match = ua.match(/Windows NT ([\d.]+)/))) {
    os = "Windows"
    osVersion = match[1] === "10.0" ? "10 / 11" : match[1]
  } else if ((match = ua.match(/Mac OS X ([\d_.]+)/))) {
    os = "macOS"
    osVersion = match[1].replace(/_/g, ".")
  } else if (/Android/.test(ua)) os = "Android"
  else if (/Linux/.test(ua)) os = "Linux"

  const tablet = /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))
  const device = tablet ? "Tablet" : /Mobile|iPhone|Android/.test(ua) ? "Mobile" : "Desktop"

  // Android puts the model after the version: "Android 13; SM-A546B Build/…" or "Android 13; Pixel 7)".
  // Newer Chrome hides it and writes "K", which says nothing.
  let model: string | null = null
  if ((match = ua.match(/Android [\d.]+; ([^;)]+?)(?: Build\/[^;)]*)?[;)]/))) {
    const name = match[1].trim()
    if (name && name !== "K" && !/^[a-z]{2}-[a-z]{2}$/i.test(name)) model = name
  } else if (/iPhone/.test(ua)) model = "iPhone"
  else if (/iPad/.test(ua)) model = "iPad"

  return { device, browser, browserVersion, os, osVersion, model }
}
