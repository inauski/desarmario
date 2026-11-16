import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db, PIECE_STATES, type PieceState } from "@/lib/db";
import { PhotoView } from "@/components/Photo";
import { Code, inputCls, ListLink, Page, StateBadge } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/piezas/")({
  head: () => ({ meta: [{ title: "Piezas — Armario" }, { name: "description", content: "Todas las piezas del armario con estado y caja." }, { property: "og:title", content: "Piezas — Armario" }, { property: "og:description", content: "Todas las piezas del armario con estado y caja." }] }),
  component: Pieces,
});

function Pieces() {
  const [q, setQ] = useState("");
  const [state, setState] = useState<PieceState | "">("");
  const [box, setBox] = useState("");
  const pieces = useLiveQuery(() => db.pieces.orderBy("code").toArray()) ?? [];
  const boxes = useLiveQuery(() => db.boxes.toArray()) ?? [];
  const boxCode = (id: number | null) => boxes.find((b) => b.id === id)?.code;
  const s = q.trim().toLowerCase();
  const list = pieces.filter((p) =>
    (!s || p.code.toLowerCase().includes(s) || p.name.toLowerCase().includes(s)) &&
    (!state || p.state === state) && (!box || String(p.boxId) === box));

  return (
    <Page title="Piezas" back>
      <input className={inputCls} placeholder="Buscar por código o nombre" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="my-3 flex gap-2 overflow-x-auto pb-1">
        {(["", ...PIECE_STATES] as const).map((st) => (
          <button key={st} onClick={() => setState(st)} className={cn("shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold capitalize", state === st ? "border-foreground bg-foreground text-background" : "border-border")}>
            {st || "Todas"}
          </button>
        ))}
        {boxes.length > 0 && (
          <select value={box} onChange={(e) => setBox(e.target.value)} className="shrink-0 rounded-full border-2 border-border bg-card px-3 text-sm font-bold">
            <option value="">Cualquier caja</option>
            {boxes.map((b) => <option key={b.id} value={b.id}>{b.code}</option>)}
          </select>
        )}
      </div>
      <div className="space-y-2">
        {list.map((p) => (
          <ListLink key={p.id} to="/piezas/$id" params={{ id: String(p.id) }}>
            <PhotoView id={p.photoIds[0]} className="size-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><Code>{p.code}</Code><StateBadge state={p.state} /></div>
              <p className="mt-1 truncate font-semibold">{p.name || "Sin nombre"}</p>
              {boxCode(p.boxId) && <p className="text-xs text-muted-foreground">En caja {boxCode(p.boxId)}</p>}
            </div>
          </ListLink>
        ))}
        {!list.length && <p className="py-10 text-center text-muted-foreground">No hay piezas. Usa el botón de cámara para añadir una.</p>}
      </div>
    </Page>
  );
}
