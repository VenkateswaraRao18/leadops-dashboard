"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { MOCK_LEADS } from "@/lib/mock";
import { RouteBadge, ScoreBadge } from "@/components/ui/Badge";
import type { Route } from "@/lib/types";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";

const FILTERS: { label: string; value: Route | "all" }[] = [
  { label: "All leads", value: "all" },
  { label: "Hot",  value: "hot" },
  { label: "Warm", value: "warm" },
  { label: "Cold", value: "cold" },
];

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function LeadsPage() {
  const [filter, setFilter] = useState<Route | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_LEADS.filter((l) => {
    const matchRoute = filter === "all" || l.route === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    return matchRoute && matchSearch;
  });

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Leads" subtitle={`${MOCK_LEADS.length} total · Updated just now`} />

      <div className="flex-1 p-6 space-y-4 max-w-[1200px]">

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, company or email…"
              className="w-60 bg-white/[0.04] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-[12px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/14 focus:bg-white/[0.06] transition-all"
            />
          </div>

          <div className="flex items-center bg-white/[0.03] border border-white/[0.05] rounded-xl p-1 gap-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  filter === f.value
                    ? "bg-white/[0.08] text-white/90"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {(filter !== "all" || search) && (
            <button
              onClick={() => { setFilter("all"); setSearch(""); }}
              className="flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors"
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}

          <div className="ml-auto">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl text-[12px] text-white/40 transition-colors">
              <SlidersHorizontal size={12} /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0d0e14] border border-white/[0.05] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {["Lead", "Intent", "Score", "Route", "Status", ""].map((h, i) => (
                  <th
                    key={i}
                    className="px-5 py-3 text-left text-[10px] font-semibold text-white/25 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group"
                >
                  {/* Lead */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/8 to-white/3 border border-white/[0.07] flex items-center justify-center text-[10px] font-semibold text-white/50 flex-shrink-0">
                        {lead.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-medium text-white/85">{lead.name}</span>
                          {lead.is_returning_customer && (
                            <span className="text-[9px] text-violet-400/60 bg-violet-500/[0.07] border border-violet-500/10 px-1.5 py-0.5 rounded-full">returning</span>
                          )}
                        </div>
                        <div className="text-[11px] text-white/30">{lead.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Intent */}
                  <td className="px-5 py-3.5 max-w-[240px]">
                    <span className="text-[11px] text-white/40 leading-relaxed line-clamp-2">{lead.intent}</span>
                  </td>

                  {/* Score */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={lead.score} />
                      <div className="w-16 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${lead.score >= 0.8 ? "bg-emerald-500" : lead.score >= 0.5 ? "bg-amber-500" : "bg-white/20"}`}
                          style={{ width: `${Math.round(lead.score * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="px-5 py-3.5">
                    <RouteBadge route={lead.route} />
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] text-white/35">{statusLabel(lead.status)}</span>
                  </td>

                  {/* Time */}
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-[11px] text-white/20">{timeAgo(lead.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/20 text-sm">No leads match this filter.</div>
          )}
        </div>

        <p className="text-[11px] text-white/20">Showing {filtered.length} of {MOCK_LEADS.length} leads</p>
      </div>
    </div>
  );
}
