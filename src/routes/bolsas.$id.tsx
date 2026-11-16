import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { db, jointLabel, type Bag } from "@/lib/db";
import { PhotoPicker } from "@/components/Photo";
import { BoxSelect } from "@/components/BoxSelect";
import { Code, Field, inputCls, Page } from "@/components/ui-bits";

export const Route = createFileRoute("/bolsas/$id")({
  head: () => ({ meta: [{ title: "Bolsa — Armario" }, { name: "description", content: "Contenido y caja de la bolsa de herrajes." }, { property: "og:title", content: "Bolsa — Armario" }, { property: "og:description", content: "Contenido y caja de la bolsa de herrajes." }] }),
  component: BagDetail,
});

function BagDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const bag = useLiveQuery(() => db.bags.get(Number(id)), [id]);
  const box = useLiveQuery(() => (bag?.boxId ? db.boxes.get(bag.boxId) : undefined), [bag?.boxId]);
  const joint = useLiveQuery(() => (bag?.jointId ? db.joints.get(bag.jointId) : undefined), [bag?.jointId]);
  const jPieces = useLiveQuery(() => (joint ? db.pieces.bulkGet(joint.pieceIds) : []), [joint]) ?? [];
  if (!bag) return <Page title="Bolsa" back><p className="text-muted-foreground">Cargando…</p></Page>;
  const set = (patch: Partial<Bag>) => db.bags.update(bag.id!, patch);
  return (
    <Page title="Bolsa" back action={<Code className="text-lg">{bag.code}</Code>}>
      <div className="space-y-5">
        {box && <div className="rounded-2xl bg-success p-4 font-bold text-success-foreground">En caja <Code>{box.code}</Code> {box.location && `· ${box.location}`}</div>}
        {joint ? (
          <Link to="/uniones/$id" params={{ id: String(joint.id) }} className="block rounded-2xl border-2 border-primary bg-card p-4">
            <p className="text-sm font-semibold text-muted-foreground">Pertenece a la unión</p>
            <p className="mt-1"><Code>{jointLabel(joint.id)}</Code> <span className="font-bold capitalize">{joint.quantity} × {joint.type}</span></p>
            <p className="mt-1 text-sm">{jPieces.filter(Boolean).map((p) => p!.code).join(" + ")}</p>
          </Link>
        ) : <p className="text-sm text-muted-foreground">No pertenece a ninguna unión.</p>}
        <PhotoPicker value={bag.photoIds} onChange={(photoIds) => set({ photoIds })} />
        <Field label="Contenido"><textarea className={inputCls} rows={2} defaultValue={bag.content} placeholder="6 tornillos 4x30 + 6 arandelas" onBlur={(e) => set({ content: e.target.value })} /></Field>
        <Field label="Cantidad"><input type="number" inputMode="numeric" className={inputCls} defaultValue={bag.quantity} onBlur={(e) => set({ quantity: Number(e.target.value) || 0 })} /></Field>
        <Field label="Caja"><BoxSelect value={bag.boxId} onChange={(boxId) => set({ boxId })} /></Field>
        <button onClick={async () => { if (confirm(`¿Borrar ${bag.code}?`)) { if (bag.jointId) await db.joints.update(bag.jointId, { bagId: null }); await db.bags.delete(bag.id!); nav({ to: "/cajas" }); } }}
          className="flex w-full items-center justify-center gap-2 py-3 font-semibold text-destructive"><Trash2 className="size-4" /> Borrar bolsa</button>
      </div>
    </Page>
  );
}
