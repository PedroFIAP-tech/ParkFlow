"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Car, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import type { OccurrenceDetail } from "@/types/parkflow";

export function VehicleSearchModal({
  open,
  occurrences,
  onClose
}: {
  open: boolean;
  occurrences: OccurrenceDetail[];
  onClose: () => void;
}) {
  const [term, setTerm] = useState("");

  const results = useMemo(() => {
    const value = term.trim().toLowerCase();
    if (!value) {
      return occurrences.slice(0, 4);
    }
    return occurrences.filter((occurrence) =>
      [
        occurrence.vehicle.plate,
        occurrence.vehicle.chassis,
        occurrence.occurrenceCode,
        occurrence.location,
        occurrence.vehicle.model,
        occurrence.type
      ]
        .filter(Boolean)
        .some((item) => item!.toLowerCase().includes(value))
    );
  }, [occurrences, term]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <button aria-label="Fechar busca" className="absolute inset-0 cursor-default" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-line bg-[#07101f]/95 p-5 shadow-glow backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Busca operacional</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Buscar veiculo</h2>
                <p className="mt-2 text-sm text-slate-400">Pesquise por placa, ID, chassi, tipo ou local.</p>
              </div>
              <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-slate-400 transition hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex h-12 items-center gap-3 rounded-xl border border-line bg-black/25 px-3">
              <Search className="h-5 w-5 text-electric" />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                autoFocus
                placeholder="ABC1D23, PF-2026, chassi ou Patio Norte"
                className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <div className="mt-5 space-y-3">
              {results.length ? (
                results.map((occurrence) => (
                  <Link
                    key={occurrence.id}
                    href={`/ocorrencias/${occurrence.id}`}
                    onClick={onClose}
                    className="block rounded-xl border border-line bg-black/20 p-4 transition hover:border-electric/45 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm text-electric">{occurrence.occurrenceCode}</p>
                        <h3 className="mt-1 text-lg font-semibold text-white">{occurrence.vehicle.plate}</h3>
                        <p className="mt-1 text-sm text-slate-400">{occurrence.vehicle.brand} {occurrence.vehicle.model} - {occurrence.location}</p>
                      </div>
                      <StatusBadge status={occurrence.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState
                  icon={Car}
                  title="Nenhum veiculo encontrado"
                  description="Tente outra placa, codigo da ocorrencia, chassi, tipo ou local para refinar a busca."
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
