"use client";

import { CheckCircle2, Loader2, Database, Brain, GitBranch, Mail, UserCheck, HardDrive } from "lucide-react";

const steps = [
  { id: "memory_load", label: "Memory Lookup",   icon: Database,    desc: "Returning customer check" },
  { id: "intake",      label: "Intake Agent",    icon: Brain,       desc: "Parse · enrich · score" },
  { id: "routing",     label: "Routing Agent",   icon: GitBranch,   desc: "Hot / Warm / Cold decision" },
  { id: "onboarding",  label: "Onboarding",      icon: UserCheck,   desc: "CRM · welcome email" },
  { id: "content",     label: "Content Agent",   icon: Mail,        desc: "Nurture or decline email" },
  { id: "memory_save", label: "Memory Write",    icon: HardDrive,   desc: "Persist interaction" },
];

type StepStatus = "idle" | "running" | "done";

export default function Pipeline({
  activeStep,
  completedSteps = [],
}: {
  activeStep?: string | null;
  completedSteps?: string[];
}) {
  const getStatus = (id: string): StepStatus => {
    if (completedSteps.includes(id)) return "done";
    if (activeStep === id) return "running";
    return "idle";
  };

  return (
    <div className="bg-[#0d0e14] border border-white/[0.05] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[13px] font-semibold text-white/80">Agent Pipeline</span>
        {activeStep && (
          <span className="flex items-center gap-1.5 text-[10px] text-violet-400">
            <Loader2 size={10} className="animate-spin" /> processing
          </span>
        )}
        {!activeStep && completedSteps.length > 0 && (
          <span className="text-[10px] text-emerald-400">complete</span>
        )}
      </div>

      <div className="relative pl-3">
        {/* Vertical connector */}
        <div className="absolute left-[18px] top-4 bottom-4 w-px bg-white/[0.05]" />

        <div className="space-y-1">
          {steps.map((step) => {
            const status = getStatus(step.id);
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`relative flex items-center gap-3 py-2 transition-opacity duration-300 ${
                  status === "idle" ? "opacity-30" : "opacity-100"
                }`}
              >
                {/* Node */}
                <div
                  className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                    status === "done"
                      ? "bg-emerald-500/10 border-emerald-500/25"
                      : status === "running"
                      ? "bg-violet-500/15 border-violet-500/40 shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                      : "bg-white/[0.03] border-white/[0.06]"
                  }`}
                >
                  {status === "running" ? (
                    <Loader2 size={13} className="text-violet-400 animate-spin" />
                  ) : status === "done" ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : (
                    <Icon size={12} className="text-white/30" />
                  )}
                </div>

                {/* Label */}
                <div>
                  <div className={`text-[12px] font-medium leading-none ${
                    status === "running" ? "text-violet-300" : status === "done" ? "text-white/80" : "text-white/40"
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-[10px] text-white/25 mt-0.5 leading-none">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
