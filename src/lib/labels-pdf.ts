import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";
import { LABEL_GRID, LABEL_KIND_NAMES, LABELS_PER_PAGE, labelPath, type LabelItem } from "@/lib/labels";

function fittedText(value: string, font: PDFFont, size: number, maxWidth: number) {
  const clean = (value || "Sin nombre").replace(/\s+/g, " ").trim();
  if (font.widthOfTextAtSize(clean, size) <= maxWidth) return clean;
  let shortened = clean;
  while (shortened.length > 3 && font.widthOfTextAtSize(`${shortened}...`, size) > maxWidth) shortened = shortened.slice(0, -1);
  return `${shortened.trimEnd()}...`;
}

export async function generateLabelsPdf(items: LabelItem[], origin: string) {
  const doc = await PDFDocument.create();
  doc.setTitle("Etiquetas — Desarmario");
  doc.setSubject("Pegatinas QR para piezas, bolsas y cajas");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.CourierBold);
  const { pageWidth, pageHeight, columns, labelWidth, labelHeight, gapX } = LABEL_GRID;
  const marginX = (pageWidth - columns * labelWidth - (columns - 1) * gapX) / 2;
  const marginY = (pageHeight - LABEL_GRID.rows * labelHeight) / 2;

  for (let index = 0; index < items.length; index++) {
    if (index % LABELS_PER_PAGE === 0) doc.addPage([pageWidth, pageHeight]);
    const page = doc.getPages().at(-1)!;
    const slot = index % LABELS_PER_PAGE;
    const column = slot % columns;
    const row = Math.floor(slot / columns);
    const x = marginX + column * (labelWidth + gapX);
    const y = pageHeight - marginY - (row + 1) * labelHeight;
    const item = items[index]!;

    const qrValue = new URL(labelPath(item.kind, item.id), origin).href;
    const qrData = await QRCode.toDataURL(qrValue, { width: 400, margin: 0, errorCorrectionLevel: "M" });
    const qr = await doc.embedPng(qrData);
    const qrSize = 80;
    page.drawImage(qr, { x: x + 8, y: y + (labelHeight - qrSize) / 2, width: qrSize, height: qrSize });
    page.drawRectangle({ x, y, width: labelWidth, height: labelHeight, borderColor: rgb(0.72, 0.72, 0.72), borderWidth: 0.6 });

    const textX = x + 96;
    const textWidth = labelWidth - 104;
    page.drawText(LABEL_KIND_NAMES[item.kind].toUpperCase(), { x: textX, y: y + 88, size: 6.5, font: bold, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(fittedText(item.code, mono, 17, textWidth), { x: textX, y: y + 64, size: 17, font: mono });
    page.drawText(fittedText(item.title, bold, 9, textWidth), { x: textX, y: y + 43, size: 9, font: bold });
    page.drawText(fittedText(item.subtitle, regular, 7, textWidth), { x: textX, y: y + 27, size: 7, font: regular, color: rgb(0.3, 0.3, 0.3) });
  }

  if (!items.length) doc.addPage([pageWidth, pageHeight]);
  return doc.save();
}
