"use client";

import { LayoutDashboard, Users, ShieldCheck, PlusCircle, Settings, HelpCircle } from "lucide-react";
import type { PageId } from "@/app/page";
import { MOCK_APPROVALS } from "@/lib/mock";

const primary = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Users },
  { id: "approvals", label: "Approvals", icon: ShieldCheck },
  { id: "submit", label: "New Lead", icon: PlusCircle },
] as const;

export default function Sidebar({
  current,
  onNavigate,
}: {
  current: PageId;
  onNavigate: (p: PageId) => void;
}) {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#0c0d11] border-r border-white/[0.04]">
      {/* Wordmark */}
      <div className="px-5 h-14 flex items-center border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="2.5" fill="white" />
              <circle cx="2" cy="3" r="1.2" fill="white" fillOpacity="0.6" />
              <circle cx="10" cy="3" r="1.2" fill="white" fillOpacity="0.6" />
              <circle cx="2" cy="9" r="1.2" fill="white" fillOpacity="0.4" />
              <circle cx="10" cy="9" r="1.2" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-white tracking-tight">LeadOps</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 p-3 pt-4">
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-2 mb-2">Workspace</p>
        <nav className="space-y-0.5">
          {primary.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] transition-all group ${
                current === id
                  ? "bg-white/[0.07] text-white font-medium"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={14} strokeWidth={current === id ? 2 : 1.5} />
                {label}
              </div>
              {id === "approvals" && MOCK_APPROVALS.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {MOCK_APPROVALS.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-white/[0.04] space-y-0.5">
        {[
          { icon: Settings, label: "Settings" },
          { icon: HelpCircle, label: "Help & Docs" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-white/25 hover:text-white/50 hover:bg-white/[0.03] transition-all"
          >
            <Icon size={14} strokeWidth={1.5} />
            {label}
          </button>
        ))}

        {/* User */}
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 mt-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-bold text-white">VJ</span>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-white/70 truncate">Venky J</div>
            <div className="text-[10px] text-white/25 truncate">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
