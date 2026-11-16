import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Camera, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { savePhoto } from "@/lib/db";

export function CameraQuickAction() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <button
        type="button"
        aria-label="Hacer foto para alta rápida"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="fixed right-5 z-40 grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-tool active:scale-95 disabled:opacity-70"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        {busy ? <LoaderCircle className="size-7 animate-spin" /> : <Camera className="size-7" />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        aria-label="Cámara para alta rápida"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            const photoId = await savePhoto(file);
            await navigate({ to: "/alta", search: { foto: photoId } });
          } catch {
            toast.error("No se pudo preparar la foto. Inténtalo de nuevo.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}
