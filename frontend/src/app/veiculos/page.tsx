"use client";

import { Car, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PremiumCard, SectionTitle } from "@/components/design-system";
import { StatusBadge } from "@/components/status-badge";
import { loadOccurrences } from "@/lib/occurrence-store";
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
        ? [occurrence.vehicle.plate, occurrence.vehicle.chassis, occurrence.vehicle.model, occurrence.vehicle.brand, occurrence.occurrenceCode]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term))
        : true
    );
  }, [occurrences, search]);

  return (
    <AppShell title="Veiculos" subtitle="Consulta operacional por placa e chassi">
      <PremiumCard className="p-5">
        <SectionTitle eyebrow="Base veicular" title="Buscar veiculo" />
        <div className="mt-5 flex min-h-12 items-center gap-3 rounded-xl border border-line bg-black/25 px-3">
          <Search className="h-5 w-5 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Placa, chassi, modelo ou ID"
            className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
        <div className="mt-5 grid gap-3">
          {results.length ? (
            results.map((occurrence) => (
              <Link
                key={occurrence.id}
                href={`/ocorrencias/${occurrence.id}`}
                className="rounded-xl border border-line bg-black/20 p-4 transition hover:border-electric/45 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-electric">{occurrence.occurrenceCode}</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{occurrence.vehicle.plate}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {occurrence.vehicle.brand} {occurrence.vehicle.model} - {occurrence.vehicle.color}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{occurrence.vehicle.chassis ?? "Chassi nao informado"}</p>
                  </div>
                  <StatusBadge status={occurrence.status} />
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              icon={Car}
              title="Veiculo nao encontrado"
              description="Pesquise por placa, chassi, modelo ou ID. Os resultados usam a base simulada do ParkFlow."
            />
          )}
        </div>
      </PremiumCard>
    </AppShell>
  );
}
