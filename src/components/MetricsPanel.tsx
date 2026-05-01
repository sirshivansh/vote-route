import { useEffect, useState } from "react";
import { Timer, BarChart3, Cpu } from "lucide-react";

export function MetricsPanel() {
  const [latency, setLatency] = useState<number | null>(null);

  // Listen for performance logs from our AI engine (simulated via custom event or similar for this demo)
  useEffect(() => {
    const handlePerf = (e: CustomEvent<{ duration: number }>) => {
      if (e.detail?.duration) setLatency(e.detail.duration);
    };
    window.addEventListener("ai-perf", handlePerf as EventListener);
    return () => window.removeEventListener("ai-perf", handlePerf as EventListener);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <BarChart3 className="w-3 h-3" /> System Metrics
      </h3>
      <div className="mt-4 space-y-3">
        <MetricItem
          icon={<Timer className="w-3 h-3" />}
          label="AI Latency"
          value={latency ? `${latency.toFixed(1)}ms` : "--"}
        />
        <MetricItem icon={<Cpu className="w-3 h-3" />} label="Computation" value="Lightweight" />
        <div className="pt-2 border-t border-border mt-2">
          <div className="text-[10px] text-muted-foreground leading-relaxed">
            System optimizes for mobile efficiency by avoiding heavy client-side ML models.
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-xs font-mono font-medium">{value}</div>
    </div>
  );
}
