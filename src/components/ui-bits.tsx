import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PieceState } from "@/lib/db";

export function Page({ title, back, children, action }: { title: string; back?: boolean; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 pb-32 pt-4">
      <header className="mb-4 flex items-center gap-2">
        {back && (
          <button onClick={() => history.back()} aria-label="Volver" className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-muted">
            <ChevronLeft className="size-6" />
          </button>
        )}
        <h1 className="flex-1 font-display text-2xl font-extrabold tracking-tight">{title}</h1>
        {action}
      </header>
      {children}
    </div>
  );
}

export function Code({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("sticker", className)}>{children}</span>;
}

const stateCls: Record<PieceState, string> = {
  montada: "bg-muted text-muted-foreground",
  desmontada: "bg-warning text-warning-foreground",
  guardada: "bg-success text-success-foreground",
};
export function StateBadge({ state }: { state: PieceState }) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold uppercase", stateCls[state])}>{state}</span>;
}

/** Use `group` when children are buttons/pickers: a <label> would forward taps to its first button. */
export function Field({ label, children, group }: { label: string; children: ReactNode; group?: boolean }) {
  const Tag = group ? "div" : "label";
  return (
    <Tag className="block space-y-1.5">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      {children}
    </Tag>
  );
}

export const inputCls = "w-full rounded-xl border-2 border-input bg-card px-4 py-3 text-base outline-none focus:border-primary";
export const btnPrimary = "inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-lg font-bold text-primary-foreground shadow-tool active:scale-[0.98] disabled:opacity-50";
export const btnSecondary = "inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-4 font-semibold active:scale-[0.98]";

export function ListLink({ to, params, children }: { to: string; params?: Record<string, string>; children: ReactNode }) {
  return (
    <Link to={to as any} params={params as any} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 active:bg-muted">
      {children}
    </Link>
  );
}
