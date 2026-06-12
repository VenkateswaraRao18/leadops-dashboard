"use client";

import Header from "@/components/Header";
import { MOCK_LEADS, MOCK_APPROVALS, MOCK_ACTIVITY } from "@/lib/mock";
import { RouteBadge, ScoreBadge } from "@/components/ui/Badge";
import { TrendingUp, ArrowUpRight, Clock, Shield, ChevronRight, Dot } from "lucide-react";

/* ─── Stat Card ─────────────────────────────────────────────── */
function Stat({
  label,
  value,
  delta,
  deltaLabel,
  sub,
}: {
  label: string;
  value: string;
  delta?: "up" | "neutral";
  deltaLabel?: string;
  sub?: string;
}) {
  return (
    <div className="bg-[#0d0e14] border border-white/[0.05] rounded-2xl px-5 py-5">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[11px] font-medium text-white/35 uppercase tracking-wider">{label}</span>
        {deltaLabel && (
          <span
            className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              delta === "up"
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-white/30 bg-white/[0.04]"
            }`}
          >
            {delta === "up" && <ArrowUpRight size={9} strokeWidth={2.5} />}
            {deltaLabel}
          </span>
        )}
      </div>
      <div className="text-[28px] font-bold text-white tracking-tight leading-none">{value}</div>
      {sub && <div className="text-[11px] text-white/30 mt-2">{sub}</div>}
    </div>
  );
}

/* ─── Funnel Bar ─────────────────────────────────────────────── */
function FunnelBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-[11px] text-white/35 text-right shrink-0">{label}</div>
      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-8 text-[11px] text-white/50 tabular-nums">{count}</div>
      <div className="w-8 text-[10px] text-white/25 tabular-nums">{pct}%</div>
    </div>
  );
}

/* ─── Activity dot ───────────────────────────────────────────── */
const activityDot: Record<string, string> = {
  hot: "bg-rose-400",
  warm: "bg-amber-400",
  cold: "bg-sky-400",
  approval: "bg-amber-400",
};

/* ─── Dashboard ─────────────────────────────────────────────── */
export default function DashboardPage() {
  const total = MOCK_LEADS.length;
  const hot = MOCK_LEADS.filter((l) => l.route === "hot").length;
  const warm = MOCK_LEADS.filter((l) => l.route === "warm").length;
  const cold = MOCK_LEADS.filter((l) => l.route === "cold").length;
  const returning = MOCK_LEADS.filter((l) => l.is_returning_customer).length;
  const avgScore = Math.round(MOCK_LEADS.reduce((s, l) => s + l.score, 0) / total * 100);
  const conversionRate = Math.round((hot / total) * 100);

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Overview" subtitle="Monday, June 12 · All time" />

      <div className="flex-1 p-6 space-y-5 max-w-[1200px]">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Stat label="Total Leads" value={String(total)} delta="up" deltaLabel="+12% this week" sub={`${returning} returning customers`} />
          <Stat label="Hot Leads" value={String(hot)} delta="up" deltaLabel={`${conversionRate}% conversion`} sub="Routed to onboarding" />
          <Stat label="Avg. Score" value={`${avgScore}%`} delta="up" deltaLabel="+4 pts" sub="Qualification accuracy" />
          <Stat label="Pending Review" value={String(MOCK_APPROVALS.length)} delta="neutral" deltaLabel="Needs action" sub="External writes gated" />
        </div>

        {/* ── Middle row: funnel + recent leads ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-4">

          {/* Funnel */}
          <div className="bg-[#0d0e14] border border-white/[0.05] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[13px] font-semibold text-white/80">Qualification Funnel</span>
              <TrendingUp size={13} className="text-white/20" />
            </div>
            <div className="space-y-3.5">
              <FunnelBar label="Received"  count={total} total={total} color="bg-white/20" />
              <FunnelBar label="Qualified" count={total - 1} total={total} color="bg-violet-500/70" />
              <FunnelBar label="Hot"       count={hot}  total={total} color="bg-rose-500/80" />
              <FunnelBar label="Warm"      count={warm} total={total} color="bg-amber-500/80" />
              <FunnelBar label="Cold"      count={cold} total={total} color="bg-sky-500/60" />
            </div>
            <div className="mt-5 pt-4 border-t border-white/[0.05] grid grid-cols-2 gap-3">
              <div>
                <div className="text-[22px] font-bold text-rose-400">{conversionRate}%</div>
                <div className="text-[10px] text-white/25 mt-0.5">Hot rate</div>
              </div>
              <div>
                <div className="text-[22px] font-bold text-emerald-400">1.2s</div>
                <div className="text-[10px] text-white/25 mt-0.5">Avg. process time</div>
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-[#0d0e14] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="px-5 h-11 flex items-center justify-between border-b border-white/[0.04]">
              <span className="text-[13px] font-semibold text-white/80">Recent Leads</span>
              <button className="text-[11px] text-white/30 hover:text-white/60 flex items-center gap-0.5 transition-colors">
                View all <ChevronRight size={11} />
              </button>
            </div>
            <div>
              {MOCK_LEADS.slice(0, 5).map((lead, i) => (
                <div
                  key={lead.id}
                  className="group px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.015] transition-colors border-b border-white/[0.03] last:border-0"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-white/60">
                    {lead.name.split(" ").map((n) => n[0]).join("")}
                  </div>

                  {/* Name + company */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-white/85 truncate">{lead.name}</span>
                      {lead.is_returning_customer && (
                        <span className="text-[9px] uppercase tracking-wider text-violet-400/70 bg-violet-500/[0.08] border border-violet-500/15 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          returning
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-white/30 truncate">{lead.company}</div>
                  </div>

                  {/* Score */}
                  <ScoreBadge score={lead.score} />

                  {/* Route */}
                  <RouteBadge route={lead.route} />

                  {/* Time */}
                  <div className="text-[11px] text-white/20 w-16 text-right flex-shrink-0 flex items-center gap-1 justify-end">
                    <Clock size={10} />
                    {i === 0 ? "2m" : i === 1 ? "37m" : i === 2 ? "2h" : i === 3 ? "3h" : "5h"} ago
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom row: activity + approvals ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Activity Feed */}
          <div className="bg-[#0d0e14] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="px-5 h-11 flex items-center border-b border-white/[0.04]">
              <span className="text-[13px] font-semibold text-white/80">Activity</span>
              <span className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            </div>
            <div className="p-4 space-y-1">
              {MOCK_ACTIVITY.map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-1 py-2.5 hover:bg-white/[0.02] rounded-lg transition-colors group">
                  <div className="mt-1.5 flex-shrink-0">
                    <span className={`block w-1.5 h-1.5 rounded-full ${activityDot[item.type]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] text-white/70">
                      <span className="font-medium text-white/90">{item.name}</span>
                      {" "}
                      <span className="text-white/40">({item.company})</span>
                      {" — "}
                      {item.action}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/20 flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Approvals */}
          <div className="bg-[#0d0e14] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="px-5 h-11 flex items-center justify-between border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Shield size={13} className="text-white/30" />
                <span className="text-[13px] font-semibold text-white/80">Approval Queue</span>
              </div>
              {MOCK_APPROVALS.length > 0 && (
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {MOCK_APPROVALS.length} pending
                </span>
              )}
            </div>
            <div className="p-4 space-y-3">
              {MOCK_APPROVALS.map((a) => (
                <div key={a.id} className="bg-black/20 border border-white/[0.05] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-amber-400/80">{a.action}</span>
                    <span className="text-[10px] text-white/25">{a.agent}</span>
                  </div>
                  <div className="text-[11px] text-white/40 mb-3 space-y-0.5">
                    {Object.entries(a.payload).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-white/20 w-14 shrink-0">{k}</span>
                        <span className="truncate">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 text-[11px] py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/18 text-emerald-400 border border-emerald-500/20 font-medium transition-colors">
                      Approve
                    </button>
                    <button className="flex-1 text-[11px] py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-white/35 border border-white/[0.06] transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
              {MOCK_APPROVALS.length === 0 && (
                <div className="text-center py-8 text-white/20 text-sm">All clear</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
