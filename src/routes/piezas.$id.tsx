import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trash2 } from "lucide-react";
import { JointList } from "@/components/JointList";
import { db, PIECE_STATES, type Piece } from "@/lib/db";
import { PhotoPicker } from "@/components/Photo";
import { BoxSelect } from "@/components/BoxSelect";
import { Code, Field, inputCls, Page } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/piezas/$id")({
  head: () => ({ meta: [{ title: "Ficha de pieza — Armario" }, { name: "description", content: "Fotos, orientación, notas y ubicación de la pieza." }, { property: "og:title", content: "Ficha de pieza — Armario" }, { property: "og:description", content: "Fotos, orientación, notas y ubicación de la pieza." }] }),
  component: PieceDetail,
});

function PieceDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const piece = useLiveQuery(() => db.pieces.get(Number(id)), [id]);
  const box = useLiveQuery(() => (piece?.boxId ? db.boxes.get(piece.boxId) : undefined), [piece?.boxId]);
  if (!piece) return <Page title="Pieza" back><p className="text-muted-foreground">Cargando…</p></Page>;
  const set = (patch: Partial<Piece>) => db.pieces.update(piece.id!, patch);

  return (
    <Page title={piece.name || "Pieza"} back action={<Code className="text-lg">{piece.code}</Code>}>
      <div className="space-y-5">
        {box && <div className="rounded-2xl bg-success p-4 font-bold text-success-foreground">Guardada en caja <Code>{box.code}</Code> {box.location && `· ${box.location}`}</div>}
        <PhotoPicker value={piece.photoIds} onChange={(photoIds) => set({ photoIds })} />
        <Field group label="Estado">
          <div className="grid grid-cols-3 gap-2">
            {PIECE_STATES.map((s) => (
              <button key={s} onClick={() => set({ state: s })} className={cn("h-12 rounded-xl border-2 font-bold capitalize", piece.state === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>{s}</button>
            ))}
          </div>
        </Field>
        <Field label="Caja" group><BoxSelect value={piece.boxId} onChange={(boxId) => set({ boxId, ...(boxId ? { state: "guardada" as const } : {}) })} /></Field>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Uniones</span>
            <button className="flex items-center gap-1 rounded-xl border-2 border-primary px-3 py-2 text-sm font-bold text-primary" onClick={async () => {
              const jid = await db.joints.add({ pieceIds: [piece.id!], type: "tornillo", quantity: 1, photoIds: [], notes: "", bagId: null, createdAt: Date.now() });
              nav({ to: "/uniones/$id", params: { id: String(jid) } });
            }}><Plus className="size-4" /> Nueva unión</button>
          </div>
          <JointList pieceId={piece.id!} />
        </div>
        <Field label="Nombre"><input className={inputCls} defaultValue={piece.name} onBlur={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Medidas"><input className={inputCls} defaultValue={piece.measures} placeholder="Ej. 180 x 50 cm" onBlur={(e) => set({ measures: e.target.value })} /></Field>
        <Field label="Orientación"><textarea className={inputCls} rows={2} defaultValue={piece.orientation} placeholder="Cuál es arriba, frente, cara vista" onBlur={(e) => set({ orientation: e.target.value })} /></Field>
        <Field label="Notas"><textarea className={inputCls} rows={3} defaultValue={piece.notes} onBlur={(e) => set({ notes: e.target.value })} /></Field>
        <button onClick={async () => { if (confirm(`¿Borrar ${piece.code}?`)) { await db.joints.where("pieceIds").equals(piece.id!).modify((j) => { j.pieceIds = j.pieceIds.filter((x) => x !== piece.id); }); await db.pieces.delete(piece.id!); nav({ to: "/piezas" }); } }}
          className="flex w-full items-center justify-center gap-2 py-3 font-semibold text-destructive"><Trash2 className="size-4" /> Borrar pieza</button>
      </div>
    </Page>
  );
}
