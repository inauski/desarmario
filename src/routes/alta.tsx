import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db, nextCode, peekCode } from "@/lib/db";
import { PhotoPicker } from "@/components/Photo";
import { BoxSelect } from "@/components/BoxSelect";
import { btnPrimary, btnSecondary, Code, Field, inputCls, Page } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

type Kind = "P" | "B" | "C";
const LABEL: Record<Kind, string> = { P: "Pieza", B: "Bolsa", C: "Caja" };

export const Route = createFileRoute("/alta")({
  validateSearch: (search: Record<string, unknown>): { foto?: number } => {
    const foto = search["foto"];
    return typeof foto === "number" && Number.isInteger(foto) && foto > 0 ? { foto } : {};
  },
  head: () => ({ meta: [{ title: "Alta rápida — Armario" }, { name: "description", content: "Foto, código y guardar en segundos." }, { property: "og:title", content: "Alta rápida — Armario" }, { property: "og:description", content: "Foto, código y guardar en segundos." }] }),
  component: QuickAdd,
});

function QuickAdd() {
  const nav = useNavigate();
  const { foto } = Route.useSearch();
  const [kind, setKind] = useState<Kind>("P");
  const [code, setCode] = useState("");
  const [photos, setPhotos] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [boxId, setBoxId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { peekCode(kind).then(setCode); }, [kind, saving]);
  useEffect(() => {
    if (foto) setPhotos((current) => current.includes(foto) ? current : [...current, foto]);
  }, [foto]);

  async function save(another: boolean) {
    setSaving(true);
    try {
      const c = await nextCode(kind);
      const now = Date.now();
      let id: number;
      if (kind === "P") id = await db.pieces.add({ code: c, name: text, photoIds: photos, measures: "", orientation: "", notes: "", state: boxId ? "guardada" : "desmontada", boxId, createdAt: now });
      else if (kind === "B") id = await db.bags.add({ code: c, content: text, quantity: 1, photoIds: photos, jointId: null, boxId, createdAt: now });
      else id = await db.boxes.add({ code: c, location: text, photoIds: photos, createdAt: now });
      toast.success(`${LABEL[kind]} ${c} guardada`);
      setPhotos([]); setText("");
      if (!another) nav({ to: kind === "P" ? "/piezas/$id" : kind === "B" ? "/bolsas/$id" : "/cajas/$id", params: { id: String(id) } });
    } finally { setSaving(false); }
  }

  return (
    <Page title="Alta rápida" back>
      <div className="mb-5 grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
        {(Object.keys(LABEL) as Kind[]).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cn("h-12 rounded-xl font-bold", kind === k ? "bg-card shadow-sm" : "text-muted-foreground")}>{LABEL[k]}</button>
        ))}
      </div>
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">Código para la pegatina</span>
        <Code className="text-2xl">{code}</Code>
      </div>
      <div className="space-y-5">
        <PhotoPicker value={photos} onChange={setPhotos} />
        <Field label={kind === "P" ? "Nombre" : kind === "B" ? "Contenido" : "Ubicación"}>
          <input className={inputCls} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={kind === "P" ? "Ej. Lateral izquierdo" : kind === "B" ? "6 tornillos 4x30" : "Ej. Trastero"} />
        </Field>
        {kind !== "C" && <Field label="Caja (opcional)" group><BoxSelect value={boxId} onChange={setBoxId} /></Field>}
        <button className={btnPrimary} disabled={saving} onClick={() => save(false)}>Guardar {code}</button>
        <button className={cn(btnSecondary, "w-full")} disabled={saving} onClick={() => save(true)}>Guardar y añadir otra</button>
      </div>
    </Page>
  );
}
