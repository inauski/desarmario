import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, HelpCircle, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type HelpRoute =
  | "/herramientas"
  | "/alta"
  | "/piezas"
  | "/pasos"
  | "/etiquetas"
  | "/desmontaje"
  | "/montaje"
  | "/ajustes";

interface Section {
  title: string;
  kicker: string;
  lines: string[];
  to: HelpRoute;
  cta: string;
}

const SECTIONS: Section[] = [
  {
    title: "Herramientas",
    kicker: "Antes de tocar nada",
    lines: [
      "Apunta cada herramienta con su tamaño (Nº 4, 10 mm, PH2) y márcala como preparada.",
      "Así descubres qué te falta antes de empezar a desmontar.",
    ],
    to: "/herramientas",
    cta: "Abrir Herramientas",
  },
  {
    title: "Alta rápida",
    kicker: "Fotografía y codifica",
    lines: [
      "Toca Alta rápida: la foto, el código solo (P-01 pieza, B-01 bolsa, C-1 caja) y el nombre, contenido o ubicación.",
      "Si algo va dentro de una caja, elígela o créala en ese mismo momento.",
    ],
    to: "/alta",
    cta: "Abrir Alta rápida",
  },
  {
    title: "Uniones",
    kicker: "Apunta cómo se sujeta",
    lines: [
      "En la ficha de una pieza pulsa «Nueva unión»: tipo de fijación, cantidad, foto de detalle y notas.",
      "Desde la unión creas la bolsa con sus tornillos y el código ya puesto.",
    ],
    to: "/piezas",
    cta: "Ver piezas",
  },
  {
    title: "Pasos",
    kicker: "Escribe el plan",
    lines: [
      "Cada paso lleva orden, título, descripción, foto del estado original, herramientas, piezas y bolsas.",
      "Arrastra el asa de la izquierda para cambiar el orden.",
    ],
    to: "/pasos",
    cta: "Abrir Pasos",
  },
  {
    title: "Etiquetas",
    kicker: "Pega un QR en cada cosa",
    lines: [
      "Selecciona piezas, bolsas y cajas e imprime la hoja A4 con las pegatinas.",
      "Con «Escanear» apuntas al QR y se abre la ficha de ese elemento.",
    ],
    to: "/etiquetas",
    cta: "Abrir Etiquetas",
  },
  {
    title: "Desmontaje",
    kicker: "Sigue el plan, pantalla a pantalla",
    lines: [
      "Ves la foto del paso y lo que necesitas. Crea desde ahí la pieza o la bolsa que acaban de salir.",
      "Pulsa «Hecho» y pasas al siguiente.",
    ],
    to: "/desmontaje",
    cta: "Empezar desmontaje",
  },
  {
    title: "Montaje",
    kicker: "Los mismos pasos al revés",
    lines: [
      "Cada paso muestra la foto del estado original, qué piezas y bolsas necesitas y en qué caja están.",
      "Pulsa «Montado» cuando quede bien.",
    ],
    to: "/montaje",
    cta: "Empezar montaje",
  },
  {
    title: "Copia de seguridad",
    kicker: "Guárdala en otro sitio",
    lines: [
      "Exporta el proyecto en JSON, con todas las fotos, o en PDF para tenerlo en papel.",
      "Si hace más de 3 días que no la haces, el inicio te lo recuerda.",
    ],
    to: "/ajustes",
    cta: "Abrir Copia de seguridad",
  },
];

const TIPS = [
  "El botón de cámara de abajo a la derecha abre la cámara desde cualquier pantalla: la foto se guarda comprimida y te lleva a Alta rápida.",
  "Puedes instalar Desarmario en la pantalla de inicio y usarlo sin conexión.",
  "El progreso del desmontaje y del montaje se ve en el inicio.",
];

export function HelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const nav = useNavigate();

  function go(to: HelpRoute) {
    onOpenChange(false);
    nav({ to });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88dvh] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-3xl p-0 [&>button]:hidden">
        <DialogHeader className="relative shrink-0 border-b-2 border-border p-5 pr-16 text-left">
          <DialogClose
            aria-label="Cerrar instrucciones"
            className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-muted-foreground active:bg-muted"
          >
            <X className="size-6" />
          </DialogClose>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight">
            Cómo funciona Desarmario
          </DialogTitle>
          <DialogDescription>
            Todo se guarda en este teléfono: sin cuentas y sin internet. Estos son los {SECTIONS.length} pasos, del
            principio al final.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          <ol className="space-y-5">
            {SECTIONS.map((section, index) => (
              <li key={section.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span
                  aria-hidden
                  className="grid size-9 place-items-center rounded-full bg-primary font-display text-lg font-extrabold text-primary-foreground"
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-extrabold leading-tight">{section.title}</h3>
                  <p className="text-sm font-semibold text-primary">{section.kicker}</p>
                  <ul className="mt-1.5 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                    {section.lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => go(section.to)}
                    className="mt-2 inline-flex min-h-12 items-center gap-1 rounded-xl border-2 border-primary px-3 text-sm font-bold text-primary active:bg-muted"
                  >
                    {section.cta}
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-2xl bg-muted p-4">
            <p className="mb-2 font-bold">Atajos útiles</p>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {TIPS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="shrink-0 border-t-2 border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <DialogClose className="inline-flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-lg font-bold text-primary-foreground shadow-tool active:scale-[0.98]">
            <Check className="size-6" /> Entendido
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Round "?" button that opens the instructions; usable in any screen header. */
export function HelpButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver instrucciones de uso"
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full border-2 border-border bg-card text-primary active:bg-muted",
          className,
        )}
      >
        <HelpCircle className="size-5" />
      </button>
      <HelpDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
