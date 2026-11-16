import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db, getProject, type Project } from "@/lib/db";
import { PhotoPicker } from "@/components/Photo";
import { Field, inputCls, Page } from "@/components/ui-bits";

export const Route = createFileRoute("/proyecto")({
  head: () => ({ meta: [{ title: "Proyecto — Armario" }, { name: "description", content: "Nombre, descripción y fotos del armario montado." }, { property: "og:title", content: "Proyecto — Armario" }, { property: "og:description", content: "Nombre, descripción y fotos del armario montado." }] }),
  component: ProjectPage,
});

function ProjectPage() {
  const p = useLiveQuery(getProject);
  if (!p) return <Page title="Proyecto" back>{null}</Page>;
  const set = (patch: Partial<Project>) => db.project.put({ ...p, ...patch });
  return (
    <Page title="Proyecto" back>
      <div className="space-y-5">
        <Field label="Nombre"><input className={inputCls} defaultValue={p.name} onBlur={(e) => set({ name: e.target.value || "Mi armario" })} /></Field>
        <Field label="Descripción"><textarea className={inputCls} rows={3} defaultValue={p.description} onBlur={(e) => set({ description: e.target.value })} /></Field>
        <Field label="Fotos del armario montado"><PhotoPicker value={p.photoIds} onChange={(photoIds) => set({ photoIds })} /></Field>
      </div>
    </Page>
  );
}
