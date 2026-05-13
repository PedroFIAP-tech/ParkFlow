"use client";

import { AlertTriangle, Car, History, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PremiumCard, SectionTitle } from "@/components/design-system";
import { PriorityChip } from "@/components/priority-chip";
import { StatusBadge } from "@/components/status-badge";
import { loadOccurrences, typeLabel } from "@/lib/occurrence-store";
import type { OccurrenceDetail } from "@/types/parkflow";

export default function VehiclesPage() {
  const [occurrences, setOccurrences] = useState<OccurrenceDetail[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setOccurrences(loadOccurrences());
  }, []);

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    return occurrences.filter((occurrence) =>
      term
        ? [occurrence.vehicle.plate, occurrence.vehicle.model, occurrence.vehicle.brand, occurrence.occurrenceCode, occurrence.location, occurrence.type]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term))
        : true
    );
  }, [occurrences, search]);

  const plateGroups = useMemo(() => {
    const grouped = new Map<string, OccurrenceDetail[]>();
    results.forEach((occurrence) => {
      const current = grouped.get(occurrence.vehicle.plate) ?? [];
      grouped.set(occurrence.vehicle.plate, [...current, occurrence]);
    });
    return Array.from(grouped.entries()).map(([plate, history]) => ({
      plate,
      history: history.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    }));
  }, [results]);

  return (
    <AppShell title="Consulta de Placas" subtitle="Historico interno por placa e unidade">
      <PremiumCard className="p-5">
        <SectionTitle eyebrow="Base interna" title="Consultar placa" />
        <div className="mt-5 flex min-h-12 items-center gap-3 rounded-xl border border-line bg-black/25 px-3">
          <Search className="h-5 w-5 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Placa, unidade, tipo ou ID"
            className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>

        <div className="mt-5 grid gap-4">
          {plateGroups.length ? (
            plateGroups.map(({ plate, history }) => {
              const latest = history[0];
              const hasAlert = history.some((occurrence) => occurrence.alerts.length || occurrence.status === "ALERTA_GERADO");
              return (
                <div key={plate} className="rounded-xl border border-line bg-black/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-sm text-electric">{latest.occurrenceCode}</p>
                      <h3 className="mt-1 text-2xl font-semibold text-white">{plate}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {latest.vehicle.brand} {latest.vehicle.model} - {history.length} registro(s) no historico
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <PriorityChip priority={latest.priority} />
                      <StatusBadge status={latest.status} />
                    </div>
                  </div>

                  {hasAlert ? (
                    <div className="mt-4 rounded-lg border border-danger/25 bg-danger/10 p-3 text-sm leading-6 text-red-100">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                        <span>Atenção: veículo com histórico de suspeita registrado anteriormente.</span>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-3">
                    {history.map((occurrence) => (
                      <Link
                        key={occurrence.id}
                        href={`/ocorrencias/${occurrence.id}`}
                        className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 transition hover:border-electric/45 hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold text-white">
                            <History className="h-4 w-4 text-electric" />
                            {typeLabel(occurrence.type)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {occurrence.location} - {formatDate(occurrence.reportedAt)}
                          </p>
                        </div>
                        <StatusBadge status={occurrence.status} />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={Car}
              title="Placa nao encontrada"
              description="Pesquise uma placa, unidade ou ID. A consulta usa a base interna propria do ParkFlow."
            />
          )}
        </div>
      </PremiumCard>
    </AppShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
