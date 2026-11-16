import { describe, expect, it } from "vitest";
import { LABEL_GRID, LABELS_PER_PAGE, labelPath, parseLabelUrl } from "@/lib/labels";

describe("etiquetas QR", () => {
  it("cada tipo apunta a su propia ficha", () => {
    expect(labelPath("piece", 4)).toBe("/piezas/4");
    expect(labelPath("bag", 5)).toBe("/bolsas/5");
    expect(labelPath("box", 6)).toBe("/cajas/6");
  });

  it("el escáner reconoce las tres fichas del propio origen", () => {
    expect(parseLabelUrl("https://armario.example/piezas/4", "https://armario.example")).toEqual({ kind: "piece", id: 4 });
    expect(parseLabelUrl("https://armario.example/bolsas/5", "https://armario.example")).toEqual({ kind: "bag", id: 5 });
    expect(parseLabelUrl("https://armario.example/cajas/6", "https://armario.example")).toEqual({ kind: "box", id: 6 });
  });

  it("rechaza enlaces externos o rutas que no son fichas", () => {
    expect(parseLabelUrl("https://otro.example/piezas/4", "https://armario.example")).toBeNull();
    expect(parseLabelUrl("https://armario.example/alta", "https://armario.example")).toBeNull();
    expect(parseLabelUrl("texto cualquiera", "https://armario.example")).toBeNull();
  });

  it("la cuadrícula A4 tiene 3 columnas, 7 filas y 21 etiquetas por hoja", () => {
    expect(LABEL_GRID.columns).toBe(3);
    expect(LABEL_GRID.rows).toBe(7);
    expect(LABELS_PER_PAGE).toBe(21);
    const usedWidth = LABEL_GRID.columns * LABEL_GRID.labelWidth + (LABEL_GRID.columns - 1) * LABEL_GRID.gapX;
    expect(usedWidth).toBeLessThan(LABEL_GRID.pageWidth);
    expect(LABEL_GRID.rows * LABEL_GRID.labelHeight).toBeLessThan(LABEL_GRID.pageHeight);
  });
});
