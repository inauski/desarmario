import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { createWorkspace, deleteWorkspace, listWorkspaces, activeWorkspaceKey, switchWorkspace, MAX_PROJECTS, type Workspace } from "@/lib/workspaces";

export function ProjectSwitcher({ currentName }: { currentName?: string | undefined }) {
  const [list, setList] = useState<Workspace[]>([]);
  const [active, setActive] = useState("");
  useEffect(() => { setList(listWorkspaces()); setActive(activeWorkspaceKey()); }, []);
  if (!list.length) return null;
  const nameOf = (w: Workspace) => (w.key === active && currentName ? currentName : w.name);

  const create = () => {
    const name = window.prompt("Nombre del nuevo armario", "Segundo armario");
    if (!name) return;
    switchWorkspace(createWorkspace(name.trim() || "Segundo armario"));
  };
  const remove = async (w: Workspace) => {
    if (!window.confirm(`¿Borrar «${nameOf(w)}» y todos sus datos y fotos? No se puede deshacer.`)) return;
    await deleteWorkspace(w.key);
    if (w.key === active) switchWorkspace(activeWorkspaceKey());
    else setList(listWorkspaces());
  };

  return (
    <section className="mb-5 rounded-3xl border-2 border-border bg-card p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Mis proyectos</p>
      <ul className="space-y-2">
        {list.map((w) => (
          <li key={w.key} className="flex items-center gap-2">
            <button type="button" disabled={w.key === active} onClick={() => switchWorkspace(w.key)}
              className={`flex min-h-12 flex-1 items-center gap-2 rounded-xl px-3 text-left font-bold ${w.key === active ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {w.key === active && <Check className="size-5 shrink-0" />}
              <span className="truncate">{nameOf(w)}</span>
              {w.key !== active && <span className="ml-auto text-sm font-normal text-muted-foreground">Abrir</span>}
            </button>
            {list.length > 1 && (
              <button type="button" aria-label={`Borrar ${nameOf(w)}`} onClick={() => remove(w)} className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted text-destructive">
                <Trash2 className="size-5" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {list.length < MAX_PROJECTS && (
        <button type="button" onClick={create} className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border font-bold">
          <Plus className="size-5" /> Nuevo proyecto paralelo
        </button>
      )}
      <p className="mt-2 text-xs text-muted-foreground">Cada proyecto guarda sus piezas, pasos, fotos y copias por separado.</p>
    </section>
  );
}
