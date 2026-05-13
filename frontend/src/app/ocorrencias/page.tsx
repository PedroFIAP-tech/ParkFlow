"use client";

import { ClipboardList, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PremiumButton, PremiumCard, SectionTitle } from "@/components/design-system";
import { EmptyState } from "@/components/empty-state";
import { NewOccurrenceModal } from "@/components/new-occurrence-modal";
import { OccurrenceCard } from "@/components/occurrence-card";
import { Toast, type ToastState } from "@/components/toast";
import {
  createOccurrence,
  filterOccurrences,
  loadOccurrences,
  saveOccurrences,
  type NewOccurrenceInput
} from "@/lib/occurrence-store";
import type { OccurrenceDetail, OccurrenceStatus, Priority } from "@/types/parkflow";

type StatusFilter = OccurrenceStatus | "TODOS";
type PriorityFilter = Priority | "TODAS";

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "Todos", value: "TODOS" },
  { label: "Aberta", value: "ABERTA" },
  { label: "Em Analise", value: "EM_ANALISE" },
  { label: "Alerta Gerado", value: "ALERTA_GERADO" },
  { label: "Monitoramento", value: "MONITORAMENTO" },
  { label: "Resolvida", value: "RESOLVIDA" }
];

const priorityOptions: Array<{ label: string; value: PriorityFilter }> = [
  { label: "Todas", value: "TODAS" },
  { label: "Critica", value: "CRITICA" },
  { label: "Alta", value: "ALTA" },
  { label: "Media", value: "MEDIA" },
  { label: "Baixa", value: "BAIXA" }
];

export default function OccurrencesPage() {
  const [occurrences, setOccurrences] = useState<OccurrenceDetail[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("TODOS");
  const [priority, setPriority] = useState<PriorityFilter>("TODAS");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    setOccurrences(loadOccurrences());
  }, []);

  const filtered = useMemo(
    () => filterOccurrences(occurrences, search, status, priority),
    [occurrences, priority, search, status]
  );

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2800);
  }

  function handleCreate(input: NewOccurrenceInput) {
    const created = createOccurrence(input, occurrences);
    const next = [created, ...occurrences];
    setOccurrences(next);
    saveOccurrences(next);
    showToast({ type: created.alerts.length ? "error" : "success", message: created.alerts[0]?.message ?? "Ocorrencia criada e listada com sucesso." });
  }

  return (
    <AppShell
      title="Ocorrencias"
      subtitle="Lista completa com filtros operacionais"
      action={
        <PremiumButton variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova ocorrencia
        </PremiumButton>
      }
    >
      <Toast toast={toast} />
      <NewOccurrenceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
        occurrences={occurrences}
        onError={(message) => showToast({ type: "error", message })}
      />

      <PremiumCard className="p-5">
        <SectionTitle eyebrow="Fila operacional" title="Buscar e filtrar" />
        <div className="mt-5 flex h-12 items-center gap-3 rounded-xl border border-line bg-black/25 px-3">
          <Search className="h-5 w-5 text-electric" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Placa, ID, tipo, unidade ou local"
            className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
          {search ? (
            <button type="button" onClick={() => setSearch("")} className="text-xs font-semibold text-slate-500 transition hover:text-white">
              limpar
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`h-9 rounded-full border px-3 text-xs font-semibold transition ${
                status === option.value ? "border-electric/50 bg-brand/20 text-blue-100" : "border-line bg-white/[0.03] text-slate-400 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPriority(option.value)}
              className={`h-9 rounded-full border px-3 text-xs font-semibold transition ${
                priority === option.value ? "border-electric/50 bg-brand/20 text-blue-100" : "border-line bg-white/[0.03] text-slate-400 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PremiumCard>

      <section className="mt-6 space-y-4">
        {filtered.length ? (
          filtered.map((occurrence, index) => (
            <OccurrenceCard key={occurrence.id} occurrence={occurrence} index={index} />
          ))
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma ocorrencia encontrada"
            description="Ajuste os filtros, pesquise outro termo ou abra uma nova ocorrencia para alimentar a fila."
          />
        )}
      </section>
    </AppShell>
  );
}
