"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, ClipboardCheck, Loader2, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { PremiumButton } from "@/components/design-system";
import type { InspectionInput } from "@/lib/occurrence-store";
import type { OccurrenceDetail } from "@/types/parkflow";

export function InspectionModal({
  open,
  occurrences,
  onClose,
  onCreate
}: {
  open: boolean;
  occurrences: OccurrenceDetail[];
  onClose: () => void;
  onCreate: (input: InspectionInput) => void;
}) {
  const [occurrenceId, setOccurrenceId] = useState("");
  const [observation, setObservation] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setOccurrenceId(occurrences[0]?.id ?? "");
      setObservation("");
      setPhotoUrl("");
      setAnalyzing(false);
      setError("");
    }
  }, [open, occurrences]);

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(String(reader.result));
      setAnalyzing(true);
      window.setTimeout(() => setAnalyzing(false), 900);
    };
    reader.readAsDataURL(file);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!occurrenceId) {
      setError("Selecione uma ocorrencia para abrir a vistoria.");
      return;
    }
    if (!observation.trim()) {
      setError("Adicione uma observacao objetiva para a vistoria.");
      return;
    }
    onCreate({ occurrenceId, observation, photoUrl });
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <button aria-label="Fechar vistoria" className="absolute inset-0 cursor-default" onClick={onClose} />
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-line bg-[#07101f]/95 p-5 shadow-glow backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fluxo de campo</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Nova vistoria</h2>
                <p className="mt-2 text-sm text-slate-400">Abra uma vistoria simulada e mova a ocorrencia para analise.</p>
              </div>
              <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-slate-400 transition hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <ClipboardCheck className="h-4 w-4 text-electric" />
                  Ocorrencia
                </span>
                <select value={occurrenceId} onChange={(event) => setOccurrenceId(event.target.value)} className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25">
                  {occurrences.map((occurrence) => (
                    <option key={occurrence.id} value={occurrence.id}>
                      {occurrence.occurrenceCode} - {occurrence.vehicle.plate}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 text-sm font-medium text-slate-300">Observacao da vistoria</span>
                <textarea
                  value={observation}
                  onChange={(event) => setObservation(event.target.value)}
                  className="min-h-28 w-full resize-none rounded-lg border border-line bg-black/25 p-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                  placeholder="Ex.: vistoria iniciada, fotos laterais anexadas, aguardar avaliacao tecnica."
                />
              </label>

              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-electric/35 bg-brand/10 p-4 text-center transition hover:bg-brand/15">
                {photoUrl ? (
                  <Image src={photoUrl} alt="Preview da vistoria" width={640} height={300} unoptimized className="h-40 w-full rounded-lg object-cover" />
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-electric" />
                    <p className="mt-3 text-sm font-semibold text-white">Anexar foto simulada</p>
                    <p className="mt-1 text-xs text-slate-400">Opcional, mas atualiza a timeline.</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>

              {analyzing ? (
                <p className="flex items-center gap-2 rounded-lg border border-brand/25 bg-brand/10 p-3 text-sm text-blue-100">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparando evidencia para a IA...
                </p>
              ) : null}
              {error ? <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <PremiumButton type="button" variant="secondary" onClick={onClose}>Cancelar</PremiumButton>
              <PremiumButton type="submit" variant="primary">Iniciar vistoria</PremiumButton>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
