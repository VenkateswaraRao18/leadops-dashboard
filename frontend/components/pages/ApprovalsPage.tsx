"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { MOCK_APPROVALS } from "@/lib/mock";
import type { Approval } from "@/lib/types";
import { Shield, CheckCheck, X, Info } from "lucide-react";

export default function ApprovalsPage() {
  const [queue, setQueue] = useState<Approval[]>(MOCK_APPROVALS);
  const [done, setDone] = useState<{ id: string; verdict: "approved" | "rejected" }[]>([]);

  const resolve = (id: string, verdict: "approved" | "rejected") => {
    setQueue((q) => q.filter((a) => a.id !== id));
    setDone((d) => [...d, { id, verdict }]);
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Approval Queue" subtitle="External write actions awaiting review" />

      <div className="flex-1 p-6 max-w-[860px] space-y-5">

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-violet-500/[0.06] border border-violet-500/15 rounded-2xl px-5 py-4">
          <Info size={14} className="text-violet-400/70 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-white/45 leading-relaxed">
            Every irreversible write — CRM records, outbound emails, calendar bookings, and payment charges — is intercepted before execution.
            Actions are validated against their schema and queued here for a human decision. Nothing reaches an external system without explicit approval.
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending",  value: queue.length,                          color: "text-amber-400" },
            { label: "Approved", value: done.filter(d => d.verdict === "approved").length, color: "text-emerald-400" },
            { label: "Rejected", value: done.filter(d => d.verdict === "rejected").length, color: "text-white/40" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0d0e14] border border-white/[0.05] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-[11px] text-white/30">{s.label}</span>
              <span className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Pending */}
        {queue.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Pending — {queue.length}</p>
            {queue.map((a) => (
              <div key={a.id} className="bg-[#0d0e14] border border-amber-500/15 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      {a.action}
                    </span>
                    <span className="text-[11px] text-white/25">requested by <span className="text-white/40">{a.agent}</span> agent</span>
                  </div>
                  <span className="text-[10px] text-white/20 font-mono">{a.id}</span>
                </div>

                {/* Payload */}
                <div className="px-5 py-4">
                  <p className="text-[10px] text-white/20 uppercase tracking-widest mb-3">Payload</p>
                  <div className="bg-black/30 border border-white/[0.04] rounded-xl p-4 space-y-1.5">
                    {Object.entries(a.payload).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-3 text-[12px]">
                        <span className="w-16 text-white/25 font-mono shrink-0">{k}</span>
                        <span className="text-white/60">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-4 flex gap-2.5">
                  <button
                    onClick={() => resolve(a.id, "approved")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/18 text-emerald-400 border border-emerald-500/20 rounded-xl text-[12px] font-semibold transition-all"
                  >
                    <CheckCheck size={13} /> Approve
                  </button>
                  <button
                    onClick={() => resolve(a.id, "rejected")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.07] text-white/40 border border-white/[0.07] rounded-xl text-[12px] font-medium transition-all"
                  >
                    <X size={13} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resolved */}
        {done.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Resolved</p>
            {done.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 px-5 py-3.5 bg-[#0d0e14] border border-white/[0.04] rounded-xl"
              >
                {r.verdict === "approved" ? (
                  <CheckCheck size={13} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <X size={13} className="text-white/25 flex-shrink-0" />
                )}
                <span className="text-[11px] font-mono text-white/35">{r.id}</span>
                <span className={`ml-auto text-[11px] font-medium ${r.verdict === "approved" ? "text-emerald-400" : "text-white/25"}`}>
                  {r.verdict}
                </span>
              </div>
            ))}
          </div>
        )}

        {queue.length === 0 && done.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Shield size={28} className="text-white/10" />
            <p className="text-white/25 text-sm">No pending approvals</p>
          </div>
        )}
      </div>
    </div>
  );
}
