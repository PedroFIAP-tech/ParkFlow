"use client";

import {
  AlertTriangle,
  BarChart3,
  Car,
  ClipboardPlus,
  FileSearch,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TimerReset
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { MobileNav } from "@/components/mobile-nav";
import { OccurrenceCard } from "@/components/occurrence-card";
import { QuickAction } from "@/components/quick-action";
import { listOccurrences } from "@/lib/api";
import { mockOccurrences, mockTimeline } from "@/lib/mock-data";
import type { OccurrenceSummary, Priority } from "@/types/parkflow";

export default function Home() {
  const [search, setSearch] = useState("");
  const [occurrences, setOccurrences] = useState<OccurrenceSummary[]>(mockOccurrences);
  const [apiState, setApiState] = useState<"demo" | "online" | "loading">("loading");

  useEffect(() => {
    listOccurrences()
      .then((data) => {
        setOccurrences(data.length ? data : mockOccurrences);
        setApiState("online");
      })
      .catch(() => {
        setOccurrences(mockOccurrences);
        setApiState("demo");
      });
  }, []);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) {
      return occurrences;
    }
    return occurrences.filter((occurrence) =>
      [
        occurrence.occurrenceCode,
        occurrence.vehicle.plate,
        occurrence.vehicle.chassis,
        occurrence.vehicle.model,
        occurrence.location
      ]
        .filter(Boolean)
        .some((item) => item!.toLowerCase().includes(value))
    );
  }, [occurrences, search]);

  const priorityCount = (priority: Priority) => occurrences.filter((item) => item.priority === priority).length;
  const stoppedAverage = Math.round(occurrences.reduce((total, item) => total + item.stoppedMinutes, 0) / occurrences.length);

  return (
    <main className="operation-grid min-h-screen pb-28 md:pb-0">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="glass-panel rounded-lg px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-electric/35 bg-brand/20">
                  <ShieldCheck className="h-6 w-6 text-electric" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Central operacional</p>
                  <h1 className="text-2xl font-semibold text-white">ParkFlow</h1>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-400">Bom dia, operador. Foco nas ocorrencias em andamento e nos pontos parados.</p>
            </div>

            <div className="flex w-full max-w-xl items-center gap-3 rounded-lg border border-line bg-black/25 px-3 py-2">
              <Search className="h-5 w-5 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por ocorrencia, placa ou chassi"
                className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />
              <span className="hidden rounded-md border border-line px-2 py-1 text-xs text-slate-500 sm:inline-flex">
                {apiState === "online" ? "API online" : apiState === "loading" ? "Sincronizando" : "Demo"}
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction label="Nova Ocorrencia" icon={Plus} primary />
          <QuickAction label="Nova Vistoria" icon={ClipboardPlus} />
          <QuickAction label="Buscar Veiculo" icon={Car} />
          <QuickAction label="Relatorios / BI" icon={BarChart3} />
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Criticas" value={priorityCount("CRITICA")} icon={AlertTriangle} tone="border-danger/30 bg-danger/10 text-danger" />
          <MetricCard label="Alta" value={priorityCount("ALTA")} icon={TimerReset} tone="border-orange-400/30 bg-orange-400/10 text-orange-300" />
          <MetricCard label="Media" value={priorityCount("MEDIA")} icon={FileSearch} tone="border-warning/30 bg-warning/10 text-warning" />
          <MetricCard label="Tempo medio" value={`${stoppedAverage}m`} icon={Sparkles} tone="border-electric/30 bg-electric/10 text-electric" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="glass-panel rounded-lg p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Fila ativa</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Ocorrencias em andamento</h2>
              </div>
              <span className="rounded-md border border-line bg-black/20 px-3 py-2 text-sm text-slate-300">
                {filtered.length} registros
              </span>
            </div>
            <div className="grid gap-3">
              {filtered.map((occurrence) => (
                <OccurrenceCard key={occurrence.id} occurrence={occurrence} />
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="glass-panel rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-electric/30 bg-electric/10">
                  <Sparkles className="h-5 w-5 text-electric" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">IA operacional</p>
                  <h2 className="text-lg font-semibold text-white">Proxima melhor acao</h2>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-brand/20 bg-brand/10 p-4 text-sm leading-6 text-blue-100">
                Priorizar ocorrencias criticas com mais de 120 minutos paradas. Iniciar vistoria tecnica antes de encaminhar para oficina.
              </div>
            </div>

            <div className="glass-panel rounded-lg p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Atualizacoes recentes</p>
              <div className="mt-4 space-y-4">
                {mockTimeline.map((event) => (
                  <div key={event.id} className="border-l border-line pl-4">
                    <p className="text-sm font-semibold text-white">{event.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{event.description}</p>
                    <p className="mt-2 text-xs text-slate-600">{event.createdBy}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
      <MobileNav />
    </main>
  );
}

