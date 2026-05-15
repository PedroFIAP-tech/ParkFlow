"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  Flag,
  Home as HomeIcon,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Radar,
  Sparkles,
  User,
  X
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { InspectionModal } from "@/components/inspection-modal";
import { MobileNav } from "@/components/mobile-nav";
import { NewOccurrenceModal } from "@/components/new-occurrence-modal";
import { RegisterVehicleModal } from "@/components/register-vehicle-modal";
import { Toast, type ToastState } from "@/components/toast";
import { VehicleSearchModal } from "@/components/vehicle-search-modal";
import {
  applyInspection,
  createOccurrence,
  filterOccurrences,
  loadOccurrences,
  saveOccurrences,
  statusLabel,
  typeLabel,
  type InspectionInput,
  type NewOccurrenceInput
} from "@/lib/occurrence-store";
import {
  createVehiclePresence,
  loadVehiclePresence,
  movementLabel,
  profileLabel,
  saveVehiclePresence,
  updateVehiclePresenceStatus,
  type VehiclePresence,
  type VehiclePresenceInput
} from "@/lib/vehicle-presence-store";
import type { OccurrenceDetail, OccurrenceStatus, Priority, TimelineEvent } from "@/types/parkflow";

type StatusFilter = OccurrenceStatus | "TODOS";
type PriorityFilter = Priority | "TODAS";
type NotificationItem = {
  id: string;
  title: string;
  description: string;
  read: boolean;
};

const statusFilters: Array<{ label: string; value: StatusFilter }> = [
  { label: "Todos", value: "TODOS" },
  { label: "Aberta", value: "ABERTA" },
  { label: "Em Analise", value: "EM_ANALISE" },
  { label: "Alerta Gerado", value: "ALERTA_GERADO" },
  { label: "Monitoramento", value: "MONITORAMENTO" },
  { label: "Resolvida", value: "RESOLVIDA" }
];

const priorityFilters: Array<{ label: string; value: PriorityFilter }> = [
  { label: "Todas", value: "TODAS" },
  { label: "Critica", value: "CRITICA" },
  { label: "Alta", value: "ALTA" },
  { label: "Media", value: "MEDIA" },
  { label: "Baixa", value: "BAIXA" }
];

const vehicleImages = [
  "https://res.cloudinary.com/demo/image/upload/c_fill,w_240,h_170,q_auto/sample.jpg",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=240&q=80"
];

const initialNotifications: NotificationItem[] = [
  {
    id: "n-1",
    title: "Placa critica em alerta",
    description: "BRP4K21 tem historico em outra unidade e precisa de decisao do supervisor.",
    read: false
  },
  {
    id: "n-2",
    title: "IA concluiu evidencia",
    description: "Analise visual sugeriu risco alto para FLO2W88.",
    read: false
  },
  {
    id: "n-3",
    title: "Consulta de placa pendente",
    description: "Confirme historico interno antes de resolver PF-2026-000147.",
    read: false
  }
];

const drawerItems = [
  { label: "Dashboard", icon: HomeIcon, action: "home" },
  { label: "Registrar Veículo", icon: Car, action: "registerVehicle" },
  { label: "Ocorrências", icon: ClipboardList, action: "occurrences" },
  { label: "Nova Ocorrência", icon: Plus, action: "new" },
  { label: "Evidências", icon: Camera, action: "inspection" },
  { label: "Unidades", icon: Building2, action: "units" },
  { label: "Suspeitas", icon: Radar, action: "suspects" },
  { label: "Relatórios/BI", icon: BarChart3, action: "reports" },
  { label: "Configurações", icon: Settings, action: "settings" },
  { label: "Sair", icon: LogOut, action: "logout" }
];

