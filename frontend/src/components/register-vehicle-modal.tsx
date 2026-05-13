"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Camera, Car, CheckCircle2, MapPin, ScanLine, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { OCRResultCard } from "@/components/ocr-result-card";
import { PremiumButton } from "@/components/design-system";
import { requestParkFlowOCR, type AIAnalysisStatus, type ParkFlowOCRResult } from "@/lib/ai-analysis";
import { getPlateHistory, typeLabel } from "@/lib/occurrence-store";
import type { VehicleMovement, VehiclePresenceInput, VehicleProfile } from "@/lib/vehicle-presence-store";
import type { OccurrenceDetail } from "@/types/parkflow";

const emptyForm = {
  plate: "",
  unit: "Unidade Jardins",
  movement: "ENTRADA" as VehicleMovement,
  profile: "VISITANTE" as VehicleProfile
};

export function RegisterVehicleModal({
  open,
  occurrences,
  onClose,
  onRegister,
  onError
}: {
  open: boolean;
  occurrences: OccurrenceDetail[];
  onClose: () => void;
  onRegister: (input: VehiclePresenceInput) => void;
  onError?: (message: string) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [ocrStatus, setOcrStatus] = useState<AIAnalysisStatus>("idle");
  const [ocrResult, setOcrResult] = useState<ParkFlowOCRResult | null>(null);
  const [ocrError, setOcrError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setImageFile(null);
      setImageUrl("");
      setOcrStatus("idle");
      setOcrResult(null);
      setOcrError("");
      setError("");
    }
  }, [open]);

  const plateHistory = useMemo(() => getPlateHistory(occurrences, form.plate), [form.plate, occurrences]);
  const previousOccurrence = plateHistory[0];

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(file);
    setOcrStatus("idle");
    setOcrResult(null);
    setOcrError("");
  }

  async function readPlate() {
    setError("");
    setOcrError("");
    if (!imageFile) {
      setOcrStatus("error");
      setOcrError("Selecione uma foto para leitura automatica.");
      return;
    }

    setOcrStatus("loading");
    setOcrResult(null);

    try {
      const result = await requestParkFlowOCR({ occurrenceId: `presence-${Date.now()}`, image: imageFile });
      setOcrResult(result);
      setOcrStatus("success");
      if (result.plate && result.plate !== "Nao identificada") {
        update("plate", result.plate);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel ler a placa.";
      setOcrStatus("error");
      setOcrError(message);
      onError?.(message);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.plate.trim() || !form.unit.trim()) {
      setError("Informe placa e unidade para registrar a presenca.");
      return;
    }

    onRegister({
      ...form,
      imageUrl,
      confidence: ocrResult?.confidence,
      source: ocrResult ? "IA" : "MANUAL"
    });
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <button aria-label="Fechar registro de veiculo" className="absolute inset-0 cursor-default" onClick={onClose} />
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl border border-line bg-[#07101f]/95 p-5 shadow-glow backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Rotina operacional</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Registrar veículo</h2>
                <p className="mt-2 text-sm text-slate-400">Use para entrada, saida e validacao rapida. Isso nao abre incidente.</p>
              </div>
              <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-slate-400 transition hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Car className="h-4 w-4 text-electric" />
                    Placa confirmada *
                  </span>
                  <input
                    value={form.plate}
                    onChange={(event) => update("plate", event.target.value.toUpperCase())}
                    placeholder="ABC1D23"
                    className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 font-mono uppercase text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <MapPin className="h-4 w-4 text-electric" />
                    Unidade *
                  </span>
                  <input
                    value={form.unit}
                    onChange={(event) => update("unit", event.target.value)}
                    placeholder="Unidade Jardins"
                    className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 text-sm font-medium text-slate-300">Movimento</span>
                    <select
                      value={form.movement}
                      onChange={(event) => update("movement", event.target.value as VehicleMovement)}
                      className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                    >
                      <option value="ENTRADA">Entrada</option>
                      <option value="SAIDA">Saida</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 text-sm font-medium text-slate-300">Perfil</span>
                    <select
                      value={form.profile}
                      onChange={(event) => update("profile", event.target.value as VehicleProfile)}
                      className="h-12 w-full rounded-lg border border-line bg-black/25 px-3 text-white outline-none focus:border-electric/60 focus:ring-2 focus:ring-electric/25"
                    >
                      <option value="VISITANTE">Visitante</option>
                      <option value="MENSALISTA">Mensalista</option>
                      <option value="PRESTADOR">Prestador</option>
                    </select>
                  </label>
                </div>

                <div className="rounded-xl border border-electric/20 bg-electric/10 p-4 text-sm leading-6 text-blue-100">
                  <p className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Consulta automatica
                  </p>
                  <p className="mt-1 text-slate-300">
                    Ao confirmar, o sistema verifica historico da placa e registra a presenca na unidade.
                  </p>
                </div>

                {previousOccurrence ? (
                  <div className="rounded-xl border border-danger/35 bg-danger/10 p-4 text-sm leading-6 text-red-50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                      <div>
                        <p className="font-semibold text-danger">Atenção: veículo com histórico de suspeita registrado anteriormente.</p>
                        <p className="mt-2 text-slate-300">
                          Unidade anterior: <span className="text-white">{previousOccurrence.location}</span> - Tipo:{" "}
                          <span className="text-white">{typeLabel(previousOccurrence.type)}</span> - Risco:{" "}
                          <span className="text-white">{previousOccurrence.priority}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {error ? <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
              </div>

              <div>
                <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-electric/35 bg-brand/10 p-4 text-center transition hover:bg-brand/15">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="Preview do veiculo" className="h-44 w-full rounded-lg object-cover" />
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-electric" />
                      <p className="mt-3 text-sm font-semibold text-white">Foto da placa</p>
                      <p className="mt-1 text-xs text-slate-400">Opcional para cadastro manual.</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>

                <PremiumButton
                  type="button"
                  variant="secondary"
                  onClick={readPlate}
                  disabled={!imageFile || ocrStatus === "loading"}
                  className="mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ScanLine className="h-4 w-4" />
                  {ocrStatus === "loading" ? "Lendo placa..." : "Ler placa com IA"}
                </PremiumButton>

                <div className="mt-3">
                  <OCRResultCard status={ocrStatus} result={ocrResult} message={ocrError} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <PremiumButton type="button" variant="secondary" onClick={onClose}>Cancelar</PremiumButton>
              <PremiumButton type="submit" variant="primary">Registrar presença</PremiumButton>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
