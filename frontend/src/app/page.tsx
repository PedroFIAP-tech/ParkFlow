"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Camera,
  Car,
  Check,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileText,
  Home as HomeIcon,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  User,
  Warehouse,
  X
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { InspectionModal } from "@/components/inspection-modal";
import { MobileNav } from "@/components/mobile-nav";
import { NewOccurrenceModal } from "@/components/new-occurrence-modal";
import { Toast, type ToastState } from "@/components/toast";
import { VehicleSearchModal } from "@/components/vehicle-search-modal";
import {
  applyInspection,
  createOccurrence,
  filterOccurrences,
  loadOccurrences,
  saveOccurrences,
  statusLabel,
  type InspectionInput,
  type NewOccurrenceInput
} from "@/lib/occurrence-store";
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
  { label: "Aguardando Vistoria", value: "AGUARDANDO_VISTORIA" },
  { label: "Em Analise", value: "EM_ANALISE" },
  { label: "Aguardando Pecas", value: "AGUARDANDO_PECA" },
  { label: "Finalizada", value: "FINALIZADA" }
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
    title: "Ocorrencia critica parada",
    description: "BRP4K21 esta ha mais de 3h sem mudanca de status.",
    read: false
  },
  {
    id: "n-2",
    title: "IA concluiu triagem",
    description: "Analise visual sugeriu severidade alta para FLO2W88.",
    read: false
  },
  {
    id: "n-3",
    title: "Documento pendente",
    description: "Checklist operacional precisa ser anexado ao caso PF-2026-000147.",
    read: false
  }
];

