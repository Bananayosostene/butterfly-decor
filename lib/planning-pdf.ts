import { BUSINESS } from "@/lib/business"
import { hasPrices, money, sectionTotal, sheetTotal, type SheetEntries, type SheetSection } from "@/lib/planning-sheet"

type Rgb = [number, number, number]
const INK: Rgb = [43, 24, 7]
const GOLD: Rgb = [131, 81, 5]
const LINE: Rgb = [201, 169, 110]
const CREAM: Rgb = [250, 242, 224]
const PALE: Rgb = [255, 252, 244]

/** The logo as a data URL plus its shape, so it can be placed in the PDF. */
async function loadLogo(): Promise<{ data: string; ratio: number } | null> {
  try {
    const blob = await (await fetch(BUSINESS.logo)).blob()
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    const ratio = await new Promise<number>((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img.naturalHeight / img.naturalWidth)
      img.onerror = () => resolve(0.75)
      img.src = data
    })
    return { data, ratio }
  } catch {
    return null
  }
}

/**
 * Builds the planning sheet as an A4 PDF and downloads it. Browser only. The PDF library is
 * loaded here, on the first download, so the page itself stays light.
 *
 * When the admin has written prices, the PDF gets a price column, a total per part and a
 * grand total.
 */
export async function downloadPlanningPdf({
  sections,
  entries,
  customer,
  weddingDate,
}: {
  sections: SheetSection[]
  entries: SheetEntries
  customer: { name: string; email: string; phone?: string }
  weddingDate: string | null
}) {
  const [{ jsPDF }, { default: autoTable }, logo] = await Promise.all([import("jspdf"), import("jspdf-autotable"), loadLogo()])

  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  const margin = 14
  const center = width / 2
  const priced = hasPrices(entries)
  let y = 14

  // ── Letterhead ──
  if (logo) {
    const w = 30
    doc.addImage(logo.data, "PNG", center - w / 2, y, w, w * logo.ratio, undefined, "FAST")
    y += w * logo.ratio + 8
  } else y += 6

  doc.setFont("times", "bold").setFontSize(24).setTextColor(...INK)
  doc.text(BUSINESS.name.toUpperCase(), center, y, { align: "center" })
  y += 7
  doc.setFont("times", "italic").setFontSize(13).setTextColor(...GOLD)
  doc.text(BUSINESS.tagline, center, y, { align: "center" })
  y += 6
  if (BUSINESS.location) {
    doc.setFont("times", "bold").setFontSize(10.5).setTextColor(...INK)
    doc.text(`Aho duherereye: ${BUSINESS.location}`, center, y, { align: "center" })
    y += 5
  }
  doc.setFont("times", "normal").setFontSize(10).setTextColor(...INK)
  doc.text(`Phone / WhatsApp: ${BUSINESS.phone}  |  Email: ${BUSINESS.email}`, center, y, { align: "center" })
  y += 3.5
  doc.setDrawColor(...GOLD).setLineWidth(0.8).line(margin, y, width - margin, y)
  y += 10

  doc.setFont("times", "bold").setFontSize(15).setTextColor(...INK)
  doc.text("URUPAPURO RW'IMITEGURO Y'UBUKWE", center, y, { align: "center" })
  y += 6
  doc.setFont("times", "italic").setFontSize(11).setTextColor(...GOLD)
  doc.text("Wedding Planning Sheet", center, y, { align: "center" })
  y += 7

  // ── Whose sheet it is (from the signed-in account) ──
  const owner = [
    customer.name,
    customer.phone,
    customer.email,
    weddingDate ? `Itariki y'ubukwe: ${weddingDate.split("-").reverse().join("/")}` : "",
  ].filter(Boolean)
  if (owner.length) {
    doc.setFont("times", "normal").setFontSize(10.5).setTextColor(...INK)
    doc.text(owner.join("   •   "), center, y, { align: "center" })
    y += 8
  }

  // ── One table per part ──
  sections.forEach((section, index) => {
    if (y > height - 60) {
      doc.addPage()
      y = 20
    }
    doc.setFont("times", "bold").setFontSize(13).setTextColor(...INK)
    doc.text(`${index + 1}. ${section.title.toUpperCase()}`, margin, y)
    y += 1.8
    doc.setDrawColor(...GOLD).setLineWidth(0.6).line(margin, y, width - margin, y)

    const columnStyles: Record<number, object> = {
      0: { cellWidth: 11, halign: "center", fontStyle: "bold", fillColor: CREAM },
      // A fixed width only when a free-text column needs the rest of the line.
      1: { ...(section.columns.some((c) => !c.short) ? { cellWidth: section.columns.length > 2 || priced ? 46 : 60 } : {}), fillColor: PALE },
    }
    section.columns.forEach((c, i) => {
      if (c.short) columnStyles[i + 2] = { cellWidth: 22, halign: "center" }
    })
    const priceColumn = section.columns.length + 2
    if (priced) columnStyles[priceColumn] = { cellWidth: 32, halign: "right" }

    // A part with no records still prints one empty line, like the sheet on screen.
    const list = entries[section.key].length ? entries[section.key] : [null]
    const body: any[][] = list.map((entry, i) => [
      String(i + 1),
      entry?.label ?? "",
      ...section.columns.map((c) => entry?.cells[c.id] ?? ""),
      ...(priced ? [entry && entry.amount !== null ? entry.amount.toLocaleString("en-US") : ""] : []),
    ])
    if (priced)
      body.push([
        { content: `Igiteranyo (${section.title})`, colSpan: priceColumn, styles: { halign: "right", fontStyle: "bold", fillColor: CREAM } },
        { content: sectionTotal(entries[section.key]).toLocaleString("en-US"), styles: { halign: "right", fontStyle: "bold", fillColor: CREAM } },
      ])

    autoTable(doc, {
      startY: y + 1.2,
      margin: { left: margin, right: margin, bottom: 18 },
      head: [["No", section.rowsLabel, ...section.columns.map((c) => c.label), ...(priced ? ["Amafaranga (RWF)"] : [])]],
      body,
      theme: "grid",
      styles: { font: "times", fontSize: 10.5, textColor: INK, lineColor: LINE, lineWidth: 0.2, cellPadding: 2.4, minCellHeight: 11, valign: "middle" },
      headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: "bold", minCellHeight: 8 },
      columnStyles,
    })
    y = (doc as any).lastAutoTable.finalY + 14
  })

  if (priced) {
    if (y > height - 30) {
      doc.addPage()
      y = 24
    }
    doc.setFont("times", "bold").setFontSize(14).setTextColor(...INK)
    doc.text(`Igiteranyo cyose / Total: ${money(sheetTotal(entries))}`, width - margin, y - 4, { align: "right" })
  }

  // ── Footer on every page ──
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    doc.setFont("times", "normal").setFontSize(8.5).setTextColor(...GOLD)
    doc.text(`${BUSINESS.name}  •  ${BUSINESS.phone}     page ${page} / ${pages}`, center, height - 9, { align: "center" })
  }

  doc.save("Butterfly-Decor-Wedding-Planning.pdf")
}
