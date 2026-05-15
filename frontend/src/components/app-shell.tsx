"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { BarChart3, Bell, Building2, Car, ClipboardList, Home, Radar, Search, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { MobileNav } from "@/components/mobile-nav";
import { Toast, type ToastState } from "@/components/toast";

const navigation = [
  { label: "Operacao", href: "/", icon: Home },
  { label: "Ocorrencias", href: "/ocorrencias", icon: ClipboardList },
  { label: "Placas", href: "/veiculos", icon: Car },
  { label: "Unidades", href: "/unidades", icon: Building2 },
  { label: "Suspeitas", href: "/suspeitas", icon: Radar },
  { label: "Relatorios/BI", href: "/relatorios", icon: BarChart3 }
];

export function AppShell({
  children,
  title,
  subtitle,
  action
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  const pathname = usePathname();
  const [toast, setToast] = useState<ToastState>(null);

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2600);
  }

  return (
    <main className="operation-grid min-h-screen overflow-x-hidden bg-ink pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-0">
      <Toast toast={toast} />
      <div className="noise-overlay" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-ink/86 px-4 py-5 backdrop-blur-2xl xl:block">
        <div className="flex items-center gap-3 px-2">
          <BrandLogo className="h-14 w-56" />
        </div>

        <nav className="mt-8 space-y-1">
          {navigation.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                  active ? "border border-electric/25 bg-brand/15 text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <Icon className={clsx("h-4 w-4", active ? "text-electric" : "text-slate-500 group-hover:text-electric")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-5 rounded-xl border border-brand/20 bg-brand/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-100">
            <Sparkles className="h-4 w-4 text-electric" />
            IA ativa
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Leitura de placa, analise de evidencia e risco operacional conectados ao fluxo de seguranca.
          </p>
        </div>
      </aside>

      <div className="relative z-10 xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-ink/72 px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{subtitle}</p>
              <h2 className="mt-1 break-words text-xl font-semibold text-white min-[380px]:text-2xl">{title}</h2>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="hidden h-11 min-w-72 items-center gap-3 rounded-lg border border-line bg-black/25 px-3 text-slate-500 md:flex">
                <Search className="h-4 w-4" />
                <span className="text-sm">Comando rapido, placa ou unidade</span>
              </div>
              <button
                type="button"
                onClick={() => showToast({ type: "info", message: "Alertas disponiveis na central operacional." })}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-black/25 text-slate-300 transition hover:border-electric/45 hover:text-white"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => showToast({ type: "info", message: "Configuracoes simuladas para a apresentacao." })}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-black/25 text-slate-300 transition hover:border-electric/45 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </button>
              {action}
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-7xl px-3 py-6 min-[380px]:px-4 sm:px-6 lg:px-8"
        >
          {children}
        </motion.div>
      </div>

      <MobileNav />
    </main>
  );
}
