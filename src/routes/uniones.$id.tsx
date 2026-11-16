import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trash2 } from "lucide-react";
import { createBagForJoint, db, deleteJoint, JOINT_TYPES, jointLabel, linkBag, type Joint } from "@/lib/db";
import { PhotoPicker } from "@/components/Photo";
import { btnPrimary, Code, Field, inputCls, Page } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/uniones/$id")({
  head: () => ({ meta: [{ title: "Unión — Armario" }, { name: "description", content: "Piezas que une, fijación, cantidad y bolsa asociada." }, { property: "og:title", content: "Unión — Armario" }, { property: "og:description", content: "Piezas que une, fijación, cantidad y bolsa asociada." }] }),
  component: JointDetail,
});

function JointDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const joint = useLiveQuery(() => db.joints.get(Number(id)), [id]);
  const pieces = useLiveQuery(() => db.pieces.orderBy("code").toArray()) ?? [];
  const bags = useLiveQuery(() => db.bags.orderBy("code").toArray()) ?? [];
  if (!joint) return <Page title="Unión" back><p className="text-muted-foreground">Cargando…</p></Page>;
  const set = (patch: Partial<Joint>) => db.joints.update(joint.id!, patch);
  const bag = bags.find((b) => b.id === joint.bagId);
  const toggle = (pid: number) => set({ pieceIds: joint.pieceIds.includes(pid) ? joint.pieceIds.filter((x) => x !== pid) : [...joint.pieceIds, pid] });

  return (
    <Page title="Unión" back action={<Code className="text-lg">{jointLabel(joint.id)}</Code>}>
      <div className="space-y-5">
        <Field group label={`Piezas que une (${joint.pieceIds.length})`}>
          {joint.pieceIds.length < 2 && <p className="mb-2 text-sm font-semibold text-destructive">Selecciona al menos 2 piezas</p>}
          <div className="flex flex-wrap gap-2">
            {pieces.map((p) => (
              <button key={p.id} type="button" onClick={() => toggle(p.id!)}
                className={cn("min-h-12 rounded-xl border-2 px-4 py-2 text-left text-sm", joint.pieceIds.includes(p.id!) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
                <span className="font-mono font-bold">{p.code}</span> {p.name}
              </button>
            ))}
          </div>
        </Field>
        <Field group label="Tipo de fijación">
          <div className="grid grid-cols-3 gap-2">
            {JOINT_TYPES.map((t) => (
              <button key={t} type="button" onClick={() => set({ type: t })} className={cn("min-h-14 rounded-xl border-2 px-2 font-bold capitalize", joint.type === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>{t}</button>
            ))}
          </div>
        </Field>
        <Field label="Cantidad"><input type="number" inputMode="numeric" className={inputCls} defaultValue={joint.quantity} onBlur={(e) => set({ quantity: Number(e.target.value) || 0 })} /></Field>
        <Field group label="Foto de detalle"><PhotoPicker value={joint.photoIds} onChange={(photoIds) => set({ photoIds })} /></Field>
        <Field label="Notas"><textarea className={inputCls} rows={3} defaultValue={joint.notes} onBlur={(e) => set({ notes: e.target.value })} /></Field>
        <Field group label="Bolsa asociada">
          {bag ? (
            <Link to="/bolsas/$id" params={{ id: String(bag.id) }} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3">
              <Code>{bag.code}</Code><span className="flex-1 truncate text-sm">{bag.content}</span>
            </Link>
          ) : (
            <button className={btnPrimary} onClick={async () => { const bid = await createBagForJoint(joint.id!); nav({ to: "/bolsas/$id", params: { id: String(bid) } }); }}>
              <Plus /> Crear bolsa
            </button>
          )}
          <select className={cn(inputCls, "mt-2")} value={joint.bagId ?? ""} onChange={(e) => linkBag(joint.id!, e.target.value ? Number(e.target.value) : null)}>
            <option value="">Sin bolsa</option>
            {bags.map((b) => <option key={b.id} value={b.id}>{b.code} · {b.content}</option>)}
          </select>
        </Field>
        <button onClick={async () => { if (confirm(`¿Borrar ${jointLabel(joint.id)}?`)) { await deleteJoint(joint.id!); history.back(); } }}
          className="flex w-full items-center justify-center gap-2 py-3 font-semibold text-destructive"><Trash2 className="size-4" /> Borrar unión</button>
      </div>
    </Page>
  );
}
