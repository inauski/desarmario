import { Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db, jointLabel } from "@/lib/db";
import { PhotoView } from "./Photo";
import { Code } from "./ui-bits";

export function JointList({ pieceId }: { pieceId: number }) {
  const joints = useLiveQuery(() => db.joints.where("pieceIds").equals(pieceId).toArray(), [pieceId]) ?? [];
  const pieces = useLiveQuery(() => db.pieces.toArray()) ?? [];
  const bags = useLiveQuery(() => db.bags.toArray()) ?? [];
  if (!joints.length) return <p className="text-sm text-muted-foreground">Sin uniones todavía.</p>;
  return (
    <div className="space-y-2">
      {joints.map((j) => {
        const bag = bags.find((b) => b.id === j.bagId);
        return (
          <div key={j.id} className="rounded-2xl border-2 border-border bg-card p-3">
            <Link to="/uniones/$id" params={{ id: String(j.id) }} className="flex items-center gap-3">
              <PhotoView id={j.photoIds[0]} className="size-12 shrink-0 rounded-lg" />
              <div className="flex-1"><Code>{jointLabel(j.id)}</Code> <span className="font-bold capitalize">{j.quantity} × {j.type}</span></div>
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Con:</span>
              {j.pieceIds.filter((id) => id !== pieceId).map((id) => {
                const p = pieces.find((x) => x.id === id);
                return p ? <Link key={id} to="/piezas/$id" params={{ id: String(id) }} className="underline"><span className="font-mono font-bold">{p.code}</span> {p.name}</Link> : null;
              })}
              {bag && <Link to="/bolsas/$id" params={{ id: String(bag.id) }} className="ml-auto"><Code>{bag.code}</Code></Link>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
