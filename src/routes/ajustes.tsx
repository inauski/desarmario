import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Download, FileJson, FileText, Upload } from "lucide-react";
import { db, exportBackup, getProject, importBackup } from "@/lib/db";
import { deliverFile } from "@/lib/download";
import { btnPrimary, btnSecondary, Page } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ajustes")({
  head: () => ({
    meta: [
      { title: "Copia de seguridad y exportación — Armario" },
      { name: "description", content: "Exporta e importa el proyecto completo en JSON o crea un PDF con piezas, uniones y pasos." },
      { property: "og:title", content: "Copia de seguridad — Armario" },
      { property: "og:description", content: "Guarda todos tus datos y fotos, o exporta el proyecto en PDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Backup,
});

interface ReadyFile {
  blob: Blob;
  filename: string;
  kind: "json" | "pdf";
}

function Backup() {
  const ref = useRef<HTMLInputElement>(null);
  const project = useLiveQuery(getProject);
  const [busy, setBusy] = useState<"json" | "pdf" | null>(null);
  const [ready, setReady] = useState<ReadyFile | null>(null);

  async function prepareJson() {
    setBusy("json");
    setReady(null);
    try {
      const data = await exportBackup();
      setReady({
        blob: new Blob([JSON.stringify(data)], { type: "application/json" }),
        filename: `armario-${new Date().toISOString().slice(0, 10)}.json`,
        kind: "json",
      });
      toast.success("Copia preparada. Ahora descárgala.");
    } catch {
      toast.error("No se pudo preparar la copia.");
    } finally { setBusy(null); }
  }

  async function preparePdf() {
    setBusy("pdf");
    setReady(null);
    try {
      const [{ generateProjectPdf }, project, pieces, bags, boxes, joints, steps] = await Promise.all([
        import("@/lib/project-pdf"),
        getProject(),
        db.pieces.toArray(),
        db.bags.toArray(),
        db.boxes.toArray(),
        db.joints.toArray(),
        db.steps.toArray(),
      ]);
      const bytes = await generateProjectPdf({ project, pieces, bags, boxes, joints, steps });
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      setReady({ blob: new Blob([copy.buffer], { type: "application/pdf" }), filename: "armario-proyecto.pdf", kind: "pdf" });
      toast.success("PDF preparado. Ahora descárgalo.");
    } catch {
      toast.error("No se pudo preparar el PDF.");
    } finally { setBusy(null); }
  }

  async function downloadReady() {
    if (!ready) return;
    const delivered = await deliverFile(ready.blob, ready.filename);
    if (delivered && ready.kind === "json") {
      await db.project.put({ ...(await getProject()), lastBackupAt: Date.now() });
      toast.success("Copia guardada");
    }
  }

  return (
    <Page title="Copia de seguridad" back>
      <p className="mb-2 text-muted-foreground">Todo se guarda solo en este teléfono. Exporta una copia de vez en cuando y guárdala en otro sitio.</p>
      <p className="mb-6 text-sm font-semibold text-muted-foreground">{project?.lastBackupAt ? `Última copia: ${new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(project.lastBackupAt)}` : "Todavía no has descargado ninguna copia."}</p>

      <section className="mb-6 space-y-3">
        <h2 className="flex items-center gap-2 font-bold"><FileJson className="size-5 text-primary" /> Proyecto completo en JSON</h2>
        <p className="text-sm text-muted-foreground">Incluye piezas, bolsas, cajas, uniones, pasos, herramientas y todas las fotos.</p>
        <button type="button" className={btnPrimary} disabled={busy !== null} onClick={prepareJson}><FileJson />{busy === "json" ? "Preparando copia…" : "Preparar copia JSON"}</button>
        <button type="button" className={cn(btnSecondary, "h-14 w-full")} disabled={busy !== null} onClick={() => ref.current?.click()}><Upload /> Importar copia JSON</button>
        <input ref={ref} type="file" accept="application/json,.json" hidden onChange={async (event) => {
          const file = event.target.files?.[0]; event.target.value = "";
          if (!file || !confirm("Esto sustituirá todos los datos actuales. ¿Continuar?")) return;
          setReady(null);
          try {
            await importBackup(JSON.parse(await file.text()));
            toast.success("Copia importada con datos y fotos");
          } catch {
            toast.error("No se pudo importar. Comprueba que sea una copia JSON de Armario.");
          }
        }} />
      </section>

      <section className="space-y-3 border-t-2 border-border pt-5">
        <h2 className="flex items-center gap-2 font-bold"><FileText className="size-5 text-primary" /> Proyecto en PDF</h2>
        <p className="text-sm text-muted-foreground">Documento con todas las piezas, sus ubicaciones, las uniones y los pasos en orden.</p>
        <button type="button" className={btnPrimary} disabled={busy !== null} onClick={preparePdf}><FileText />{busy === "pdf" ? "Preparando PDF…" : "Preparar PDF del proyecto"}</button>
      </section>

      {ready && (
        <section className="mt-6 rounded-2xl bg-success p-4 text-success-foreground">
          <p className="mb-1 text-sm font-semibold">Archivo listo</p>
          <p className="mb-3 break-all text-sm">{ready.filename}</p>
          <button type="button" className={cn(btnSecondary, "w-full border-success-foreground")} onClick={downloadReady}><Download /> Descargar {ready.kind === "json" ? "JSON" : "PDF"}</button>
        </section>
      )}
    </Page>
  );
}
