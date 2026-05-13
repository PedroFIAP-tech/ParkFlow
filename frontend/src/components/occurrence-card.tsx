"use client";

import { AlertTriangle, Clock, MapPin, ScanLine } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PriorityChip } from "@/components/priority-chip";
import { StatusBadge } from "@/components/status-badge";
import { typeLabel } from "@/lib/occurrence-store";
import type { OccurrenceSummary } from "@/types/parkflow";

export function OccurrenceCard({ occurrence, index = 0 }: { occurrence: OccurrenceSummary; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.26 }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={`/ocorrencias/${occurrence.id}`}
        className="group block rounded-xl border border-line bg-slate-950/45 p-4 transition hover:border-electric/50 hover:bg-slate-900/70"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-electric">{occurrence.occurrenceCode}</span>
              <PriorityChip priority={occurrence.priority} />
              <StatusBadge status={occurrence.status} />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">
              {occurrence.vehicle.plate} - {occurrence.vehicle.model ?? typeLabel(occurrence.type)}
            </h3>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-black/20 px-3 py-2 text-sm text-slate-300">
            <Clock className="h-4 w-4 text-warning" />
            {occurrence.stoppedMinutes} min em aberto
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

        {occurrence.latestAlert ? (
          <div className="mt-4 rounded-lg border border-danger/25 bg-danger/10 p-3 text-sm leading-6 text-red-100">
            <strong className="text-danger">{occurrence.latestAlert.message}</strong>
            <span className="mt-1 block text-slate-300">
              Unidade anterior: {occurrence.latestAlert.previousUnit} - Risco: {occurrence.latestAlert.riskLevel}
            </span>
          </div>
        ) : null}

        {occurrence.latestAIAnalysis ? (
          <div className="mt-4 rounded-lg border border-brand/20 bg-brand/10 p-3 text-sm leading-6 text-blue-100">
            {occurrence.latestAIAnalysis.summary}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm text-warning">
            <AlertTriangle className="h-4 w-4" />
            IA auxiliar ainda nao executada.
          </div>
        )}
      </Link>
    </motion.div>
  );
}
