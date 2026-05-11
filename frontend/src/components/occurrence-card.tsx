import { AlertTriangle, Clock, MapPin, ScanLine } from "lucide-react";
import Link from "next/link";
import { PriorityChip } from "@/components/priority-chip";
import { StatusBadge } from "@/components/status-badge";
import type { OccurrenceSummary } from "@/types/parkflow";

export function OccurrenceCard({ occurrence }: { occurrence: OccurrenceSummary }) {
  return (
    <Link
      href={`/ocorrencias/${occurrence.id}`}
      className="group block rounded-lg border border-line bg-slate-950/45 p-4 transition hover:border-electric/50 hover:bg-slate-900/70"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-electric">{occurrence.occurrenceCode}</span>
            <PriorityChip priority={occurrence.priority} />
            <StatusBadge status={occurrence.status} />
          </div>
          <h3 className="mt-3 text-lg font-semibold text-white">
            {occurrence.vehicle.plate} · {occurrence.vehicle.model ?? occurrence.type}
          </h3>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-line bg-black/20 px-3 py-2 text-sm text-slate-300">
          <Clock className="h-4 w-4 text-warning" />
          {occurrence.stoppedMinutes} min parado
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-400 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span>{occurrence.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <ScanLine className="h-4 w-4 text-electric" />
          <span>{occurrence.latestAIAnalysis ? `${occurrence.latestAIAnalysis.confidenceScore}% IA` : "IA pendente"}</span>
        </div>
      </div>

      {occurrence.latestAIAnalysis ? (
        <div className="mt-4 rounded-md border border-brand/20 bg-brand/10 p-3 text-sm text-blue-100">
          {occurrence.latestAIAnalysis.summary}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-warning/20 bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="h-4 w-4" />
          Aguardando analise inteligente.
        </div>
      )}
    </Link>
  );
}

