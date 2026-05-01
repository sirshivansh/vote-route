import { Activity, ShieldCheck, Database, Zap } from "lucide-react";
import { getSystemStatus } from "@/services/firebase";
import { useEffect, useState } from "react";

export function StatusPanel() {
  const [status, setStatus] = useState(getSystemStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getSystemStatus());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mb-4" role="status" aria-label="System Status">
      <StatusBadge icon={<ShieldCheck className="w-3 h-3" />} label="Auth" active={status.auth} />
      <StatusBadge
        icon={<Database className="w-3 h-3" />}
        label="Firestore"
        active={status.firestore}
      />
      <StatusBadge
        icon={<Activity className="w-3 h-3" />}
        label="Storage"
        active={status.storage}
      />
      <StatusBadge icon={<Zap className="w-3 h-3" />} label="AI Cloud" active={status.aiCloud} />
      <div className="text-[10px] font-mono text-muted-foreground ml-auto bg-muted/50 px-2 py-1 rounded border border-border">
        v{status.version}
      </div>
    </div>
  );
}

function StatusBadge({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border transition-all ${
        active
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          : "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse"
      }`}
    >
      {icon}
      {label}
      <span className={`w-1 h-1 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`} />
    </div>
  );
}
