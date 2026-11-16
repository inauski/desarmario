import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import { labelPath, type LabelItem } from "@/lib/labels";

export function QrCodeImage({ item, className = "size-20" }: { item: LabelItem; className?: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;
    setSrc("");
    const value = new URL(labelPath(item.kind, item.id), window.location.origin).href;
    import("qrcode")
      .then((QRCode) => QRCode.toDataURL(value, { width: 256, margin: 0, errorCorrectionLevel: "M" }))
      .then((url) => { if (active) setSrc(url); })
      .catch(() => { if (active) setSrc(""); });
    return () => { active = false; };
  }, [item.kind, item.id]);

  if (!src) return <div className={`${className} grid shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground`} aria-label="Generando QR"><QrCode className="size-2/3" /></div>;
  return <img src={src} alt={`QR de ${item.code}`} className={`${className} shrink-0 rounded-lg bg-card`} />;
}
