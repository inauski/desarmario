import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Download, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { getInstallPrompt, showInstallPrompt, subscribeToInstallPrompt } from "@/lib/install-prompt";
import { btnSecondary } from "./ui-bits";

export function InstallAppCard() {
  const prompt = useSyncExternalStore(subscribeToInstallPrompt, getInstallPrompt, () => null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(display-mode: standalone)");
    const update = () => setInstalled(query.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    update();
    query.addEventListener("change", update);
    window.addEventListener("appinstalled", update);
    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener("appinstalled", update);
    };
  }, []);

  return (
    <section className="mt-6 rounded-3xl border-2 border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Smartphone className="size-7 shrink-0 text-primary" />
        <div className="min-w-0">
          <h2 className="font-bold">Instalar en pantalla de inicio</h2>
          <p className="mt-1 text-sm text-muted-foreground">Abre Armario desde su propio icono, como una app.</p>
        </div>
      </div>
      {installed ? (
        <p className="mt-4 flex min-h-12 items-center gap-2 font-bold text-success-foreground"><Check /> Instalada en este dispositivo</p>
      ) : prompt ? (
        <button type="button" className={`${btnSecondary} mt-4 h-14 w-full`} onClick={async () => {
          const outcome = await showInstallPrompt();
          if (outcome === "accepted") toast.success("Instalación iniciada");
        }}><Download /> Instalar Armario</button>
      ) : (
        <p className="mt-4 rounded-xl bg-muted p-3 text-sm leading-relaxed text-muted-foreground">
          En iPhone: <strong className="text-foreground">Compartir → Añadir a pantalla de inicio</strong>.<br />
          En Android: <strong className="text-foreground">menú del navegador → Instalar aplicación</strong>.
        </p>
      )}
    </section>
  );
}
