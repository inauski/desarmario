import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Camera, X } from "lucide-react";
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
    <div className="flex flex-wrap gap-2">
      {value.map((id) => (
        <div key={id} className="relative">
          <PhotoView id={id} className="size-24 rounded-lg" />
          <button type="button" aria-label="Quitar foto" onClick={() => onChange(value.filter((v) => v !== id))}
            className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-foreground text-background">
            <X className="size-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => ref.current?.click()} disabled={busy}
        className="grid size-24 place-items-center rounded-lg border-2 border-dashed border-primary text-primary">
        <Camera className="size-8" />
      </button>
      <input ref={ref} type="file" accept="image/*" capture="environment" hidden
        onChange={async (e) => {
          const f = e.target.files?.[0]; e.target.value = "";
          if (!f) return;
          setBusy(true);
          try { onChange([...value, await savePhoto(f)]); } finally { setBusy(false); }
        }} />
    </div>
  );
}
