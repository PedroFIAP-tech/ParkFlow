import clsx from "clsx";
import type { OccurrenceStatus } from "@/types/parkflow";

const styles: Record<OccurrenceStatus, string> = {
  ABERTA: "border-electric/30 bg-electric/10 text-electric",
  EM_ANALISE: "border-brand/40 bg-brand/15 text-blue-200",
  ALERTA_GERADO: "border-danger/35 bg-danger/10 text-danger",
  MONITORAMENTO: "border-warning/30 bg-warning/10 text-warning",
  RESOLVIDA: "border-success/30 bg-success/10 text-success",
  CANCELADA: "border-slate-500/30 bg-slate-500/10 text-slate-300"
};

const labels: Record<OccurrenceStatus, string> = {
  ABERTA: "ABERTA",
  EM_ANALISE: "EM ANÁLISE",
  ALERTA_GERADO: "ALERTA GERADO",
  MONITORAMENTO: "MONITORAMENTO",
  RESOLVIDA: "RESOLVIDA",
  CANCELADA: "CANCELADA"
};

export function StatusBadge({ status }: { status: OccurrenceStatus }) {
  return (
    <span className={clsx("inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium", styles[status])}>
      {labels[status]}
    </span>
  );
}