const drawerItems = [
  { label: "Inicio", icon: HomeIcon, action: "home" },
  { label: "Ocorrencias", icon: ClipboardList, action: "occurrences" },
  { label: "Nova Ocorrencia", icon: Plus, action: "new" },
  { label: "Vistorias", icon: ClipboardCheck, action: "inspection" },
  { label: "Patios", icon: Warehouse, action: "yards" },
  { label: "Relatorios/BI", icon: BarChart3, action: "reports" },
  { label: "Configuracoes", icon: Settings, action: "settings" },
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
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [vehicleSearchOpen, setVehicleSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    setOccurrences(loadOccurrences());
    setReady(true);
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

  const stats = useMemo(() => {
    const finalizedToday = occurrences.filter((item) => item.status === "FINALIZADA" && isToday(item.updatedAt)).length;
    const yardCount = occurrences.filter((item) => item.status === "ENCAMINHADA_PATIO" || item.location.toLowerCase().includes("patio")).length;

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
        label: "Aguardando Vistoria",
        value: String(occurrences.filter((item) => item.status === "AGUARDANDO_VISTORIA").length),
        delta: "fila de campo",
        icon: Clock3,
        tone: "bg-amber-500",
        active: status === "AGUARDANDO_VISTORIA",
        onClick: () => setStatus("AGUARDANDO_VISTORIA")
      },
      {
        label: "Finalizadas Hoje",
        value: String(finalizedToday),
        delta: "ver concluidas",
        icon: Check,
        tone: "bg-green-500",
        active: status === "FINALIZADA",
        onClick: () => setStatus("FINALIZADA")
      },
      {
        label: "Veiculos no Patio",
        value: String(yardCount),
        delta: "abrir patios",
        icon: Car,
        tone: "bg-violet-600",
        active: false,
        onClick: () => router.push("/patios")
      }
    ];
  }, [occurrences, router, status]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  function persist(next: OccurrenceDetail[]) {
    setOccurrences(next);
    saveOccurrences(next);
  }

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2800);
  }

  function handleCreateOccurrence(input: NewOccurrenceInput) {
    const created = createOccurrence(input, occurrences);
    persist([created, ...occurrences]);
    setStatus("TODOS");
    setPriority("TODAS");
    setSearch("");
    showToast({ type: "success", message: "Ocorrencia criada e adicionada a fila operacional." });
  }

  function handleCreateInspection(input: InspectionInput) {
    persist(applyInspection(occurrences, input));
    showToast({ type: "success", message: "Vistoria iniciada. Status movido para EM_ANALISE." });
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
    if (action === "new") {
      setModalOpen(true);
      return;
    }
    if (action === "inspection") {
      setInspectionOpen(true);
      return;
    }
    if (action === "yards") {
      router.push("/patios");
      return;
    }
    if (action === "reports") {
      router.push("/relatorios");
      return;
    }
    if (action === "settings") {
      showToast({ type: "info", message: "Preferencias prontas para conectar ao perfil do usuario." });
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

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-28 pt-5 sm:px-6 lg:pb-8 lg:pt-8">
        <DesktopSidebar onAction={runDrawerAction} />

        <section className="min-w-0 flex-1">
          <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_36%),linear-gradient(180deg,#050914_0%,#070b15_100%)] shadow-2xl lg:max-w-none lg:rounded-3xl">
            <header className="flex items-center justify-between gap-4 px-5 pt-6 lg:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-200 transition hover:bg-white/[0.06] active:scale-95 lg:hidden"
                >
                  <Menu className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={() => runDrawerAction("home")}
                  className="flex min-w-0 items-center gap-3 rounded-xl text-left transition hover:opacity-90"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/40 bg-blue-600/15">
                    <Shield className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-bold tracking-tight">ParkFlow</h1>
                    <p className="truncate text-sm text-slate-400">Gestao Inteligente de Sinistros</p>
                  </div>
                </button>
              </div>

              <div className="relative flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-200 transition hover:bg-white/[0.06] active:scale-95"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount ? (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="relative h-11 w-11 overflow-hidden rounded-full border border-white/10 bg-slate-800 transition hover:border-electric/45 active:scale-95"
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

            <div className="px-5 pb-6 pt-5 lg:px-7">
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101b55] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col gap-4 bg-gradient-to-r from-blue-700/70 to-[#111948] p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Bom dia, Joao.</h2>
                    <p className="mt-1 text-sm text-blue-100/80">Resumo operacional focado no que precisa de acao agora.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast({ type: "info", message: "Dados atualizados para hoje em modo demo." })}
                    className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-blue-50 transition hover:bg-white/15"
                  >
                    <Clock3 className="h-4 w-4" />
                    Hoje, 12 Mai
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-black/25 p-3 lg:grid-cols-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.button
                        key={stat.label}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={stat.onClick}
                        className={clsx(
                          "rounded-2xl border bg-[#0c111d]/90 p-4 text-left shadow-inner transition hover:-translate-y-0.5 hover:border-blue-400/40 active:scale-[0.98]",
                          stat.active ? "border-blue-400/60 ring-2 ring-blue-500/20" : "border-white/10"
                        )}
                      >
                        <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-full ${stat.tone}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="min-h-10 text-sm text-slate-300">{stat.label}</p>
                        <strong className="mt-2 block text-3xl font-bold tracking-tight">{stat.value}</strong>
                        <span className="mt-1 block text-sm font-semibold text-blue-300">{stat.delta}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section className="mt-4 rounded-2xl border border-white/10 bg-[#0b111d]/95 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Acoes rapidas</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("TODOS");
                      setPriority("TODAS");
                      setSearch("");
                    }}
                    className="text-sm font-semibold text-blue-400 transition hover:text-blue-200"
                  >
                    Limpar filtros
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <QuickAction label="Nova Ocorrencia" icon={Plus} tone="bg-violet-600" onClick={() => setModalOpen(true)} />
                  <QuickAction label="Nova Vistoria" icon={Camera} tone="bg-blue-600" onClick={() => setInspectionOpen(true)} />
                  <QuickAction label="Buscar Veiculo" icon={Search} tone="bg-green-500" onClick={() => setVehicleSearchOpen(true)} />
                  <QuickAction label="Relatorios" icon={FileText} tone="bg-amber-500" onClick={() => router.push("/relatorios")} />
                </div>
              </section>

              <section className="mt-4 rounded-2xl border border-white/10 bg-[#0b111d]/95 p-4">
                <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3">
                  <Search className="h-5 w-5 text-blue-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por placa, ID, tipo ou local"
                    className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />
                  {search ? (
                    <button type="button" onClick={() => setSearch("")} className="text-xs font-semibold text-slate-400 hover:text-white">
                      limpar
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 premium-scrollbar">
                  {statusFilters.map((item) => (
                    <FilterButton key={item.value} active={status === item.value} onClick={() => setStatus(item.value)}>
                      {item.label}
                    </FilterButton>
                  ))}
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 premium-scrollbar">
                  {priorityFilters.map((item) => (
                    <FilterButton key={item.value} active={priority === item.value} onClick={() => setPriority(item.value)}>
                      {item.label}
                    </FilterButton>
                  ))}
                </div>
              </section>

              <section className="mt-4 rounded-2xl border border-white/10 bg-[#0b111d]/95 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Ocorrencias em andamento</h2>
                    <p className="mt-1 text-xs text-slate-500">{filteredOccurrences.length} resultado(s) na fila atual.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/ocorrencias")}
                    className="text-sm font-semibold text-blue-400 transition hover:text-blue-200"
                  >
                    Ver todas
                  </button>
                </div>

                <div className="space-y-2">
                  {!ready ? (
                    Array.from({ length: 4 }).map((_, index) => <SkeletonRow key={index} />)
                  ) : filteredOccurrences.length ? (
                    filteredOccurrences.slice(0, 5).map((item, index) => (
                      <OccurrenceRow
                        key={item.id}
                        occurrence={item}
                        image={item.photos[0]?.url ?? vehicleImages[index % vehicleImages.length]}
                        onClick={() => router.push(`/ocorrencias/${item.id}`)}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
                      <Search className="mx-auto h-8 w-8 text-blue-400" />
                      <h3 className="mt-3 font-semibold text-white">Nada nessa fila</h3>
                      <p className="mt-1 text-sm text-slate-400">Ajuste filtros ou abra uma nova ocorrencia para simular o fluxo.</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="mt-4 rounded-2xl border border-white/10 bg-[#0b111d]/95 p-4 xl:hidden">
                <TimelineList events={recentTimeline} onOpen={(id) => router.push(`/ocorrencias/${id}`)} />
              </section>
            </div>
          </div>
        </section>

        <aside className="hidden w-[340px] shrink-0 space-y-4 xl:block">
          <div className="rounded-2xl border border-white/10 bg-[#0b111d]/95 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10">
                <Sparkles className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">ParkFlow AI</p>
                <h2 className="font-semibold text-white">Radar inteligente</h2>
              </div>
            </div>
            <p className="mt-4 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm leading-6 text-blue-100">
              {occurrences[0]?.latestAIAnalysis?.summary ?? "Anexe uma foto em uma ocorrencia para simular leitura visual, severidade e proximo passo."}
            </p>
            <button
              type="button"
              onClick={() => setVehicleSearchOpen(true)}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Search className="h-4 w-4" />
              Buscar caso rapido
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b111d]/95 p-5">
            <TimelineList events={recentTimeline} onOpen={(id) => router.push(`/ocorrencias/${id}`)} />
          </div>
        </aside>
      </div>

      <MobileNav onNewOccurrence={() => setModalOpen(true)} onMore={() => setMoreOpen(true)} />
    </main>
  );
}

function DesktopSidebar({ onAction }: { onAction: (action: string) => void }) {
  return (
    <aside className="sticky top-8 hidden h-[calc(100vh-4rem)] w-72 shrink-0 rounded-3xl border border-white/10 bg-[#07101f]/90 p-4 shadow-2xl backdrop-blur-2xl lg:block">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/35 bg-blue-600/20 shadow-glow">
          <Shield className="h-6 w-6 text-blue-300" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Brasil Park Ops</p>
          <h2 className="text-xl font-semibold text-white">ParkFlow</h2>
        </div>
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
        <p className="mt-2 text-xs leading-5 text-slate-400">Upload, timeline e triagem funcionam localmente para apresentacao.</p>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/35 bg-blue-600/20">
                  <Shield className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">ParkFlow</h2>
                  <p className="text-xs text-slate-500">Central operacional</p>
                </div>
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
        <p className="mt-1 truncate text-sm text-slate-400">{prettyType(occurrence.type)} - {occurrence.location}</p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <span className={clsx("rounded-lg border px-2 py-1 text-xs font-semibold", statusTone(occurrence.status))}>
          {statusLabel(occurrence.status)}
        </span>
        <p className="mt-2 text-xs text-slate-400">{occurrence.stoppedMinutes} min parado</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:text-blue-300" />
    </motion.button>
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
    AGUARDANDO_VISTORIA: "border-amber-400/25 bg-amber-500/15 text-amber-300",
    EM_ANALISE: "border-violet-400/25 bg-violet-500/15 text-violet-300",
    AGUARDANDO_DOCUMENTO: "border-amber-400/25 bg-amber-500/15 text-amber-300",
    AGUARDANDO_PECA: "border-green-400/25 bg-green-500/15 text-green-300",
    ENCAMINHADA_PATIO: "border-cyan-400/25 bg-cyan-500/15 text-cyan-300",
    ENCAMINHADA_OFICINA: "border-cyan-400/25 bg-cyan-500/15 text-cyan-300",
    FINALIZADA: "border-green-400/25 bg-green-500/15 text-green-300",
    CANCELADA: "border-slate-400/25 bg-slate-500/15 text-slate-300"
  };
  return tones[status];
}

function prettyType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replaceAll("_", " ");
}

function formatShortTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}
