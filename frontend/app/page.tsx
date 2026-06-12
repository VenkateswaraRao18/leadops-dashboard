"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardPage from "@/components/pages/DashboardPage";
import LeadsPage from "@/components/pages/LeadsPage";
import ApprovalsPage from "@/components/pages/ApprovalsPage";
import SubmitPage from "@/components/pages/SubmitPage";

export type PageId = "dashboard" | "leads" | "approvals" | "submit";

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="flex-1 overflow-y-auto bg-[#0a0b0f]">
        {page === "dashboard" && <DashboardPage />}
        {page === "leads" && <LeadsPage />}
        {page === "approvals" && <ApprovalsPage />}
        {page === "submit" && <SubmitPage />}
      </main>
    </div>
  );
}
