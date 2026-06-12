"use client";

import { Search, Bell } from "lucide-react";
import { MOCK_APPROVALS } from "@/lib/mock";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-14 border-b border-white/[0.04] px-8 flex items-center justify-between flex-shrink-0 sticky top-0 bg-[#0a0b0f]/80 backdrop-blur-sm z-10">
      <div>
        <h1 className="text-[15px] font-semibold text-white/90">{title}</h1>
        {subtitle && <p className="text-[11px] text-white/30 leading-none mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            placeholder="Search…"
            className="w-44 bg-white/[0.04] border border-white/[0.06] rounded-lg pl-7 pr-3 py-1.5 text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/15 focus:bg-white/[0.06] transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] flex items-center justify-center transition-colors">
          <Bell size={13} className="text-white/40" />
          {MOCK_APPROVALS.length > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">VJ</span>
        </div>
      </div>
    </header>
  );
}
