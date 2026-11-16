import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, Boxes, Camera, Hammer, ListOrdered, Package, PackageOpen, QrCode, Settings, Wrench } from "lucide-react";
import { db, getProject } from "@/lib/db";
import { needsBackup } from "@/lib/backup";
import { PhotoView } from "@/components/Photo";
import { InstallAppCard } from "@/components/InstallAppCard";
import { HelpButton } from "@/components/HelpDialog";
import { ProjectSwitcher } from "@/components/ProjectSwitcher";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Desarmario — desmonta y vuelve a montar sin perder nada" },
      { name: "description", content: "Registra piezas, bolsas y cajas con fotos y códigos para volver a montar tu armario." },
      { property: "og:title", content: "Desarmario — desmonta y monta sin perder nada" },
      { property: "og:description", content: "Piezas, bolsas y cajas con fotos y códigos, en tu móvil y sin conexión." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const project = useLiveQuery(getProject);
  const pieces = useLiveQuery(() => db.pieces.toArray()) ?? [];
  const steps = useLiveQuery(() => db.steps.toArray()) ?? [];
  const bags = useLiveQuery(() => db.bags.count()) ?? 0;
  const boxes = useLiveQuery(() => db.boxes.count()) ?? 0;
  const tools = useLiveQuery(() => db.tools.count()) ?? 0;
  const done = pieces.filter((p) => p.state !== "montada").length;
  const stepsDone = steps.filter((step) => step.done).length;
  const stepsAssembled = steps.filter((step) => step.assembled).length;
  const pct = steps.length ? Math.round((stepsDone / steps.length) * 100) : 0;
  const assemblyPct = steps.length ? Math.round((stepsAssembled / steps.length) * 100) : 0;
  const backupWarning = !!project && needsBackup(project.lastBackupAt, Date.now(), pieces.length + bags + boxes + steps.length + tools > 0);

  return (
    <div className="mx-auto max-w-xl px-4 pb-32 pt-6">
      <div className="mb-5 flex items-center gap-2">
        <Link to="/proyecto" className="flex min-w-0 flex-1 items-center gap-3">
          <PhotoView id={project?.photoIds[0]} className="size-14 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Proyecto</p>
            <h1 className="font-display text-2xl font-extrabold leading-tight">{project?.name ?? "Mi armario"}</h1>
          </div>
          <Settings className="size-5 shrink-0 text-muted-foreground" />
        </Link>
        <HelpButton />
      </div>

      <ProjectSwitcher currentName={project?.name} />

      {backupWarning && (
        <Link to="/ajustes" className="mb-5 flex items-center gap-3 rounded-2xl bg-warning p-4 text-warning-foreground">
          <AlertTriangle className="size-7 shrink-0" />
          <div className="flex-1"><p className="font-bold">{project.lastBackupAt ? "Tu copia tiene más de 3 días" : "No tienes copia de seguridad"}</p><p className="text-sm">Toca aquí para guardar tus datos y fotos.</p></div>
        </Link>
      )}

      <section className="mb-6 rounded-3xl bg-foreground p-5 text-background">
        <p className="text-sm opacity-70">Desmontaje</p>
        <p className="font-display text-4xl font-extrabold">{stepsDone}<span className="text-xl opacity-60"> / {steps.length} pasos</span></p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-background/20">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        {!!steps.length && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm"><span className="opacity-70">Montaje</span><span className="font-bold">{stepsAssembled} / {steps.length}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-background/20"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${assemblyPct}%` }} /></div>
          </div>
        )}
        <p className="mt-3 text-sm opacity-70">{done} de {pieces.length} piezas · {bags} bolsas · {boxes} cajas</p>
      </section>

      <Link to="/alta" className="mb-4 flex h-20 items-center justify-center gap-3 rounded-3xl bg-primary text-xl font-extrabold text-primary-foreground shadow-tool">
        <Camera className="size-7" /> Alta rápida
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Tile to="/piezas" icon={<Package />} label="Piezas" />
        <Tile to="/cajas" icon={<Boxes />} label="Cajas y bolsas" />
        <Tile to="/pasos" icon={<ListOrdered />} label="Pasos" />
        <Tile to="/desmontaje" icon={<Hammer />} label="Desmontaje" />
        <Tile to="/montaje" icon={<PackageOpen />} label="Montaje" />
        <Tile to="/etiquetas" icon={<QrCode />} label="Etiquetas" />
        <Tile to="/herramientas" icon={<Wrench />} label="Herramientas" />
      </div>
      <InstallAppCard />
      <Link to="/ajustes" className="mx-auto mt-4 flex min-h-12 w-fit items-center justify-center px-4 text-center text-sm font-semibold text-muted-foreground underline">Copia de seguridad</Link>
    </div>
  );
}

function Tile({ to, icon, label, soon }: { to?: "/piezas" | "/cajas" | "/pasos" | "/desmontaje" | "/montaje" | "/etiquetas" | "/herramientas"; icon: React.ReactNode; label: string; soon?: boolean }) {
  const cls = "flex h-28 flex-col justify-between rounded-3xl border-2 border-border bg-card p-4 [&_svg]:size-7";
  if (soon || !to) return (
    <div className={cls + " opacity-45"}>{icon}<div><p className="font-bold">{label}</p><p className="text-xs">Próximamente</p></div></div>
  );
  return <Link to={to} className={cls + " active:bg-muted [&_svg]:text-primary"}>{icon}<p className="font-bold">{label}</p></Link>;
}
