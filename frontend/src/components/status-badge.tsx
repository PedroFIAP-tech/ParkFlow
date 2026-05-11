import clsx from "clsx";
import type { OccurrenceStatus } from "@/types/parkflow";

const styles: Record<OccurrenceStatus, string> = {
  ABERTA: "border-electric/30 bg-electric/10 text-electric",
  AGUARDANDO_VISTORIA: "border-warning/30 bg-warning/10 text-warning",
  EM_ANALISE: "border-brand/40 bg-brand/15 text-blue-200",
  AGUARDANDO_DOCUMENTO: "border-warning/30 bg-warning/10 text-warning",
  AGUARDANDO_PECA: "border-warning/30 bg-warning/10 text-warning",
  ENCAMINHADA_PATIO: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
  ENCAMINHADA_OFICINA: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
  FINALIZADA: "border-success/30 bg-success/10 text-success",
  CANCELADA: "border-slate-500/30 bg-slate-500/10 text-slate-300"
};

export function StatusBadge({ status }: { status: OccurrenceStatus }) {
  return (
    <span className={clsx("inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium", styles[status])}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

