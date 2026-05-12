"use client";

import { MapPin, Search, Warehouse } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PremiumCard, SectionTitle } from "@/components/design-system";
import { PriorityChip } from "@/components/priority-chip";
import { StatusBadge } from "@/components/status-badge";
import { loadOccurrences } from "@/lib/occurrence-store";
import type { OccurrenceDetail } from "@/types/parkflow";

export default function YardsPage() {
  const [occurrences, setOccurrences] = useState<OccurrenceDetail[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setOccurrences(loadOccurrences());
  }, []);

  const vehicles = useMemo(() => {
    const term = search.trim().toLowerCase();
    return occurrences
      .filter((item) => item.status === "ENCAMINHADA_PATIO" || item.location.toLowerCase().includes("patio") || item.status === "AGUARDANDO_PECA")
      .filter((item) =>
        term
          ? [item.vehicle.plate, item.location, item.occurrenceCode, item.vehicle.model, item.status]
              .filter(Boolean)
              .some((value) => value!.toLowerCase().includes(term))
          : true
      );
  }, [occurrences, search]);

  return (
    <AppShell title="Patios" subtitle="Veiculos parados, pecas e encaminhamentos">
      <PremiumCard className="p-5">
        <SectionTitle eyebrow="Operacao de patio" title="Veiculos no patio" />
        <div className="mt-5 flex h-12 items-center gap-3 rounded-xl border border-line bg-black/25 px-3">
          <Search className="h-5 w-5 text-electric" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar placa, patio, ID ou status"
            className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>

        <div className="mt-5 grid gap-3">
          {vehicles.length ? (
            vehicles.map((occurrence) => (
              <Link
                key={occurrence.id}
                href={`/ocorrencias/${occurrence.id}`}
                className="rounded-xl border border-line bg-black/20 p-4 transition hover:border-electric/45 hover:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-sm text-electric">{occurrence.occurrenceCode}</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{occurrence.vehicle.plate}</h3>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      {occurrence.location}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{occurrence.vehicle.brand} {occurrence.vehicle.model}</p>
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
              icon={Warehouse}
              title="Nenhum veiculo encontrado"
              description="Nao ha veiculos com patio ou pecas dentro desse filtro. Envie uma ocorrencia para patio no detalhe para testar."
            />
          )}
        </div>
      </PremiumCard>
    </AppShell>
  );
}
