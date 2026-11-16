import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Camera, LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";
import { db, savePhoto } from "@/lib/db";
import { cn } from "@/lib/utils";

export function PhotoView({ id, className }: { id?: number | undefined; className?: string }) {
  const photo = useLiveQuery(() => (id ? db.photos.get(id) : undefined), [id]);
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!photo) return setUrl(undefined);
    const u = URL.createObjectURL(photo.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [photo]);
  if (!url) return <div className={cn("bg-muted", className)} />;
  return <img src={url} alt="" className={cn("object-cover", className)} />;
}

export function PhotoPicker({ value, onChange }: { value: number[]; onChange: (ids: number[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <div className="flex flex-wrap gap-3" aria-busy={busy}>
        {value.map((id) => (
          <div key={id} className="relative">
            <PhotoView id={id} className="size-28 rounded-xl" />
            <button type="button" aria-label="Quitar foto" onClick={() => onChange(value.filter((v) => v !== id))}
              className="absolute -right-3 -top-3 grid size-11 place-items-center rounded-full border-2 border-background bg-foreground text-background">
              <X className="size-5" />
            </button>
          </div>
        ))}
        <button type="button" aria-label={busy ? "Comprimiendo foto" : "Hacer o elegir foto"} onClick={() => ref.current?.click()} disabled={busy}
          className="grid size-28 place-items-center rounded-xl border-2 border-dashed border-primary text-primary disabled:opacity-60">
          {busy ? <LoaderCircle className="size-8 animate-spin" /> : <Camera className="size-9" />}
        </button>
        <input ref={ref} type="file" accept="image/*" capture="environment" hidden
          onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = "";
            if (!f) return;
            setBusy(true);
            try {
              onChange([...value, await savePhoto(f)]);
            } catch {
              toast.error("No se pudo comprimir la foto. Prueba con otra imagen.");
            } finally {
              setBusy(false);
            }
          }} />
      </div>
      {busy && <p className="mt-2 text-sm font-semibold text-muted-foreground" role="status">Comprimiendo foto para ocupar menos espacio…</p>}
    </div>
  );
}
