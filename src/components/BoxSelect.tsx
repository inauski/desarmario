import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { db, createBox } from "@/lib/db";
import { inputCls } from "./ui-bits";

const NEW_BOX = "__new";

/** Caja: si aún no hay ninguna, botón para crearla en vez de un desplegable vacío. */
export function BoxSelect({ value, onChange }: { value: number | null; onChange: (id: number | null) => void }) {
  const boxes = useLiveQuery(() => db.boxes.toArray()) ?? [];

  async function create() {
    const answer = prompt("Ubicación de la caja (opcional). Ej. Trastero");
    if (answer === null) return;
    const { id, code } = await createBox(answer.trim());
    onChange(id);
    toast.success(`Caja ${code} creada`);
  }

  if (!boxes.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border p-3">
        <p className="mb-2 text-sm text-muted-foreground">Aún no hay cajas donde guardar esto.</p>
        <button type="button" onClick={create} className="inline-flex min-h-14 items-center gap-2 rounded-xl border-2 border-primary px-4 font-bold text-primary active:scale-[0.98]">
          <Plus className="size-4" /> Crear caja
        </button>
      </div>
    );
  }

  return (
    <select
      className={inputCls}
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        if (v === NEW_BOX) {
          e.currentTarget.value = value === null ? "" : String(value);
          create();
          return;
        }
        onChange(v ? Number(v) : null);
      }}
    >
      <option value="">Sin caja</option>
      {boxes.map((b) => <option key={b.id} value={b.id}>{b.code}{b.location ? ` · ${b.location}` : ""}</option>)}
      <option value={NEW_BOX}>+ Crear caja nueva</option>
    </select>
  );
}
