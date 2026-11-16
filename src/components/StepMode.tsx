import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Camera, Check, ChevronLeft, ChevronRight, Pencil, Wrench } from "lucide-react";
import { db } from "@/lib/db";
import { stepsForMode } from "@/lib/steps";
import { PhotoView } from "@/components/Photo";
import { StepItemCreator } from "@/components/StepItemCreator";
import { StepItems } from "@/components/StepItems";
import { btnPrimary, btnSecondary, Code, Page } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export function StepMode({ mode }: { mode: "desmontaje" | "montaje" }) {
  const rawSteps = useLiveQuery(() => db.steps.toArray());
  const [currentId, setCurrentId] = useState<number>();
  const steps = stepsForMode(rawSteps ?? [], mode);
  const isAssembly = mode === "montaje";
  const isComplete = (step: (typeof steps)[number]) => isAssembly ? step.assembled : step.done;
  const current = steps.find((step) => step.id === currentId) ?? steps.find((step) => !isComplete(step)) ?? steps[0];
  const index = current ? steps.findIndex((step) => step.id === current.id) : -1;
  const completed = steps.filter(isComplete).length;
  const pct = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  async function toggleComplete() {
    if (!current) return;
    const value = !isComplete(current);
    await db.steps.update(current.id!, isAssembly ? { assembled: value } : { done: value });
    if (value) {
      const next = steps.slice(index + 1).find((step) => !isComplete(step)) ?? steps[index + 1];
      if (next) setCurrentId(next.id);
    }
  }

  return (
    <Page title={isAssembly ? "Modo montaje" : "Modo desmontaje"} back action={<Link to="/pasos" className="text-sm font-bold text-primary">Ver pasos</Link>}>
      {!rawSteps ? <p className="text-muted-foreground">Cargando…</p> : !current ? (
        <div className="rounded-3xl border-2 border-dashed border-border p-6 text-center">
          <p className="mb-4 text-muted-foreground">Primero crea los pasos del desmontaje.</p>
          <Link to="/pasos" className={btnPrimary}>Crear pasos</Link>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-sm font-bold">
              <span>{completed} de {steps.length} {isAssembly ? "montados" : "hechos"}</span>
              <span>{index + 1} / {steps.length}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
          </div>

          <section className="mb-4 overflow-hidden rounded-3xl border-2 border-border bg-card">
            {current.photoIds[0] ? (
              <PhotoView id={current.photoIds[0]} className="h-64 w-full" />
            ) : (
              <div className="grid h-48 place-items-center bg-muted text-muted-foreground"><div className="text-center"><Camera className="mx-auto mb-2 size-8" /><p className="text-sm">Sin foto del estado original</p></div></div>
            )}
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Code>Paso {current.order}</Code>
                <Link to="/pasos/$id" params={{ id: String(current.id) }} aria-label="Editar este paso" className="grid size-10 place-items-center rounded-full bg-muted"><Pencil className="size-4" /></Link>
              </div>
              <h2 className="font-display text-2xl font-extrabold">{current.title || "Sin título"}</h2>
              {current.description && <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{current.description}</p>}
              {!!current.tools.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {current.tools.map((tool) => <span key={tool} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground"><Wrench className="size-4" />{tool}</span>)}
                </div>
              )}
            </div>
          </section>

          <div className="mb-5"><StepItems step={current} assembly={isAssembly} /></div>
          {!isAssembly && <div className="mb-5"><StepItemCreator stepId={current.id!} /></div>}

          <button type="button" aria-pressed={isComplete(current)} onClick={toggleComplete} className={cn(btnPrimary, "h-20 text-2xl", isComplete(current) && "bg-success text-success-foreground shadow-none")}>
            <Check className="size-8" />{isAssembly ? "Montado" : "Hecho"}{isComplete(current) && " ✓"}
          </button>
          {isComplete(current) && <p className="mt-2 text-center text-xs text-muted-foreground">Pulsa de nuevo para deshacer.</p>}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" className={btnSecondary} disabled={index <= 0} onClick={() => setCurrentId(steps[index - 1]?.id)}><ChevronLeft className="size-5" /> Anterior</button>
            <button type="button" className={btnSecondary} disabled={index >= steps.length - 1} onClick={() => setCurrentId(steps[index + 1]?.id)}>Siguiente <ChevronRight className="size-5" /></button>
          </div>
        </>
      )}
    </Page>
  );
}
