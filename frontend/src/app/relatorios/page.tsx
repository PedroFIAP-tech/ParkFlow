"use client";

import { BarChart3, Clock, FileWarning, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PremiumCard, SectionTitle } from "@/components/design-system";
import { MetricCard } from "@/components/metric-card";

const bars = [
  { label: "Seg", value: 72 },
  { label: "Ter", value: 58 },
  { label: "Qua", value: 84 },
  { label: "Qui", value: 66 },
  { label: "Sex", value: 91 },
  { label: "Sab", value: 44 }
];

export default function ReportsPage() {
  return (
    <AppShell title="Relatorios / BI" subtitle="Indicadores separados da operacao diaria">
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="SLA medio" value="2h14" icon={Clock} tone="border-electric/30 bg-electric/10 text-electric" />
        <MetricCard label="Criticas" value="8" icon={ShieldAlert} tone="border-danger/30 bg-danger/10 text-danger" />
        <MetricCard label="Pendentes" value="21" icon={FileWarning} tone="border-warning/30 bg-warning/10 text-warning" />
        <MetricCard label="Resolvidas" value="132" icon={BarChart3} tone="border-success/30 bg-success/10 text-success" />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <PremiumCard className="p-5">
          <SectionTitle eyebrow="Performance" title="Volume operacional por dia" />
          <div className="mt-8 flex h-72 items-end gap-3 rounded-xl border border-line bg-black/20 p-5">
            {bars.map((bar) => (
              <div key={bar.label} className="flex h-full flex-1 flex-col justify-end gap-3">
                <div
                  className="rounded-t-lg border border-electric/30 bg-gradient-to-t from-brand to-electric/80 shadow-[0_0_24px_rgba(66,165,255,0.18)]"
                  style={{ height: `${bar.value}%` }}
                />
                <span className="text-center text-xs text-slate-500">{bar.label}</span>
              </div>
            ))}
          </div>
        </PremiumCard>

        <aside className="space-y-6">
          <PremiumCard className="p-5">
            <SectionTitle eyebrow="SLA" title="Tendencia" />
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-success/25 bg-success/10 p-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-5 w-5 text-success" />
                  <span className="text-sm font-semibold text-white">Tempo em aberto</span>
                </div>
                <span className="text-sm text-success">-18%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-warning/25 bg-warning/10 p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-warning" />
                  <span className="text-sm font-semibold text-white">Alertas criticos</span>
                </div>
                <span className="text-sm text-warning">+4 casos</span>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-5">
            <SectionTitle eyebrow="Leitura executiva" title="Resumo IA" />
            <p className="mt-5 rounded-xl border border-brand/20 bg-brand/10 p-4 text-sm leading-6 text-blue-100">
              O volume critico esta concentrado em placas reincidentes e acessos fora do padrao. Priorize consulta historica, evidencia visual e decisao do supervisor.
            </p>
          </PremiumCard>
        </aside>
      </section>
    </AppShell>
  );
}
