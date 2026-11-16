import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { PhotoPicker, PhotoView } from "@/components/Photo";
import { Code, Field, inputCls, ListLink, Page, StateBadge } from "@/components/ui-bits";

export const Route = createFileRoute("/cajas/$id")({
  head: () => ({ meta: [{ title: "Caja — Armario" }, { name: "description", content: "Piezas y bolsas guardadas en esta caja." }, { property: "og:title", content: "Caja — Armario" }, { property: "og:description", content: "Piezas y bolsas guardadas en esta caja." }] }),
  component: BoxDetail,
});

function BoxDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const box = useLiveQuery(() => db.boxes.get(Number(id)), [id]);
  const pieces = useLiveQuery(() => db.pieces.where("boxId").equals(Number(id)).toArray(), [id]) ?? [];
  const bags = useLiveQuery(() => db.bags.where("boxId").equals(Number(id)).toArray(), [id]) ?? [];
  if (!box) return <Page title="Caja" back><p className="text-muted-foreground">Cargando…</p></Page>;
  return (
    <Page title="Caja" back action={<Code className="text-lg">{box.code}</Code>}>
      <div className="space-y-5">
        <PhotoPicker value={box.photoIds} onChange={(photoIds) => db.boxes.update(box.id!, { photoIds })} />
        <Field label="Ubicación"><input className={inputCls} defaultValue={box.location} placeholder="Ej. trastero, estantería 2" onBlur={(e) => db.boxes.update(box.id!, { location: e.target.value })} /></Field>
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Piezas ({pieces.length})</h2>
        <div className="space-y-2">
          {pieces.map((p) => (
            <ListLink key={p.id} to="/piezas/$id" params={{ id: String(p.id) }}>
              <PhotoView id={p.photoIds[0]} className="size-12 rounded-lg" />
              <div className="flex-1"><Code>{p.code}</Code> <span className="font-semibold">{p.name}</span></div>
              <StateBadge state={p.state} />
            </ListLink>
          ))}
        </div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Bolsas ({bags.length})</h2>
        <div className="space-y-2">
          {bags.map((b) => (
            <ListLink key={b.id} to="/bolsas/$id" params={{ id: String(b.id) }}>
              <PhotoView id={b.photoIds[0]} className="size-12 rounded-lg" />
              <div className="flex-1"><Code>{b.code}</Code> <span className="text-sm">{b.content}</span></div>
            </ListLink>
          ))}
        </div>
        <button onClick={async () => {
          if (!confirm(`¿Borrar ${box.code}? Su contenido quedará sin caja.`)) return;
          await db.pieces.where("boxId").equals(box.id!).modify({ boxId: null });
          await db.bags.where("boxId").equals(box.id!).modify({ boxId: null });
          await db.boxes.delete(box.id!); nav({ to: "/cajas" });
        }} className="flex w-full items-center justify-center gap-2 py-3 font-semibold text-destructive"><Trash2 className="size-4" /> Borrar caja</button>
      </div>
    </Page>
  );
}
