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
      "flex h-16 flex-col items-center justify-center gap-1 rounded-xl transition active:scale-95",
      pathname === href || (href !== "/" && pathname.startsWith(href))
        ? "bg-white/[0.06] text-electric"
        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
    );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070c17]/95 px-3 pb-5 pt-2 backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-center text-slate-400">
        <Link href="/" className={linkClass("/")}>
          <Home className="h-5 w-5" />
          <span className="text-[11px]">Dashboard</span>
        </Link>
        <Link href="/ocorrencias" className={linkClass("/ocorrencias")}>
          <ClipboardList className="h-5 w-5" />
          <span className="text-[11px]">Ocorrências</span>
        </Link>
        <button
          type="button"
          onClick={onNewOccurrence ?? (() => router.push("/?register=1"))}
          className="-mt-9 flex h-16 w-16 flex-col items-center justify-center justify-self-center rounded-full border border-electric/40 bg-brand text-white shadow-[0_14px_44px_rgba(31,111,235,0.45)] transition active:scale-95"
        >
          <ScanLine className="h-7 w-7" />
          <span className="mt-1 text-[10px] font-semibold">IA</span>
        </button>
        <Link href="/veiculos" className={linkClass("/veiculos")}>
          <Search className="h-5 w-5" />
          <span className="text-[11px]">Consulta</span>
        </Link>
        <Link href="/unidades" className={linkClass("/unidades")}>
          <Building2 className="h-5 w-5" />
          <span className="text-[11px]">Unidades</span>
        </Link>
      </div>
    </nav>
  );
}
