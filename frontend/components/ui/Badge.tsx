import type { Route } from "@/lib/types";

const routeConfig: Record<Route, { style: string; dot: string; label: string }> = {
  hot:     { style: "text-rose-400 bg-rose-500/10 border-rose-500/20",   dot: "bg-rose-400",   label: "Hot" },
  warm:    { style: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400",  label: "Warm" },
  cold:    { style: "text-sky-400 bg-sky-500/10 border-sky-500/20",       dot: "bg-sky-400",    label: "Cold" },
  pending: { style: "text-white/30 bg-white/[0.04] border-white/[0.08]",  dot: "bg-white/30",   label: "Pending" },
};

export function RouteBadge({ route }: { route: Route }) {
  const c = routeConfig[route];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${c.style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-white/40";
  return <span className={`text-[13px] font-semibold tabular-nums ${color}`}>{pct}%</span>;
}

export function StatusPill({ status }: { status: string }) {
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className="text-[11px] text-white/35 bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}
