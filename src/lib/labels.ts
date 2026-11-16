export type LabelKind = "piece" | "bag" | "box";

export interface LabelItem {
  kind: LabelKind;
  id: number;
  code: string;
  title: string;
  subtitle: string;
}

export const LABEL_KIND_NAMES: Record<LabelKind, string> = {
  piece: "Pieza",
  bag: "Bolsa",
  box: "Caja",
};

export function labelPath(kind: LabelKind, id: number) {
  const section = kind === "piece" ? "piezas" : kind === "bag" ? "bolsas" : "cajas";
  return `/${section}/${id}`;
}

export function labelKey(item: Pick<LabelItem, "kind" | "id">) {
  return `${item.kind}:${item.id}`;
}

export function parseLabelUrl(value: string, origin: string): { kind: LabelKind; id: number } | null {
  try {
    const url = new URL(value);
    if (url.origin !== origin) return null;
    const match = /^\/(piezas|bolsas|cajas)\/(\d+)\/?$/.exec(url.pathname);
    if (!match) return null;
    return { kind: match[1] === "piezas" ? "piece" : match[1] === "bolsas" ? "bag" : "box", id: Number(match[2]) };
  } catch {
    return null;
  }
}

/** Medidas en puntos PDF: etiquetas de 63,5 × 38,1 mm, 21 por A4. */
export const LABEL_GRID = {
  pageWidth: 595.28,
  pageHeight: 841.89,
  columns: 3,
  rows: 7,
  labelWidth: 180,
  labelHeight: 108,
  gapX: 7.2,
} as const;

export const LABELS_PER_PAGE = LABEL_GRID.columns * LABEL_GRID.rows;
