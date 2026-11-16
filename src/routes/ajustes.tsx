import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { exportBackup, importBackup } from "@/lib/db";
import { btnPrimary, btnSecondary, Page } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ajustes")({
  head: () => ({ meta: [{ title: "Copia de seguridad — Armario" }, { name: "description", content: "Exporta o importa todos los datos y fotos." }, { property: "og:title", content: "Copia de seguridad — Armario" }, { property: "og:description", content: "Exporta o importa todos los datos y fotos." }] }),
  component: Backup,
});

function Backup() {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Page title="Copia de seguridad" back>
      <p className="mb-6 text-muted-foreground">Todo se guarda solo en este teléfono. Exporta una copia de vez en cuando y guárdala en otro sitio.</p>
      <div className="space-y-3">
        <button className={btnPrimary} disabled={busy} onClick={async () => {
          setBusy(true);
          try {
            const data = await exportBackup();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
            a.download = `armario-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
          } finally { setBusy(false); }
        }}><Download /> Exportar copia</button>
        <button className={cn(btnSecondary, "h-14 w-full")} disabled={busy} onClick={() => ref.current?.click()}><Upload /> Importar copia</button>
        <input ref={ref} type="file" accept="application/json,.json" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; e.target.value = "";
          if (!f || !confirm("Esto sustituirá todos los datos actuales. ¿Continuar?")) return;
          setBusy(true);
          try { await importBackup(JSON.parse(await f.text())); toast.success("Copia importada"); }
          catch (err) { toast.error((err as Error).message); }
          finally { setBusy(false); }
        }} />
      </div>
    </Page>
  );
}
