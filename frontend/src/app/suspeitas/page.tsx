"use client";

import { AlertTriangle, Radar, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PremiumCard, SectionTitle } from "@/components/design-system";
import { PriorityChip } from "@/components/priority-chip";
import { StatusBadge } from "@/components/status-badge";
import { loadOccurrences, typeLabel } from "@/lib/occurrence-store";
import type { OccurrenceDetail } from "@/types/parkflow";

export default function SuspectsPage() {
  const [occurrences, setOccurrences] = useState<OccurrenceDetail[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setOccurrences(loadOccurrences());
  }, []);

  const suspects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return occurrences
      .filter((item) => item.status === "ALERTA_GERADO" || item.alerts.length > 0 || item.priority === "ALTA" || item.priority === "CRITICA")
      .filter((item) =>
        term
          ? [item.vehicle.plate, item.location, item.occurrenceCode, item.vehicle.model, item.status, item.type]
              .filter(Boolean)
              .some((value) => value!.toLowerCase().includes(term))
          : true
      );
  }, [occurrences, search]);

  return (
    <AppShell title="Lista de Suspeitas" subtitle="Placas e ocorrencias com risco operacional">
      <PremiumCard className="p-5">
        <SectionTitle eyebrow="Monitoramento" title="Placas suspeitas" />
        <div className="mt-5 flex h-12 items-center gap-3 rounded-xl border border-line bg-black/25 px-3">
          <Search className="h-5 w-5 text-electric" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar placa, unidade, ID, risco ou status"
            className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>

        <div className="mt-5 grid gap-3">
          {suspects.length ? (
            suspects.map((occurrence) => (
              <Link
                key={occurrence.id}
                href={`/ocorrencias/${occurrence.id}`}
                className="rounded-xl border border-line bg-black/20 p-4 transition hover:border-electric/45 hover:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-sm text-electric">{occurrence.occurrenceCode}</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{occurrence.vehicle.plate}</h3>
                    <p className="mt-2 text-sm text-slate-400">{typeLabel(occurrence.type)} - {occurrence.location}</p>
                    {occurrence.alerts[0] ? (
                      <p className="mt-3 flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/10 p-3 text-sm leading-6 text-red-100">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                        {occurrence.alerts[0].message}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <PriorityChip priority={occurrence.priority} />
                    <StatusBadge status={occurrence.status} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              icon={Radar}
              title="Nenhuma suspeita encontrada"
              description="Nao ha placas de alto risco dentro desse filtro."
            />
          )}
        </div>
      </PremiumCard>
    </AppShell>
  );
}
