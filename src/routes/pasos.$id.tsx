import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import { db, type Step } from "@/lib/db";
import { deleteStep } from "@/lib/steps";
import { PhotoPicker } from "@/components/Photo";
import { StepItemCreator } from "@/components/StepItemCreator";
import { Code, Field, inputCls, Page } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pasos/$id")({
  head: () => ({
    meta: [
      { title: "Editar paso — Armario" },
      { name: "description", content: "Foto, herramientas, piezas y bolsas de un paso del armario." },
      { property: "og:title", content: "Editar paso — Armario" },
      { property: "og:description", content: "Prepara lo que necesitas para desmontar y volver a montar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StepDetail,
});

function StepDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const step = useLiveQuery(() => db.steps.get(Number(id)), [id]);
  const pieces = useLiveQuery(() => db.pieces.orderBy("code").toArray()) ?? [];
  const bags = useLiveQuery(() => db.bags.orderBy("code").toArray()) ?? [];
  if (!step) return <Page title="Paso" back><p className="text-muted-foreground">Cargando…</p></Page>;
  const set = (patch: Partial<Step>) => db.steps.update(step.id!, patch);
  const toggle = (field: "pieceIds" | "bagIds", itemId: number) => {
    const ids = step[field];
    set({ [field]: ids.includes(itemId) ? ids.filter((value) => value !== itemId) : [...ids, itemId] });
  };

  return (
    <Page title={step.title || "Paso"} back action={<Code>Paso {step.order}</Code>}>
      <div className="space-y-5">
        <Field label="Título"><input className={inputCls} defaultValue={step.title} onBlur={(e) => set({ title: e.target.value })} /></Field>
        <Field label="Descripción"><textarea className={inputCls} rows={3} defaultValue={step.description} placeholder="Qué aflojar, en qué orden y qué vigilar" onBlur={(e) => set({ description: e.target.value })} /></Field>
        <Field label="Foto del estado original" group><PhotoPicker value={step.photoIds} onChange={(photoIds) => set({ photoIds })} /></Field>
        <Field label="Herramientas">
          <input className={inputCls} defaultValue={step.tools.join(", ")} placeholder="Destornillador, llave Allen nº 4" onBlur={(e) => set({ tools: e.target.value.split(",").map((tool) => tool.trim()).filter(Boolean) })} />
        </Field>

        <Field group label={`Piezas afectadas (${step.pieceIds.length})`}>
          <div className="flex flex-wrap gap-2">
            {pieces.map((piece) => (
              <button type="button" key={piece.id} onClick={() => toggle("pieceIds", piece.id!)} className={cn("min-h-12 rounded-xl border-2 px-4 py-2 text-left text-sm", step.pieceIds.includes(piece.id!) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
                <span className="font-mono font-bold">{piece.code}</span> {piece.name}
              </button>
            ))}
          </div>
          {!pieces.length && <p className="text-sm text-muted-foreground">Todavía no hay piezas.</p>}
        </Field>

        <Field group label={`Bolsas generadas (${step.bagIds.length})`}>
          <div className="flex flex-wrap gap-2">
            {bags.map((bag) => (
              <button type="button" key={bag.id} onClick={() => toggle("bagIds", bag.id!)} className={cn("rounded-xl border-2 px-3 py-2 text-left text-sm", step.bagIds.includes(bag.id!) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
                <span className="font-mono font-bold">{bag.code}</span> {bag.content}
              </button>
            ))}
          </div>
          {!bags.length && <p className="text-sm text-muted-foreground">Todavía no hay bolsas.</p>}
        </Field>

        <StepItemCreator stepId={step.id!} />

        <button type="button" onClick={async () => { if (confirm(`¿Borrar el paso ${step.order}? Las piezas y bolsas se conservarán.`)) { await deleteStep(step.id!); nav({ to: "/pasos" }); } }} className="flex w-full items-center justify-center gap-2 py-3 font-semibold text-destructive"><Trash2 className="size-4" /> Borrar paso</button>
      </div>
    </Page>
  );
}