export default function Home() {
  const router = useRouter();
  const [occurrences, setOccurrences] = useState<OccurrenceDetail[]>([]);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<StatusFilter>("TODOS");
  const [priority, setPriority] = useState<PriorityFilter>("TODAS");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [vehicleRegisterOpen, setVehicleRegisterOpen] = useState(false);
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [vehicleSearchOpen, setVehicleSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [vehicleActivities, setVehicleActivities] = useState<VehiclePresence[]>([]);

  useEffect(() => {
    setOccurrences(loadOccurrences());
    setVehicleActivities(loadVehiclePresence());
    setReady(true);
    if (window.location.search.includes("register=1")) {
      setVehicleRegisterOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    if (window.location.search.includes("create=1")) {
      setModalOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const filteredOccurrences = useMemo(
    () => filterOccurrences(occurrences, search, status, priority),
    [occurrences, priority, search, status]
  );

  const recentTimeline = useMemo(() => buildRecentTimeline(occurrences), [occurrences]);
  const todayLabel = useMemo(() => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date()), []);

  const stats = useMemo(() => {
    const resolvedToday = occurrences.filter((item) => item.status === "RESOLVIDA" && isToday(item.updatedAt)).length;
    const alertCount = occurrences.filter((item) => item.status === "ALERTA_GERADO" || item.alerts.length > 0).length;
    const monitoredCount = occurrences.filter((item) => item.status === "MONITORAMENTO" || item.priority === "ALTA" || item.priority === "CRITICA").length;

    return [
      {
        label: "Ocorrencias Abertas",
        value: String(occurrences.filter((item) => item.status === "ABERTA").length),
        delta: "filtrar abertas",
        icon: FileText,
        tone: "bg-blue-600",
        active: status === "ABERTA",
        onClick: () => setStatus("ABERTA")
      },
      {
        label: "Alertas Ativos",
        value: String(alertCount),
        delta: "reincidencias",
        icon: Bell,
        tone: "bg-red-600",
        active: status === "ALERTA_GERADO",
        onClick: () => setStatus("ALERTA_GERADO")
      },
      {
        label: "Suspeitas Monitoradas",
        value: String(monitoredCount),
        delta: "ver lista",
        icon: Radar,
        tone: "bg-amber-500",
        active: false,
        onClick: () => router.push("/suspeitas")
      },
      {
        label: "Resolvidas Hoje",
        value: String(resolvedToday),
        delta: "ver resolvidas",
        icon: Check,
        tone: "bg-green-500",
        active: false,
        onClick: () => setStatus("RESOLVIDA")
      }
    ];
  }, [occurrences, router, status]);

  const activeAlertOccurrence = useMemo(
    () =>
      occurrences.find((item) => item.vehicle.plate === "ABC1D23") ??
      occurrences.find((item) => item.status === "ALERTA_GERADO" || item.alerts.length > 0 || item.priority === "CRITICA") ??
      occurrences[0],
    [occurrences]
  );

  const operationalSummary = useMemo(() => {
    const activeAlerts = occurrences.filter((item) => item.status === "ALERTA_GERADO" || item.alerts.length > 0).length;
    const suspiciousPlates = new Set(
      [
        ...occurrences
          .filter((item) => item.status === "ALERTA_GERADO" || item.alerts.length > 0 || item.priority === "ALTA" || item.priority === "CRITICA")
          .map((item) => item.vehicle.plate),
        ...vehicleActivities.filter((item) => item.alert || item.status === "SINALIZADO").map((item) => item.plate)
      ]
    ).size;

    return [
      {
        label: "Ocorrências",
        value: String(Math.max(occurrences.length, 24)),
        delta: "+12% vs ontem",
        icon: Car,
        tone: "blue" as const,
        onClick: () => router.push("/ocorrencias")
      },
      {
        label: "Alertas Ativos",
        value: String(Math.max(activeAlerts, 8)),
        delta: "+6% vs ontem",
        icon: Bell,
        tone: "green" as const,
        onClick: () => {
          setStatus("ALERTA_GERADO");
          router.push("/ocorrencias");
        }
      },
      {
        label: "Unidades Online",
        value: "12",
        delta: "100% online",
        icon: Building2,
        tone: "purple" as const,
        onClick: () => router.push("/unidades")
      },
      {
        label: "Placas Suspeitas",
        value: String(Math.max(suspiciousPlates, 37)),
        delta: "+8% vs ontem",
        icon: Clock3,
        tone: "amber" as const,
        onClick: () => router.push("/suspeitas")
      }
    ];
  }, [occurrences, router, vehicleActivities]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  function persist(next: OccurrenceDetail[]) {
    setOccurrences(next);
    saveOccurrences(next);
  }

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2800);
  }

  function persistVehicleActivities(next: VehiclePresence[]) {
    setVehicleActivities(next);
    saveVehiclePresence(next);
  }

  function handleRegisterVehicle(input: VehiclePresenceInput) {
    const created = createVehiclePresence(input, occurrences);
    persistVehicleActivities([created, ...vehicleActivities]);
    showToast({
      type: created.alert ? "error" : "success",
      message: created.alert?.message ?? `${created.plate} registrado em ${created.unit}.`
    });
  }

  function handleCreateOccurrence(input: NewOccurrenceInput) {
    const created = createOccurrence(input, occurrences);
    persist([created, ...occurrences]);
    setStatus("TODOS");
    setPriority("TODAS");
    setSearch("");
    showToast({
      type: created.alerts.length ? "error" : "success",
      message: created.alerts[0]?.message ?? "Ocorrencia criada e adicionada a fila operacional."
    });
  }

  function handleCreateInspection(input: InspectionInput) {
    persist(applyInspection(occurrences, input));
    showToast({ type: "success", message: "Evidencia registrada. Status movido para EM_ANALISE." });
  }

  function validateVehicleActivity(id: string) {
    const next = updateVehiclePresenceStatus(vehicleActivities, id, "VALIDADO");
    persistVehicleActivities(next);
    showToast({ type: "success", message: "Leitura validada e presenca registrada na unidade." });
  }

  function signalVehicleActivity(activity: VehiclePresence) {
    const created = createOccurrence(
      {
        plate: activity.plate,
        location: activity.unit,
        type: "PLACA_SUSPEITA",
        priority: activity.alert?.riskLevel ?? "ALTA",
        description: `${profileLabel(activity.profile)} em ${movementLabel(activity.movement).toLowerCase()} sinalizado pela rotina operacional.`,
        photoUrl: activity.imageUrl
      },
      occurrences
    );
    persist([created, ...occurrences]);
    persistVehicleActivities(updateVehiclePresenceStatus(vehicleActivities, activity.id, "SINALIZADO"));
    showToast({ type: "error", message: "Ocorrencia critica aberta a partir da leitura da placa." });
  }

  function runDrawerAction(action: string) {
    setDrawerOpen(false);
    if (action === "home") {
      setStatus("TODOS");
      setPriority("TODAS");
      setSearch("");
      router.push("/");
      return;
    }
    if (action === "occurrences") {
      router.push("/ocorrencias");
      return;
    }
    if (action === "registerVehicle") {
      setVehicleRegisterOpen(true);
      return;
    }
    if (action === "new") {
      setModalOpen(true);
      return;
    }
    if (action === "inspection") {
      setInspectionOpen(true);
      return;
    }
    if (action === "units") {
      router.push("/unidades");
      return;
    }
    if (action === "suspects") {
      router.push("/suspeitas");
      return;
    }
    if (action === "reports") {
      router.push("/relatorios");
      return;
    }
    if (action === "settings") {
      showToast({ type: "info", message: "Preferencias prontas para perfis Operador, Supervisor e Admin." });
      return;
    }
    showToast({ type: "info", message: "Sessao demo encerrada sem alterar seus dados." });
  }

  function markNotificationRead(id: string) {
    setNotifications((current) =>
      current.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
    );
  }

  return (
    <main className="operation-grid min-h-screen bg-[#050914] text-white">
      <Toast toast={toast} />
      <NewOccurrenceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateOccurrence}
        occurrences={occurrences}
        onError={(message) => showToast({ type: "error", message })}
      />
      <RegisterVehicleModal
        open={vehicleRegisterOpen}
        occurrences={occurrences}
        onClose={() => setVehicleRegisterOpen(false)}
        onRegister={handleRegisterVehicle}
        onError={(message) => showToast({ type: "error", message })}
      />
      <InspectionModal open={inspectionOpen} occurrences={occurrences} onClose={() => setInspectionOpen(false)} onCreate={handleCreateInspection} />
      <VehicleSearchModal open={vehicleSearchOpen} occurrences={occurrences} onClose={() => setVehicleSearchOpen(false)} />
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAction={runDrawerAction} />
      <NotificationsPanel
        open={notificationsOpen}
        notifications={notifications}
        onClose={() => setNotificationsOpen(false)}
        onRead={markNotificationRead}
      />
      <MoreMenu
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onReports={() => router.push("/relatorios")}
        onSettings={() => showToast({ type: "info", message: "Configuracoes simuladas abertas para a demo." })}
        onProfile={() => setProfileOpen(true)}
        onLogout={() => showToast({ type: "info", message: "Sessao demo encerrada." })}
      />

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-0 pb-0 pt-0 lg:px-4 lg:pb-8 lg:pt-8">
        <DesktopSidebar onAction={runDrawerAction} />

        <section className="min-w-0 flex-1 overflow-hidden">
          <div className="mx-auto min-h-dvh w-full max-w-none overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_36%),linear-gradient(180deg,#050914_0%,#070b15_100%)] shadow-none lg:min-h-0 lg:max-w-[520px] lg:rounded-3xl lg:border lg:border-white/10 lg:shadow-2xl">
            <header className="flex items-center justify-between gap-2 px-4 pt-5 min-[380px]:gap-3 sm:px-5 sm:pt-6 lg:px-7">
              <div className="flex min-w-0 items-center gap-2 min-[380px]:gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-200 transition hover:bg-white/[0.06] active:scale-95 min-[380px]:h-10 min-[380px]:w-10 lg:hidden"
                >
                  <Menu className="h-6 w-6 min-[380px]:h-7 min-[380px]:w-7" />
                </button>
                <button
                  type="button"
                  onClick={() => runDrawerAction("home")}
                  className="flex min-w-0 items-center rounded-xl text-left transition hover:opacity-90"
                >
                  <BrandLogo priority className="h-10 w-28 min-[360px]:w-36 min-[400px]:w-44 sm:h-12 sm:w-56 lg:w-64" />
                </button>
              </div>

              <div className="relative flex shrink-0 items-center gap-1.5 min-[380px]:gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(true)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-200 transition hover:bg-white/[0.06] active:scale-95 min-[380px]:h-10 min-[380px]:w-10"
                >
                  <Bell className="h-5 w-5 min-[380px]:h-6 min-[380px]:w-6" />
                  {unreadCount ? (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-slate-800 transition hover:border-electric/45 active:scale-95 min-[380px]:h-11 min-[380px]:w-11"
                >
                  <Image src="https://res.cloudinary.com/demo/image/upload/c_fill,w_96,h_96,q_auto/woman.jpg" alt="Usuario" width={96} height={96} />
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#050914] bg-green-400" />
                </button>
                <ProfileMenu
                  open={profileOpen}
                  onClose={() => setProfileOpen(false)}
                  onToast={showToast}
                />
              </div>
            </header>

            <div className="px-3.5 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-6 min-[380px]:px-4 sm:px-5 lg:px-6 lg:pb-6">
              <section className="space-y-2">
                <h1 className="text-[1.45rem] font-bold leading-tight tracking-normal text-white min-[360px]:text-[1.65rem] sm:text-3xl">
                  Boa noite, Joao! <span aria-hidden="true">👋</span>
                </h1>
                <button
                  type="button"
                  onClick={() => showToast({ type: "info", message: "Seletor de unidade pronto para conectar ao perfil do operador." })}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-200"
                >
                  Unidade Jardins
                  <ChevronDown className="h-4 w-4" />
                </button>
              </section>

              <section className="mt-6 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                <HomeActionCard
                  variant="vehicle"
                  title="Registrar"
                  emphasis="Veículo"
                  media="/CarroIcon.png"
                  onClick={() => setVehicleRegisterOpen(true)}
                />

                <HomeActionCard
                  variant="occurrence"
                  title="Nova"
                  emphasis="Ocorrência"
                  media="/PalhetaIcon.png"
                  onClick={() => setModalOpen(true)}
                />
              </section>

              <section className="mt-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white">Atividade Recente</h2>
                  <button
                    type="button"
                    onClick={() => router.push("/veiculos")}
                    className="text-sm font-bold text-electric transition hover:text-blue-200"
                  >
                    Ver todas
                  </button>
                </div>

                <div className="space-y-2">
                  {!ready ? (
                    Array.from({ length: 4 }).map((_, index) => <SkeletonRow key={index} />)
                  ) : vehicleActivities.length ? (
                    vehicleActivities.slice(0, 4).map((item) => (
                      <VehicleActivityRow
                        key={item.id}
                        activity={item}
                        onValidate={() => validateVehicleActivity(item.id)}
                        onSignal={() => signalVehicleActivity(item)}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
                      <Search className="mx-auto h-8 w-8 text-electric" />
                      <h3 className="mt-3 font-semibold text-white">Nenhuma leitura recente</h3>
                      <p className="mt-1 text-sm text-slate-400">Registre um veículo para alimentar a rotina operacional.</p>
                    </div>
                  )}
                </div>
              </section>

              <ActiveSuspicionCard
                occurrence={activeAlertOccurrence}
                onClick={() => {
                  if (activeAlertOccurrence) {
                    router.push(`/ocorrencias/${activeAlertOccurrence.id}`);
                    return;
                  }
                  router.push("/suspeitas");
                }}
              />

              <section className="mt-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white">Resumo Operacional</h2>
                  <button
                    type="button"
                    onClick={() => showToast({ type: "info", message: "Resumo atualizado para hoje." })}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-slate-200"
                  >
                    Hoje
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                  {operationalSummary.map((item) => (
                    <OperationalSummaryCard key={item.label} {...item} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>

      <MobileNav onNewOccurrence={() => setVehicleRegisterOpen(true)} onMore={() => setMoreOpen(true)} />
    </main>
  );
}

function DesktopSidebar({ onAction }: { onAction: (action: string) => void }) {
  return (
    <aside className="sticky top-8 hidden h-[calc(100vh-4rem)] w-72 shrink-0 rounded-3xl border border-white/10 bg-[#07101f]/90 p-4 shadow-2xl backdrop-blur-2xl lg:block">
      <div className="flex items-center gap-3 px-2 py-2">
        <BrandLogo className="h-14 w-56" />
      </div>
      <nav className="mt-6 space-y-1">
        {drawerItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onAction(item.action)}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white active:scale-[0.99]"
            >
              <Icon className="h-4 w-4 text-blue-300" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-blue-100">
          <Sparkles className="h-4 w-4 text-blue-300" />
          Demo IA ativa
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">Upload, timeline e alertas por placa funcionam localmente para apresentacao.</p>
      </div>
    </aside>
  );
}

function SideDrawer({
  open,
  onClose,
  onAction
}: {
  open: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm lg:hidden">
          <button aria-label="Fechar menu" className="absolute inset-0 cursor-default" onClick={onClose} />
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-[300px] border-r border-white/10 bg-[#07101f] p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrandLogo className="h-11 w-48" />
              </div>
              <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="mt-7 space-y-1">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onAction(item.action)}
                    className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-blue-300" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function NotificationsPanel({
  open,
  notifications,
  onClose,
  onRead
}: {
  open: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onRead: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[75] bg-black/50 p-4 backdrop-blur-sm">
          <button aria-label="Fechar notificacoes" className="absolute inset-0 cursor-default" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="relative ml-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#07101f]/95 p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Central de alertas</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Notificacoes</h2>
              </div>
              <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => onRead(notification.id)}
                  className={clsx(
                    "w-full rounded-xl border p-4 text-left transition hover:border-blue-400/45",
                    notification.read ? "border-white/10 bg-black/20 opacity-70" : "border-blue-400/25 bg-blue-500/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-white">{notification.title}</h3>
                    {!notification.read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400" /> : null}
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-400">{notification.description}</p>
                  <span className="mt-3 block text-xs font-semibold text-blue-300">{notification.read ? "Lida" : "Clique para marcar como lida"}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ProfileMenu({
  open,
  onClose,
  onToast
}: {
  open: boolean;
  onClose: () => void;
  onToast: (toast: ToastState) => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          className="absolute right-0 top-14 z-[60] w-56 rounded-2xl border border-white/10 bg-[#07101f]/95 p-2 shadow-2xl backdrop-blur-xl"
        >
          <ProfileButton icon={User} label="Meu perfil" onClick={() => { onClose(); onToast({ type: "info", message: "Perfil demo do operador ParkFlow." }); }} />
          <ProfileButton icon={Settings} label="Preferencias" onClick={() => { onClose(); onToast({ type: "info", message: "Preferencias prontas para conectar." }); }} />
          <ProfileButton icon={LogOut} label="Sair" onClick={() => { onClose(); onToast({ type: "info", message: "Sessao demo encerrada." }); }} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ProfileButton({
  icon: Icon,
  label,
  onClick
}: {
  icon: typeof User;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
      <Icon className="h-4 w-4 text-blue-300" />
      {label}
    </button>
  );
}

function MoreMenu({
  open,
  onClose,
  onReports,
  onSettings,
  onProfile,
  onLogout
}: {
  open: boolean;
  onClose: () => void;
  onReports: () => void;
  onSettings: () => void;
  onProfile: () => void;
  onLogout: () => void;
}) {
  const actions = [
    { label: "Relatorios/BI", icon: BarChart3, run: onReports },
    { label: "Configuracoes", icon: Settings, run: onSettings },
    { label: "Perfil", icon: User, run: onProfile },
    { label: "Sair", icon: LogOut, run: onLogout }
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[70] flex items-end bg-black/55 p-4 backdrop-blur-sm md:hidden">
          <button aria-label="Fechar mais" className="absolute inset-0 cursor-default" onClick={onClose} />
          <motion.div
            initial={{ y: 220 }}
            animate={{ y: 0 }}
            exit={{ y: 220 }}
            transition={{ duration: 0.22 }}
            className="relative w-full rounded-2xl border border-white/10 bg-[#07101f] p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">Mais opcoes</h2>
              <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    onClose();
                    action.run();
                  }}
                  className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Icon className="h-4 w-4 text-blue-300" />
                  {action.label}
                </button>
              );
            })}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function HomeActionCard({
  variant,
  title,
  emphasis,
  media,
  onClick
}: {
  variant: "vehicle" | "occurrence";
  title: string;
  emphasis: string;
  media: string;
  onClick: () => void;
}) {
  const isVehicle = variant === "vehicle";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        "group relative min-h-[104px] overflow-hidden rounded-2xl border p-2.5 text-left shadow-[0_18px_46px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 lg:p-3 lg:pr-9",
        isVehicle
          ? "border-electric/35 bg-[radial-gradient(circle_at_20%_10%,rgba(31,111,235,0.26),transparent_42%),linear-gradient(135deg,#07172e_0%,#06101e_100%)]"
          : "border-danger/30 bg-[radial-gradient(circle_at_20%_10%,rgba(239,68,68,0.2),transparent_42%),linear-gradient(135deg,#211012_0%,#080a10_100%)]"
      )}
    >
      <div className="flex h-full min-w-0 items-center gap-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center drop-shadow-[0_16px_20px_rgba(0,0,0,0.45)] lg:h-14 lg:w-16">
          <Image
            src={media}
            alt={`${title} ${emphasis}`}
            width={96}
            height={96}
            className="h-10 w-10 object-contain lg:h-14 lg:w-16"
            priority
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="block break-words text-[0.92rem] font-bold leading-5 text-white lg:text-base">{title}</span>
          <span className={clsx("mt-0.5 block break-words text-[0.92rem] font-bold leading-5 lg:text-base", isVehicle ? "text-electric" : "text-danger")}>
            {emphasis}
          </span>
        </div>

        <span className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.08] text-white/80 transition group-hover:bg-white/[0.14] group-hover:text-white lg:flex">
          <ChevronRight className="h-5 w-5" />
        </span>
      </div>
    </motion.button>
  );
}

function ActiveSuspicionCard({
  occurrence,
  onClick
}: {
  occurrence?: OccurrenceDetail;
  onClick: () => void;
}) {
  const plate = occurrence?.vehicle.plate ?? "ABC1D23";
  const description = occurrence?.description || "Tentativa de furto de veículo";
  const lastOccurrence = occurrence?.reportedAt ? formatOccurrenceTimestamp(occurrence.reportedAt) : "10/05/2025 às 14:30";
  const unit = occurrence?.location ?? "Unidade Jardim Paulista";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="group relative mt-7 min-h-[152px] w-full overflow-hidden rounded-2xl border border-danger/55 bg-[radial-gradient(circle_at_78%_48%,rgba(239,68,68,0.18),transparent_35%),linear-gradient(135deg,rgba(70,13,17,0.72),rgba(6,9,14,0.98)_56%)] p-4 text-left shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
    >
      <div className="relative z-10 flex min-h-[120px]">
        <div className="min-w-0 flex-1 pr-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase leading-4 tracking-[0.12em] text-danger min-[380px]:text-[11px]">
              <AlertTriangle className="h-4 w-4" />
              ALERTA DE SUSPEITA ATIVA
            </span>
            <span className="text-[10px] font-black uppercase leading-4 tracking-[0.1em] text-danger">
              COMPARTILHADO ENTRE UNIDADES
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <strong className="font-mono text-2xl font-black tracking-normal text-white min-[360px]:text-3xl">{plate}</strong>
            <span className="rounded-lg border border-danger/25 bg-danger/15 px-3 py-1 text-xs font-black text-danger">ALTO RISCO</span>
          </div>

          <p className="mt-3 max-w-[230px] truncate text-sm font-semibold text-white">{description}</p>
          <p className="mt-2 text-sm leading-5 text-slate-400">Última ocorrência: {lastOccurrence}</p>
          <p className="mt-1 text-sm text-slate-400">{unit}</p>
        </div>

        <div className="relative hidden w-28 shrink-0 items-end justify-center min-[460px]:flex">
          <Image
            src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=240&q=80"
            alt="Veículo em alerta"
            width={160}
            height={120}
            unoptimized
            className="absolute bottom-1 right-2 h-24 w-32 rounded-xl object-cover opacity-50 mix-blend-screen saturate-75"
          />
        </div>
        <span className="absolute bottom-9 right-1 z-20 flex h-9 w-9 items-center justify-center rounded-full text-white/75 transition group-hover:text-white">
          <ChevronRight className="h-6 w-6" />
        </span>
      </div>
    </motion.button>
  );
}

function OperationalSummaryCard({
  label,
  value,
  delta,
  icon: Icon,
  tone,
  onClick
}: {
  label: string;
  value: string;
  delta: string;
  icon: typeof Car;
  tone: "blue" | "green" | "purple" | "amber";
  onClick: () => void;
}) {
  const tones = {
    blue: "border-electric/20 bg-electric/10 text-electric",
    green: "border-success/20 bg-success/10 text-success",
    purple: "border-violet-400/25 bg-violet-500/15 text-violet-300",
    amber: "border-amber-400/25 bg-amber-500/15 text-amber-300"
  };
  const deltaTones = {
    blue: "text-electric",
    green: "text-success",
    purple: "text-success",
    amber: "text-success"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[118px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1018]/90 p-3 text-left shadow-[0_16px_44px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-white/20 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span className={clsx("flex h-10 w-10 items-center justify-center rounded-xl border", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        <strong className="text-2xl font-black text-white min-[380px]:text-3xl">{value}</strong>
      </div>
      <p className="mt-3 break-words text-[13px] font-semibold leading-4 text-slate-300 min-[380px]:text-sm">{label}</p>
      <span className={clsx("mt-1 block break-words text-xs font-bold leading-4", deltaTones[tone])}>{delta}</span>
    </button>
  );
}

function QuickAction({
  label,
  icon: Icon,
  tone,
  onClick
}: {
  label: string;
  icon: typeof Plus;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[86px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-2 text-center transition hover:-translate-y-0.5 hover:border-blue-400/35 hover:bg-white/[0.06] active:scale-95"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${tone}`}>
        <Icon className="h-6 w-6 text-white" />
      </span>
      <span className="mt-2 text-xs font-medium leading-4 text-slate-100">{label}</span>
    </button>
  );
}

function FilterButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition active:scale-95",
        active ? "border-blue-400/60 bg-blue-500/20 text-blue-100" : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function OccurrenceRow({
  occurrence,
  image,
  onClick
}: {
  occurrence: OccurrenceDetail;
  image: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-2 text-left transition hover:border-blue-400/35 hover:bg-white/[0.06] active:scale-[0.99]"
    >
      <Image src={image} alt={occurrence.vehicle.plate} width={84} height={62} unoptimized className="h-[62px] w-[84px] rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-white">{occurrence.occurrenceCode.replace("PF-2026-", "#")}</span>
          <span className="text-slate-500">-</span>
          <span className="font-semibold text-white">{occurrence.vehicle.plate}</span>
        </div>
        <p className="mt-1 truncate text-sm text-slate-400">{typeLabel(occurrence.type)} - {occurrence.location}</p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <span className={clsx("rounded-lg border px-2 py-1 text-xs font-semibold", statusTone(occurrence.status))}>
          {statusLabel(occurrence.status)}
        </span>
        <p className="mt-2 text-xs text-slate-400">{occurrence.stoppedMinutes} min em aberto</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:text-blue-300" />
    </motion.button>
  );
}

function VehicleActivityRow({
  activity,
  onValidate,
  onSignal
}: {
  activity: VehiclePresence;
  onValidate: () => void;
  onSignal: () => void;
}) {
  const isValidated = activity.status === "VALIDADO";
  const isSignaled = activity.status === "SINALIZADO";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "rounded-2xl border bg-[#0b1018]/90 p-3 shadow-[0_12px_36px_rgba(0,0,0,0.2)] transition",
        activity.alert ? "border-danger/35" : "border-white/10"
      )}
    >
      <div className="flex flex-col gap-3 min-[440px]:flex-row min-[440px]:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
            <Car className="h-7 w-7 text-electric" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-electric px-1.5 py-1 text-[11px] font-black text-white">{activity.source}</span>
              <span className="font-mono text-base font-black text-white sm:text-lg">{activity.plate}</span>
            </div>
            <p className="mt-1 text-sm leading-5 text-slate-400">
              Leitura realizada há {formatRelativeMinutes(activity.createdAt)} min
            </p>
            <p className="mt-1 truncate text-sm text-slate-500">
              {activity.unit} <span className="mx-1">•</span> {movementLabel(activity.movement)}
            </p>
          </div>
        </div>

        <div className="grid w-full shrink-0 grid-cols-2 gap-2 min-[440px]:flex min-[440px]:w-auto">
          <button
            type="button"
            onClick={onValidate}
            disabled={isValidated || isSignaled}
            className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-success/25 bg-success/10 px-2 text-xs font-bold text-success transition hover:bg-success/15 disabled:cursor-not-allowed disabled:opacity-50 min-[440px]:px-2.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="truncate">{isValidated ? "Validado" : "Validar"}</span>
          </button>
          <button
            type="button"
            onClick={onSignal}
            disabled={isSignaled}
            className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg border border-danger/25 bg-danger/10 px-2 text-xs font-bold text-danger transition hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-50 min-[440px]:px-2.5"
          >
            <Flag className="h-4 w-4" />
            <span className="truncate">{isSignaled ? "Sinalizado" : "Sinalizar"}</span>
          </button>
        </div>
      </div>

      {activity.alert ? (
        <div className="mt-3 rounded-lg border border-danger/25 bg-danger/10 p-3 text-sm leading-6 text-red-100">
          {activity.alert.message}
          <span className="block text-slate-300">
            Unidade anterior: {activity.alert.previousUnit} - Risco: {activity.alert.riskLevel}
          </span>
        </div>
      ) : null}
    </motion.div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-2">
      <div className="h-[62px] w-[84px] animate-pulse rounded-lg bg-white/[0.08]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-white/[0.08]" />
        <div className="h-3 w-56 animate-pulse rounded bg-white/[0.06]" />
      </div>
    </div>
  );
}

function TimelineList({
  events,
  onOpen
}: {
  events: Array<TimelineEvent & { occurrenceId: string; plate: string }>;
  onOpen: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Timeline</p>
          <h2 className="text-lg font-bold">Atualizacoes recentes</h2>
        </div>
        <MoreHorizontal className="h-5 w-5 text-slate-500" />
      </div>
      <div className="space-y-3">
        {events.map((event) => (
          <button
            type="button"
            key={`${event.occurrenceId}-${event.id}`}
            onClick={() => onOpen(event.occurrenceId)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-blue-400/35 hover:bg-white/[0.05]"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-400 shadow-[0_0_18px_rgba(66,165,255,0.6)]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{event.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{event.plate} - {event.description}</p>
                <p className="mt-2 text-[11px] text-slate-600">{formatShortTime(event.createdAt)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function buildRecentTimeline(occurrences: OccurrenceDetail[]) {
  return occurrences
    .flatMap((occurrence) =>
      occurrence.timeline.map((event) => ({
        ...event,
        occurrenceId: occurrence.id,
        plate: occurrence.vehicle.plate
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
}

function statusTone(status: OccurrenceStatus) {
  const tones: Record<OccurrenceStatus, string> = {
    ABERTA: "border-blue-400/20 bg-blue-500/20 text-blue-300",
    EM_ANALISE: "border-violet-400/25 bg-violet-500/15 text-violet-300",
    ALERTA_GERADO: "border-red-400/30 bg-red-500/15 text-red-300",
    MONITORAMENTO: "border-amber-400/25 bg-amber-500/15 text-amber-300",
    RESOLVIDA: "border-green-400/25 bg-green-500/15 text-green-300",
    CANCELADA: "border-slate-400/25 bg-slate-500/15 text-slate-300"
  };
  return tones[status];
}

function formatShortTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatOccurrenceTimestamp(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
    .format(new Date(value))
    .replace(",", " às");
}

function formatRelativeMinutes(value: string) {
  return Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
}

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}
