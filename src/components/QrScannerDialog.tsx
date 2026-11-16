import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { parseLabelUrl, type LabelKind } from "@/lib/labels";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFound: (result: { kind: LabelKind; id: number }) => void;
}

export function QrScannerDialog({ open, onOpenChange, onFound }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-3xl p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="pr-8 text-xl">Escanear etiqueta</DialogTitle>
          <DialogDescription>Apunta al QR de una pieza, bolsa o caja para abrir su ficha.</DialogDescription>
        </DialogHeader>
        {open && <Scanner onFound={onFound} />}
      </DialogContent>
    </Dialog>
  );
}

function Scanner({ onFound }: { onFound: Props["onFound"] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Solicitando acceso a la cámara…");

  useEffect(() => {
    let active = true;
    let found = false;
    let controls: { stop: () => void } | undefined;

    import("@zxing/browser").then(({ BrowserQRCodeReader }) => {
      if (!active || !videoRef.current) return;
      const reader = new BrowserQRCodeReader();
      reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        videoRef.current,
        (result) => {
          if (!result || found) return;
          const parsed = parseLabelUrl(result.getText(), window.location.origin);
          if (!parsed) {
            setStatus("Este QR no es una etiqueta válida de Armario. Sigue buscando…");
            return;
          }
          found = true;
          controls?.stop();
          onFound(parsed);
        },
      ).then((scannerControls) => {
        controls = scannerControls;
        if (!active || found) controls.stop();
        else setStatus("Buscando un código…");
      }).catch((error: unknown) => {
        if (!active) return;
        const name = error instanceof Error ? error.name : "";
        setStatus(name === "NotAllowedError" ? "No has dado permiso para usar la cámara. Actívalo en el navegador y vuelve a intentarlo." : "No se pudo abrir la cámara. Comprueba el permiso y que ninguna otra aplicación la esté usando.");
      });
    }).catch(() => setStatus("No se pudo iniciar el lector de QR."));

    return () => { active = false; controls?.stop(); };
  }, [onFound]);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-foreground">
        <video ref={videoRef} className="size-full object-cover" muted playsInline aria-label="Vista de la cámara" />
        <div className="pointer-events-none absolute inset-[16%] rounded-2xl border-4 border-primary" />
      </div>
      <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground" role="status"><Camera className="mt-0.5 size-4 shrink-0" />{status}</p>
    </div>
  );
}
