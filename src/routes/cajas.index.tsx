import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db } from "@/lib/db";
import { PhotoView } from "@/components/Photo";
import { Code, inputCls, ListLink, Page } from "@/components/ui-bits";

export const Route = createFileRoute("/cajas/")({
  head: () => ({ meta: [{ title: "Cajas y bolsas — Armario" }, { name: "description", content: "Qué hay en cada caja y cada bolsa." }, { property: "og:title", content: "Cajas y bolsas — Armario" }, { property: "og:description", content: "Qué hay en cada caja y cada bolsa." }] }),
  component: Boxes,
});

function Boxes() {
  const [q, setQ] = useState("");
  const boxes = useLiveQuery(() => db.boxes.toArray()) ?? [];
  const bags = useLiveQuery(() => db.bags.orderBy("code").toArray()) ?? [];
  const pieces = useLiveQuery(() => db.pieces.toArray()) ?? [];
  const s = q.trim().toLowerCase();
  const m = (...t: string[]) => !s || t.some((x) => x.toLowerCase().includes(s));
  const boxCode = (id: number | null) => boxes.find((b) => b.id === id)?.code;

  return (
    <Page title="Cajas y bolsas" back>
      <input className={inputCls} aria-label="Buscar cajas y bolsas" placeholder="Buscar código, ubicación o contenido" value={q} onChange={(e) => setQ(e.target.value)} />
      <h2 className="mb-2 mt-5 text-sm font-bold uppercase tracking-widest text-muted-foreground">Cajas</h2>
      <div className="space-y-2">
        {boxes.filter((b) => m(b.code, b.location)).map((b) => (
          <ListLink key={b.id} to="/cajas/$id" params={{ id: String(b.id) }}>
            <PhotoView id={b.photoIds[0]} className="size-14 shrink-0 rounded-xl" />
            <div className="flex-1"><Code>{b.code}</Code><p className="mt-1 text-sm text-muted-foreground">{b.location || "Sin ubicación"}</p></div>
            <p className="text-right text-xs text-muted-foreground">{pieces.filter((p) => p.boxId === b.id).length} piezas<br />{bags.filter((x) => x.boxId === b.id).length} bolsas</p>
          </ListLink>
        ))}
        {!boxes.length && <p className="py-4 text-muted-foreground">Aún no hay cajas.</p>}
      </div>
      <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Bolsas</h2>
      <div className="space-y-2">
        {bags.filter((b) => m(b.code, b.content)).map((b) => (
          <ListLink key={b.id} to="/bolsas/$id" params={{ id: String(b.id) }}>
            <PhotoView id={b.photoIds[0]} className="size-14 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1"><Code>{b.code}</Code><p className="mt-1 truncate text-sm">{b.content || "Sin contenido"}</p></div>
            <span className="text-xs font-bold text-muted-foreground">{boxCode(b.boxId) ?? "Sin caja"}</span>
          </ListLink>
        ))}
        {!bags.length && <p className="py-4 text-muted-foreground">Aún no hay bolsas.</p>}
      </div>
    </Page>
  );
}
