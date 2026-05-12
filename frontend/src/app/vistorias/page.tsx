"use client";

import { ClipboardCheck, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { InspectionModal } from "@/components/inspection-modal";
import { PremiumButton, PremiumCard, SectionTitle } from "@/components/design-system";
import { PriorityChip } from "@/components/priority-chip";
import { StatusBadge } from "@/components/status-badge";
import { Toast, type ToastState } from "@/components/toast";
import { applyInspection, loadOccurrences, saveOccurrences, type InspectionInput } from "@/lib/occurrence-store";
import type { OccurrenceDetail } from "@/types/parkflow";

export default function InspectionsPage() {
  const [occurrences, setOccurrences] = useState<OccurrenceDetail[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    setOccurrences(loadOccurrences());
  }, []);

  const queue = useMemo(
    () => occurrences.filter((item) => item.status === "AGUARDANDO_VISTORIA" || item.status === "EM_ANALISE"),
    [occurrences]
  );

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2800);
  }

  function handleInspection(input: InspectionInput) {
    const next = applyInspection(occurrences, input);
    setOccurrences(next);
    saveOccurrences(next);
    showToast({ type: "success", message: "Vistoria iniciada e timeline atualizada." });
  }

  return (
    <AppShell
      title="Vistorias"
      subtitle="Agenda e execucao de campo"
      action={
        <PremiumButton variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova vistoria
        </PremiumButton>
      }
    >
      <Toast toast={toast} />
      <InspectionModal open={modalOpen} occurrences={occurrences} onClose={() => setModalOpen(false)} onCreate={handleInspection} />

      <PremiumCard className="p-5">
        <SectionTitle eyebrow="Fila de vistoria" title="Casos em campo" />
        <div className="mt-5 grid gap-3">
          {queue.length ? (
            queue.map((occurrence) => (
              <Link
                key={occurrence.id}
                href={`/ocorrencias/${occurrence.id}`}
                className="rounded-xl border border-line bg-black/20 p-4 transition hover:border-electric/45 hover:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-sm text-electric">{occurrence.occurrenceCode}</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{occurrence.vehicle.plate}</h3>
                    <p className="mt-1 text-sm text-slate-400">{occurrence.type} - {occurrence.location}</p>
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
              icon={ClipboardCheck}
              title="Nenhuma vistoria pendente"
              description="Use Nova vistoria para simular o inicio de campo em uma ocorrencia aberta."
            />
          )}
        </div>
      </PremiumCard>
    </AppShell>
  );
}
