import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { inputCls } from "./ui-bits";

export function BoxSelect({ value, onChange }: { value: number | null; onChange: (id: number | null) => void }) {
  const boxes = useLiveQuery(() => db.boxes.toArray()) ?? [];
  return (
    <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
      <option value="">Sin caja</option>
      {boxes.map((b) => <option key={b.id} value={b.id}>{b.code}{b.location ? ` · ${b.location}` : ""}</option>)}
    </select>
  );
}
