"use client";

import { Building2, ClipboardList, Home, Search, ScanLine } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

export function MobileNav({
  onNewOccurrence
}: {
  onNewOccurrence?: () => void;
  onMore?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const linkClass = (href: string) =>
    clsx(
      "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl transition active:scale-95 min-[360px]:h-16",
      pathname === href || (href !== "/" && pathname.startsWith(href))
        ? "bg-white/[0.06] text-electric"
        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
    );

  return (
    <nav className="mobile-nav fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070c17]/95 px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-center gap-1 text-slate-400">
        <Link href="/" replace className={linkClass("/")}>
          <Home className="h-5 w-5" />
          <span className="max-w-full truncate text-[10px] min-[360px]:text-[11px]">Dashboard</span>
        </Link>
        <Link href="/ocorrencias" replace className={linkClass("/ocorrencias")}>
          <ClipboardList className="h-5 w-5" />
          <span className="max-w-full truncate text-[10px] min-[360px]:text-[11px]">Ocorrências</span>
        </Link>
        <button
          type="button"
          onClick={onNewOccurrence ?? (() => router.replace("/?register=1"))}
          className="-mt-8 flex h-14 w-14 flex-col items-center justify-center justify-self-center rounded-full border border-electric/40 bg-brand text-white shadow-[0_14px_44px_rgba(31,111,235,0.45)] transition active:scale-95 min-[360px]:-mt-9 min-[360px]:h-16 min-[360px]:w-16"
        >
          <ScanLine className="h-6 w-6 min-[360px]:h-7 min-[360px]:w-7" />
          <span className="mt-1 text-[10px] font-semibold">IA</span>
        </button>
        <Link href="/veiculos" replace className={linkClass("/veiculos")}>
          <Search className="h-5 w-5" />
          <span className="max-w-full truncate text-[10px] min-[360px]:text-[11px]">Consulta</span>
        </Link>
        <Link href="/unidades" replace className={linkClass("/unidades")}>
          <Building2 className="h-5 w-5" />
          <span className="max-w-full truncate text-[10px] min-[360px]:text-[11px]">Unidades</span>
        </Link>
      </div>
    </nav>
  );
}
