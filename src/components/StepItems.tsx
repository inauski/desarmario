import { Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { MapPin } from "lucide-react";
import { db, type Step } from "@/lib/db";
import { PhotoView } from "@/components/Photo";
import { Code, StateBadge } from "@/components/ui-bits";

export function StepItems({ step, assembly = false }: { step: Step; assembly?: boolean }) {
  const pieces = useLiveQuery(() => db.pieces.bulkGet(step.pieceIds), [step.pieceIds]) ?? [];
  const bags = useLiveQuery(() => db.bags.bulkGet(step.bagIds), [step.bagIds]) ?? [];
  const boxes = useLiveQuery(() => db.boxes.toArray()) ?? [];
  const boxFor = (id: number | null) => boxes.find((box) => box.id === id);

  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">{assembly ? "Piezas que necesitas" : "Piezas afectadas"}</h3>
        <div className="space-y-2">
          {pieces.filter(Boolean).map((piece) => {
            const box = boxFor(piece!.boxId);
            return (
              <Link key={piece!.id} to="/piezas/$id" params={{ id: String(piece!.id) }} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 active:bg-muted">
                <PhotoView id={piece!.photoIds[0]} className="size-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><Code>{piece!.code}</Code><StateBadge state={piece!.state} /></div>
                  <p className="mt-1 truncate font-semibold">{piece!.name || "Sin nombre"}</p>
                  {assembly && <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" />{box ? `${box.code}${box.location ? ` · ${box.location}` : ""}` : "Sin caja asignada"}</p>}
                </div>
              </Link>
            );
          })}
          {!pieces.filter(Boolean).length && <p className="text-sm text-muted-foreground">Ninguna pieza vinculada.</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">{assembly ? "Bolsas que necesitas" : "Bolsas generadas"}</h3>
        <div className="space-y-2">
          {bags.filter(Boolean).map((bag) => {
            const box = boxFor(bag!.boxId);
            return (
              <Link key={bag!.id} to="/bolsas/$id" params={{ id: String(bag!.id) }} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 active:bg-muted">
                <PhotoView id={bag!.photoIds[0]} className="size-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <Code>{bag!.code}</Code>
                  <p className="mt-1 truncate font-semibold">{bag!.quantity} × {bag!.content || "Sin contenido"}</p>
                  {assembly && <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" />{box ? `${box.code}${box.location ? ` · ${box.location}` : ""}` : "Sin caja asignada"}</p>}
                </div>
              </Link>
            );
          })}
          {!bags.filter(Boolean).length && <p className="text-sm text-muted-foreground">Ninguna bolsa vinculada.</p>}
        </div>
      </section>
    </div>
  );
}
