"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";

export type ToastState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

const config = {
  success: { icon: CheckCircle2, tone: "border-success/35 bg-success/10 text-success" },
  error: { icon: XCircle, tone: "border-danger/35 bg-danger/10 text-danger" },
  info: { icon: Info, tone: "border-electric/35 bg-electric/10 text-electric" }
};

export function Toast({ toast }: { toast: ToastState }) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className="fixed right-4 top-4 z-[80] max-w-sm rounded-xl border border-line bg-ink/92 p-3 shadow-glow backdrop-blur-2xl"
        >
          <div className={`flex items-start gap-3 rounded-lg border p-3 ${config[toast.type].tone}`}>
            {(() => {
              const Icon = config[toast.type].icon;
              return <Icon className="mt-0.5 h-5 w-5 shrink-0" />;
            })()}
            <p className="text-sm font-medium leading-5">{toast.message}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

