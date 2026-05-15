import clsx from "clsx";
import type { Priority } from "@/types/parkflow";

const styles: Record<Priority, string> = {
  BAIXA: "border-success/30 bg-success/10 text-success",
  MEDIA: "border-warning/30 bg-warning/10 text-warning",
  ALTA: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  CRITICA: "border-danger/35 bg-danger/10 text-danger"
};

const labels: Record<Priority, string> = {
  BAIXA: "BAIXA",
  MEDIA: "MÉDIA",
  ALTA: "ALTA",
  CRITICA: "CRÍTICA"
};

export function PriorityChip({ priority }: { priority: Priority }) {
  return (
    <span className={clsx("inline-flex h-7 items-center rounded-md border px-2 text-xs font-semibold", styles[priority])}>
      {labels[priority]}
    </span>
  );
}
