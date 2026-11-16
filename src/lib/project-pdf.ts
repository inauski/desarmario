import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { jointLabel, type Bag, type Box, type Joint, type Piece, type Project, type Step } from "@/lib/db";

export interface ProjectPdfData {
  project: Project;
  pieces: Piece[];
  bags: Bag[];
  boxes: Box[];
  joints: Joint[];
  steps: Step[];
}

function cleanText(value: string | number) {
  return String(value || "").replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, "?").replace(/[ \t]+/g, " ").trim();
}

function wrapText(value: string, font: PDFFont, size: number, maxWidth: number) {
  const output: string[] = [];
  for (const block of cleanText(value).split("\n")) {
    if (!block) { output.push(""); continue; }
    let line = "";
    for (const original of block.split(" ")) {
      let word = original;
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) { line = candidate; continue; }
      if (line) output.push(line);
      while (font.widthOfTextAtSize(word, size) > maxWidth) {
        let cut = word.length - 1;
        while (cut > 1 && font.widthOfTextAtSize(word.slice(0, cut), size) > maxWidth) cut--;
        output.push(word.slice(0, cut));
        word = word.slice(cut);
      }
      line = word;
    }
    output.push(line);
  }
  return output;
}

class Writer {
  private page?: PDFPage;
  private y = 0;
  private readonly width = 595.28;
  private readonly height = 841.89;
  private readonly margin = 46;

  constructor(private doc: PDFDocument, private regular: PDFFont, private bold: PDFFont) {}

  private ensure(height: number) {
    if (!this.page || this.y - height < 46) {
      this.page = this.doc.addPage([this.width, this.height]);
      this.y = this.height - 48;
    }
  }

  space(height: number) { this.y -= height; }

  keepTogether(height: number) { this.ensure(height); }

  paragraph(value: string, options: { size?: number; bold?: boolean; indent?: number; color?: ReturnType<typeof rgb>; lineHeight?: number } = {}) {
    const size = options.size ?? 10;
    const font = options.bold ? this.bold : this.regular;
    const indent = options.indent ?? 0;
    const lineHeight = options.lineHeight ?? size + 4;
    const lines = wrapText(value, font, size, this.width - this.margin * 2 - indent);
    for (const line of lines) {
      this.ensure(lineHeight);
      if (line) this.page!.drawText(line, { x: this.margin + indent, y: this.y - size, size, font, ...(options.color ? { color: options.color } : {}) });
      this.y -= lineHeight;
    }
  }

  heading(value: string, size = 15) {
    this.ensure(size + 35);
    this.space(8);
    this.paragraph(value, { size, bold: true, lineHeight: size + 5 });
    this.space(2);
  }

  rule() {
    this.ensure(16);
    this.page!.drawLine({ start: { x: this.margin, y: this.y }, end: { x: this.width - this.margin, y: this.y }, thickness: 0.7, color: rgb(0.75, 0.75, 0.75) });
    this.y -= 14;
  }

  finish() {
    this.doc.getPages().forEach((page, index, pages) => {
      page.drawText(`Página ${index + 1} de ${pages.length}`, { x: this.width - 126, y: 24, size: 8, font: this.regular, color: rgb(0.4, 0.4, 0.4) });
    });
  }
}

export async function generateProjectPdf(data: ProjectPdfData) {
  const doc = await PDFDocument.create();
  doc.setTitle(`${data.project.name} — Proyecto Armario`);
  doc.setSubject("Piezas, uniones y pasos del proyecto");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const writer = new Writer(doc, regular, bold);
  const boxById = new Map(data.boxes.map((box) => [box.id, box]));
  const pieceById = new Map(data.pieces.map((piece) => [piece.id, piece]));
  const bagById = new Map(data.bags.map((bag) => [bag.id, bag]));

  writer.heading(data.project.name || "Mi armario", 24);
  if (data.project.description) writer.paragraph(data.project.description, { size: 11, color: rgb(0.3, 0.3, 0.3) });
  writer.paragraph(`Exportado el ${new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date())}`, { size: 9, color: rgb(0.4, 0.4, 0.4) });
  writer.paragraph(`${data.pieces.length} ${data.pieces.length === 1 ? "pieza" : "piezas"} · ${data.joints.length} ${data.joints.length === 1 ? "unión" : "uniones"} · ${data.steps.length} ${data.steps.length === 1 ? "paso" : "pasos"}`, { bold: true, size: 11 });
  writer.rule();

  writer.heading("Piezas", 19);
  if (!data.pieces.length) writer.paragraph("No hay piezas registradas.");
  [...data.pieces].sort((a, b) => a.code.localeCompare(b.code)).forEach((piece) => {
    writer.keepTogether(130);
    const box = boxById.get(piece.boxId ?? -1);
    writer.heading(`${piece.code} · ${piece.name || "Sin nombre"}`, 13);
    writer.paragraph(`Estado: ${piece.state} · Caja: ${box ? `${box.code}${box.location ? ` (${box.location})` : ""}` : "sin caja"}`, { indent: 10 });
    if (piece.measures) writer.paragraph(`Medidas: ${piece.measures}`, { indent: 10 });
    if (piece.orientation) writer.paragraph(`Orientación: ${piece.orientation}`, { indent: 10 });
    if (piece.notes) writer.paragraph(`Notas: ${piece.notes}`, { indent: 10 });
    writer.space(5);
  });

  writer.rule();
  writer.heading("Uniones", 19);
  if (!data.joints.length) writer.paragraph("No hay uniones registradas.");
  [...data.joints].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)).forEach((joint) => {
    writer.keepTogether(115);
    const pieces = joint.pieceIds.map((id) => pieceById.get(id)?.code).filter(Boolean).join(" + ");
    const bag = bagById.get(joint.bagId ?? -1);
    writer.heading(`${jointLabel(joint.id)} · ${joint.quantity} × ${joint.type}`, 13);
    writer.paragraph(`Piezas: ${pieces || "sin piezas"}`, { indent: 10 });
    writer.paragraph(`Bolsa: ${bag ? `${bag.code} · ${bag.content}` : "sin bolsa"}`, { indent: 10 });
    if (joint.notes) writer.paragraph(`Notas: ${joint.notes}`, { indent: 10 });
    writer.space(5);
  });

  writer.rule();
  writer.heading("Pasos", 19);
  if (!data.steps.length) writer.paragraph("No hay pasos registrados.");
  [...data.steps].sort((a, b) => a.order - b.order).forEach((step) => {
    writer.keepTogether(155);
    const pieces = step.pieceIds.map((id) => pieceById.get(id)?.code).filter(Boolean).join(", ");
    const bags = step.bagIds.map((id) => bagById.get(id)?.code).filter(Boolean).join(", ");
    writer.heading(`Paso ${step.order} · ${step.title || "Sin título"}`, 13);
    writer.paragraph(`Desmontaje: ${step.done ? "hecho" : "pendiente"} · Montaje: ${step.assembled ? "montado" : "pendiente"}`, { indent: 10 });
    if (step.description) writer.paragraph(step.description, { indent: 10 });
    if (step.tools.length) writer.paragraph(`Herramientas: ${step.tools.join(", ")}`, { indent: 10 });
    writer.paragraph(`Piezas: ${pieces || "ninguna"} · Bolsas: ${bags || "ninguna"}`, { indent: 10 });
    writer.space(5);
  });

  writer.finish();
  return doc.save();
}
