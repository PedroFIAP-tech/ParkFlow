"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 }
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055
    }
  }
};

export function PremiumCard({
  children,
  className,
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1], delay }}
      className={clsx(
        "glass-panel rounded-xl transition duration-200 hover:border-electric/35 hover:shadow-glow",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function PremiumButton({
  children,
  className,
  variant = "secondary",
  ...props
}: HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variants = {
    primary: "border-electric/40 bg-brand text-white shadow-glow hover:bg-blue-600",
    secondary: "border-line bg-slate-950/50 text-slate-100 hover:border-electric/45 hover:bg-slate-900/80",
    ghost: "border-transparent bg-transparent text-slate-400 hover:bg-white/5 hover:text-white",
    danger: "border-danger/35 bg-danger/10 text-danger hover:bg-danger/15"
  };

  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold outline-none transition focus:border-electric/60 focus:ring-2 focus:ring-electric/25",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-lg bg-white/[0.07]", className)} />;
}
