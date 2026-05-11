import { BarChart3, Clock, FileWarning, ShieldAlert } from "lucide-react";
import { MetricCard } from "@/components/metric-card";

export default function ReportsPage() {
  return (
    <main className="operation-grid min-h-screen px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <header className="glass-panel rounded-lg p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Relatorios / BI</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Indicadores executivos</h1>
          <p className="mt-2 text-sm text-slate-400">Area separada da operacao diaria para consulta gerencial.</p>
        </header>
        <section className="mt-5 grid gap-3 md:grid-cols-4">
          <MetricCard label="SLA medio" value="2h14" icon={Clock} tone="border-electric/30 bg-electric/10 text-electric" />
          <MetricCard label="Criticas" value="8" icon={ShieldAlert} tone="border-danger/30 bg-danger/10 text-danger" />
          <MetricCard label="Pendentes" value="21" icon={FileWarning} tone="border-warning/30 bg-warning/10 text-warning" />
          <MetricCard label="Finalizadas" value="132" icon={BarChart3} tone="border-success/30 bg-success/10 text-success" />
        </section>
      </div>
    </main>
  );
}

