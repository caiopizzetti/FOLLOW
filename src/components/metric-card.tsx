import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "alert" | "positive";
}

const TONES = {
  default: { value: "text-[var(--color-ink)]", icon: "text-[var(--color-ink-faint)]" },
  alert: { value: "text-red-600", icon: "text-red-400" },
  positive: { value: "text-emerald-600", icon: "text-emerald-400" },
} as const;

export function MetricCard({ label, value, hint, icon: Icon, tone = "default" }: MetricCardProps) {
  const styles = TONES[tone];
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--color-ink-soft)]">{label}</p>
        {Icon && <Icon className={`h-4 w-4 shrink-0 ${styles.icon}`} />}
      </div>
      <p className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${styles.value}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-sm text-[var(--color-ink-faint)]">{hint}</p>}
    </div>
  );
}
