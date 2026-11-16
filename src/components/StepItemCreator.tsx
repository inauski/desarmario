import { useEffect, useState } from "react";
import { Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { peekCode } from "@/lib/db";
import { createBagForStep, createPieceForStep } from "@/lib/steps";
import { BoxSelect } from "@/components/BoxSelect";
import { PhotoPicker } from "@/components/Photo";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { btnPrimary, btnSecondary, Code, Field, inputCls } from "@/components/ui-bits";

type Kind = "piece" | "bag";

export function StepItemCreator({ stepId }: { stepId: number }) {
  const [kind, setKind] = useState<Kind | null>(null);
  const [code, setCode] = useState("");
  const [text, setText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [photos, setPhotos] = useState<number[]>([]);
  const [boxId, setBoxId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!kind) return;
    setText("");
    setQuantity(1);
    setPhotos([]);
    setBoxId(null);
    peekCode(kind === "piece" ? "P" : "B").then(setCode);
  }, [kind]);

  async function save() {
    if (!kind || !text.trim()) return;
    setSaving(true);
    try {
      if (kind === "piece") {
        await createPieceForStep(stepId, { name: text.trim(), photoIds: photos, boxId });
        toast.success(`Pieza ${code} creada y añadida al paso`);
      } else {
        await createBagForStep(stepId, { content: text.trim(), quantity, photoIds: photos, boxId });
        toast.success(`Bolsa ${code} creada y añadida al paso`);
      }
      setKind(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-primary p-3">
      <p className="mb-3 text-sm font-semibold">¿Qué ha salido en este paso?</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={btnSecondary} onClick={() => setKind("piece")}><Package className="size-5" /> Crear pieza</button>
        <button type="button" className={btnSecondary} onClick={() => setKind("bag")}><ShoppingBag className="size-5" /> Crear bolsa</button>
      </div>

      <Dialog open={kind !== null} onOpenChange={(open) => !open && setKind(null)}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl p-5">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2 pr-8 text-xl">Nueva {kind === "bag" ? "bolsa" : "pieza"} <Code>{code}</Code></DialogTitle>
            <DialogDescription>Se añadirá a este paso sin salir de la pantalla.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Foto" group><PhotoPicker value={photos} onChange={setPhotos} /></Field>
            <Field label={kind === "bag" ? "Contenido" : "Nombre"}>
              <input autoFocus className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder={kind === "bag" ? "Ej. 8 tornillos 4×30" : "Ej. Lateral izquierdo"} />
            </Field>
            {kind === "bag" && (
              <Field label="Cantidad"><input type="number" min="0" inputMode="numeric" className={inputCls} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 0)} /></Field>
            )}
            <Field label="Caja (opcional)" group><BoxSelect value={boxId} onChange={setBoxId} /></Field>
            <button type="button" className={btnPrimary} disabled={saving || !text.trim()} onClick={save}>Guardar y añadir al paso</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
