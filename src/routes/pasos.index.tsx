import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, GripVertical, Hammer, PackageOpen, Plus } from "lucide-react";
import { db, type Step } from "@/lib/db";
import { createStep, moveSteps, orderedSteps, reorderSteps } from "@/lib/steps";
import { PhotoView } from "@/components/Photo";
import { btnPrimary, Code, Page } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pasos/")({
  head: () => ({
    meta: [
      { title: "Pasos — Desarmario" },
      { name: "description", content: "Crea, ordena y prepara los pasos del desmontaje y el montaje." },
      { property: "og:title", content: "Pasos — Desarmario" },
      { property: "og:description", content: "Tu plan de desmontaje, ordenado y listo para seguir desde el móvil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StepsPage,
});

function StepsPage() {
  const nav = useNavigate();
  const rawSteps = useLiveQuery(() => db.steps.toArray());
  const steps = orderedSteps(rawSteps ?? []);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function newStep() {
    const id = await createStep();
    nav({ to: "/pasos/$id", params: { id: String(id) } });
  }

  async function dragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const moved = moveSteps(steps, Number(active.id), Number(over.id));
    await reorderSteps(moved.map((step) => step.id!));
  }

  return (
    <Page title="Pasos" back action={<button type="button" aria-label="Nuevo paso" onClick={newStep} className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"><Plus /></button>}>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Link to="/desmontaje" className="flex min-h-24 flex-col justify-between rounded-2xl bg-foreground p-4 font-bold text-background"><Hammer className="size-6 text-primary" />Desmontaje</Link>
        <Link to="/montaje" className="flex min-h-24 flex-col justify-between rounded-2xl bg-foreground p-4 font-bold text-background"><PackageOpen className="size-6 text-primary" />Montaje</Link>
      </div>
      <div className="mb-3 flex items-end justify-between">
        <p className="text-sm text-muted-foreground">{steps.filter((step) => step.done).length} de {steps.length} hechos</p>
        {steps.length > 1 && <p className="text-xs text-muted-foreground">Arrastra el asa para ordenar</p>}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
        <SortableContext items={steps.map((step) => step.id!)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {steps.map((step) => <SortableStep key={step.id} step={step} />)}
          </div>
        </SortableContext>
      </DndContext>
      {!rawSteps?.length && <div className="my-5 rounded-2xl border-2 border-dashed border-border p-5 text-center text-muted-foreground">Crea el primer paso para empezar el desmontaje.</div>}
      <button type="button" className={cn(btnPrimary, "mt-5")} onClick={newStep}><Plus /> Nuevo paso</button>
    </Page>
  );
}

function SortableStep({ step }: { step: Step }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id! });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("flex items-center gap-2 rounded-2xl border-2 border-border bg-card p-2", isDragging && "z-10 opacity-60 shadow-tool")}>
      <button type="button" aria-label={`Mover ${step.title}`} className="grid size-11 shrink-0 cursor-grab touch-none place-items-center rounded-xl text-muted-foreground active:cursor-grabbing" {...attributes} {...listeners}><GripVertical /></button>
      <Link to="/pasos/$id" params={{ id: String(step.id) }} className="flex min-w-0 flex-1 items-center gap-3">
        <PhotoView id={step.photoIds[0]} className="size-14 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <Code>Paso {step.order}</Code>
          <p className="mt-1 truncate font-bold">{step.title || "Sin título"}</p>
          <p className="text-xs text-muted-foreground">{step.pieceIds.length} piezas · {step.bagIds.length} bolsas</p>
        </div>
      </Link>
      <div className="flex shrink-0 flex-col gap-1 pr-1 text-xs font-bold">
        <span className={cn("rounded-full px-2 py-1", step.done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground")} title="Desmontaje">{step.done && <Check className="mr-1 inline size-3" />}D</span>
        <span className={cn("rounded-full px-2 py-1", step.assembled ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground")} title="Montaje">{step.assembled && <Check className="mr-1 inline size-3" />}M</span>
      </div>
    </div>
  );
}
