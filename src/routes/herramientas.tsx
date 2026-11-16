import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, Plus, Trash2, Wrench } from "lucide-react";
import { db } from "@/lib/db";
import { btnPrimary, Field, inputCls, Page } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/herramientas")({
  head: () => ({
    meta: [
      { title: "Herramientas — Desarmario" },
      { name: "description", content: "Checklist de herramientas y tamaños para preparar el desmontaje." },
      { property: "og:title", content: "Herramientas — Desarmario" },
      { property: "og:description", content: "Marca cada herramienta como preparada antes de empezar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const tools = useLiveQuery(() => db.tools.toArray()) ?? [];
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const prepared = tools.filter((tool) => tool.prepared).length;
  const pct = tools.length ? Math.round((prepared / tools.length) * 100) : 0;

  async function addTool(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await db.tools.add({ name: name.trim(), size: size.trim(), prepared: false, createdAt: Date.now() });
    setName("");
    setSize("");
  }

  return (
    <Page title="Herramientas" back>
      <section className="mb-5 rounded-3xl bg-foreground p-5 text-background">
        <div className="flex items-center gap-3"><Wrench className="size-7 text-primary" /><div><p className="text-sm opacity-70">Checklist</p><p className="font-display text-2xl font-extrabold">{prepared} de {tools.length} preparadas</p></div></div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-background/20"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} /></div>
      </section>

      <form onSubmit={addTool} className="mb-6 space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <p className="font-bold">Añadir herramienta</p>
        <Field label="Nombre"><input className={inputCls} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Llave Allen" /></Field>
        <Field label="Tamaño (opcional)"><input className={inputCls} value={size} onChange={(event) => setSize(event.target.value)} placeholder="Ej. Nº 4, 10 mm, PH2" /></Field>
        <button type="submit" className={btnPrimary} disabled={!name.trim()}><Plus /> Añadir a la checklist</button>
      </form>

      <div className="space-y-2">
        {tools.map((tool) => (
          <div key={tool.id} className={cn("flex items-center gap-2 rounded-2xl border-2 p-2", tool.prepared ? "border-success bg-success/40" : "border-border bg-card")}>
            <button type="button" aria-pressed={tool.prepared} onClick={() => db.tools.update(tool.id!, { prepared: !tool.prepared })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl border-2", tool.prepared ? "border-success bg-success text-success-foreground" : "border-input bg-card")} aria-hidden>{tool.prepared && <Check />}</span>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate font-bold", tool.prepared && "line-through opacity-60")}>{tool.name}</span>
                <span className="text-sm text-muted-foreground">{tool.size || "Sin tamaño"}</span>
              </span>
              <span className="shrink-0 pr-1 text-xs font-bold text-muted-foreground">{tool.prepared ? "Preparada" : "Pendiente"}</span>
            </button>
            <button type="button" aria-label={`Borrar ${tool.name}`} onClick={() => db.tools.delete(tool.id!)} className="grid size-11 shrink-0 place-items-center rounded-xl text-destructive active:bg-muted"><Trash2 className="size-5" /></button>
          </div>
        ))}
      </div>
      {!tools.length && <p className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-muted-foreground">Añade las herramientas que necesitas y ve marcándolas al prepararlas.</p>}
    </Page>
  );
}
