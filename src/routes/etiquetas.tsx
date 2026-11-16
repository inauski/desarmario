import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, Download, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { LABEL_KIND_NAMES, labelKey, type LabelItem, type LabelKind } from "@/lib/labels";
import { QrCodeImage } from "@/components/QrCodeImage";
import { QrScannerDialog } from "@/components/QrScannerDialog";
import { btnPrimary, btnSecondary, Code, inputCls, Page } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/etiquetas")({
  head: () => ({
    meta: [
      { title: "Etiquetas QR — Desarmario" },
      { name: "description", content: "Selecciona piezas, bolsas y cajas para imprimir sus pegatinas QR en A4." },
      { property: "og:title", content: "Etiquetas QR — Desarmario" },
      { property: "og:description", content: "Genera pegatinas con código y QR, y escanéalas para abrir cada ficha." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LabelsPage,
});

type Filter = LabelKind | "all";

function LabelsPage() {
  const nav = useNavigate();
  const pieces = useLiveQuery(() => db.pieces.orderBy("code").toArray()) ?? [];
  const bags = useLiveQuery(() => db.bags.orderBy("code").toArray()) ?? [];
  const boxes = useLiveQuery(() => db.boxes.orderBy("code").toArray()) ?? [];
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scannerOpen, setScannerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const boxLabel = (id: number | null) => {
    const box = boxes.find((candidate) => candidate.id === id);
    return box ? `${box.code}${box.location ? ` · ${box.location}` : ""}` : "Sin caja";
  };
  const items: LabelItem[] = [
    ...pieces.map((piece): LabelItem => ({ kind: "piece", id: piece.id!, code: piece.code, title: piece.name, subtitle: boxLabel(piece.boxId) })),
    ...bags.map((bag): LabelItem => ({ kind: "bag", id: bag.id!, code: bag.code, title: bag.content, subtitle: `${bag.quantity} unidades · ${boxLabel(bag.boxId)}` })),
    ...boxes.map((box): LabelItem => ({ kind: "box", id: box.id!, code: box.code, title: box.location || "Caja sin ubicación", subtitle: `${pieces.filter((piece) => piece.boxId === box.id).length} piezas · ${bags.filter((bag) => bag.boxId === box.id).length} bolsas` })),
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const visible = items.filter((item) => (filter === "all" || item.kind === filter) && (!normalizedQuery || `${item.code} ${item.title} ${item.subtitle}`.toLowerCase().includes(normalizedQuery)));
  const selectedItems = items.filter((item) => selected.has(labelKey(item)));

  function toggle(item: LabelItem) {
    const key = labelKey(item);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  async function downloadPdf() {
    if (!selectedItems.length) return;
    setBusy(true);
    try {
      const { generateLabelsPdf } = await import("@/lib/labels-pdf");
      const bytes = await generateLabelsPdf(selectedItems, window.location.origin);
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      const url = URL.createObjectURL(new Blob([copy.buffer], { type: "application/pdf" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "etiquetas-armario.pdf";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success(`${selectedItems.length} etiquetas preparadas en PDF`);
    } catch {
      toast.error("No se pudo crear el PDF. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  const openFound = useCallback(({ kind, id }: { kind: LabelKind; id: number }) => {
    setScannerOpen(false);
    if (kind === "piece") nav({ to: "/piezas/$id", params: { id: String(id) } });
    else if (kind === "bag") nav({ to: "/bolsas/$id", params: { id: String(id) } });
    else nav({ to: "/cajas/$id", params: { id: String(id) } });
  }, [nav]);

  return (
    <Page title="Etiquetas" back action={<button type="button" aria-label="Escanear QR" onClick={() => setScannerOpen(true)} className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"><ScanLine /></button>}>
      <div className="mb-5 rounded-3xl bg-foreground p-4 text-background">
        <p className="text-sm opacity-70">A4 adhesivo · 3 columnas × 7 filas</p>
        <p className="mt-1 font-display text-2xl font-extrabold">{selected.size} seleccionadas</p>
        <div className="mt-4 grid gap-2">
          <button type="button" className={btnPrimary} disabled={!selectedItems.length || busy} onClick={downloadPdf}><Download />{busy ? "Creando PDF…" : "Generar PDF para imprimir"}</button>
          <button type="button" className={cn(btnSecondary, "border-background/30 bg-background/10 text-background")} onClick={() => setScannerOpen(true)}><ScanLine /> Escanear QR</button>
        </div>
      </div>

      <input className={inputCls} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar código, nombre o ubicación" aria-label="Buscar etiquetas" />
      <div className="my-3 flex gap-2 overflow-x-auto pb-1">
        {(["all", "piece", "bag", "box"] as Filter[]).map((value) => (
          <button type="button" key={value} onClick={() => setFilter(value)} className={cn("min-h-12 shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold", filter === value ? "border-foreground bg-foreground text-background" : "border-border")}>
            {value === "all" ? "Todas" : `${LABEL_KIND_NAMES[value]}s`}
          </button>
        ))}
      </div>
      <div className="mb-3 flex gap-2">
        <button type="button" className="min-h-12 flex-1 text-sm font-bold text-primary" onClick={() => setSelected((current) => new Set([...current, ...visible.map(labelKey)]))}>Seleccionar visibles</button>
        <button type="button" className="min-h-12 flex-1 text-right text-sm font-bold text-muted-foreground" onClick={() => setSelected(new Set())}>Quitar selección</button>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        {visible.map((item) => {
          const isSelected = selected.has(labelKey(item));
          return (
            <button type="button" key={labelKey(item)} aria-pressed={isSelected} onClick={() => toggle(item)} className={cn("relative flex items-center gap-3 rounded-2xl border-2 bg-card p-3 text-left active:bg-muted", isSelected ? "border-primary bg-secondary" : "border-border")}>
              <QrCodeImage item={item} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{LABEL_KIND_NAMES[item.kind]}</p>
                <Code className="mt-1">{item.code}</Code>
                <p className="mt-2 line-clamp-2 text-sm font-bold">{item.title || "Sin nombre"}</p>
              </div>
              <span className={cn("absolute right-2 top-2 grid size-6 place-items-center rounded-full border-2", isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")} aria-hidden>{isSelected && <Check className="size-4" />}</span>
            </button>
          );
        })}
      </div>
      {!items.length && <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center"><p className="mb-3 text-muted-foreground">Crea una pieza, bolsa o caja para generar su primera etiqueta.</p><Link to="/alta" className="font-bold text-primary">Ir a alta rápida</Link></div>}
      {!!items.length && !visible.length && <p className="py-8 text-center text-muted-foreground">Ningún elemento coincide con la búsqueda.</p>}

      <QrScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onFound={openFound} />
    </Page>
  );
}
