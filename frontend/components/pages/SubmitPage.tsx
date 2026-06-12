"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { submitLead } from "@/lib/api";
import Pipeline from "@/components/Pipeline";
import { RouteBadge, ScoreBadge } from "@/components/ui/Badge";
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

const PRESETS = [
  {
    label: "High intent",
    sub: "Ready to sign",
    route: "hot",
    data: {
      name: "Sarah Chen",
      email: "sarah@nexusai.io",
      company: "Nexus AI",
      message: "We need enterprise automation for our sales ops team of 50. Ready to sign this quarter.",
    },
  },
  {
    label: "Evaluating",
    sub: "Has budget",
    route: "warm",
    data: {
      name: "Marcus Webb",
      email: "marcus@growthlabs.com",
      company: "GrowthLabs",
      message: "Exploring AI tools for lead qualification. Have budget but still comparing vendors.",
    },
  },
  {
    label: "Browsing",
    sub: "Low intent",
    route: "cold",
    data: {
      name: "Bob Smith",
      email: "bob@generic.com",
      company: "Unknown Corp",
      message: "Just browsing, not sure if this is for us right now.",
    },
  },
];

const PIPELINE_STEPS = ["memory_load", "intake", "routing", "onboarding", "content", "memory_save"];

type ResultShape = { name?: string; route?: string; score?: number; status?: string; reasoning?: string };

export default function SubmitPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [result, setResult] = useState<ResultShape | null>(null);

  const applyPreset = (p: (typeof PRESETS)[0]) => {
    setForm(p.data);
    setResult(null);
    setCompletedSteps([]);
    setActiveStep(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setCompletedSteps([]);
    setActiveStep(null);

    for (const step of PIPELINE_STEPS) {
      setActiveStep(step);
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
      setCompletedSteps((prev) => [...prev, step]);
    }
    setActiveStep(null);

    try {
      const res = await submitLead(form);
      setResult(res);
    } catch {
      // Demo fallback when API is offline
      const mock: Record<string, ResultShape> = {
        "sarah@nexusai.io":       { name: form.name, route: "hot",  score: 0.92, status: "onboarding_complete", reasoning: "High intent signal, enterprise team size, timeline this quarter." },
        "marcus@growthlabs.com":  { name: form.name, route: "warm", score: 0.65, status: "content_warm_sent",   reasoning: "Budget confirmed but evaluating alternatives. Added to nurture." },
      };
      setResult(mock[form.email] || { name: form.name, route: "cold", score: 0.27, status: "content_cold_sent", reasoning: "Weak intent, no budget signal, early browsing stage." });
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, placeholder: string, textarea?: boolean) => (
    <div>
      <label className="block text-[11px] font-medium text-white/30 mb-1.5 uppercase tracking-wider">{label}</label>
      {textarea ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          rows={4}
          required
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-[13px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/15 focus:bg-white/[0.05] transition-all resize-none"
        />
      ) : (
        <input
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          required
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/15 focus:bg-white/[0.05] transition-all"
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-full">
      <Header title="New Lead" subtitle="Submit a lead for autonomous processing" />

      <div className="flex-1 p-6 max-w-[1100px]">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_264px] gap-5">

          {/* Left: form */}
          <div className="space-y-4">
            {/* Presets */}
            <div className="bg-[#0d0e14] border border-white/[0.05] rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles size={12} className="text-white/25" />
                <p className="text-[11px] text-white/30">Quick-fill with sample leads</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className="text-left px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.1] transition-all group"
                  >
                    <div className="text-[12px] font-medium text-white/70 group-hover:text-white/90">{p.label}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">{p.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-[#0d0e14] border border-white/[0.05] rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {field("name",    "Full name",    "Sarah Chen")}
                {field("email",   "Email",        "sarah@company.com")}
              </div>
              {field("company", "Company",      "Nexus AI")}
              {field("message", "Message",      "Tell us what you're looking for…", true)}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/[0.08] hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed text-white/90 text-[13px] font-semibold rounded-xl border border-white/[0.1] transition-all"
              >
                {loading ? (
                  <span className="text-white/50">Processing through pipeline…</span>
                ) : (
                  <>
                    Process lead
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Result */}
            {result && !loading && (
              <div className="bg-[#0d0e14] border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-[13px] font-semibold text-white/85">Pipeline complete</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Route",  content: result.route ? <RouteBadge route={result.route as "hot"|"warm"|"cold"} /> : "—" },
                    { label: "Score",  content: result.score != null ? <ScoreBadge score={result.score} /> : "—" },
                    { label: "Status", content: <span className="text-[12px] text-white/50">{result.status?.replace(/_/g, " ")}</span> },
                  ].map((item) => (
                    <div key={item.label} className="bg-black/25 border border-white/[0.04] rounded-xl p-3 text-center">
                      <div className="text-[9px] text-white/20 uppercase tracking-widest mb-2">{item.label}</div>
                      <div className="flex items-center justify-center">{item.content}</div>
                    </div>
                  ))}
                </div>

                {result.reasoning && (
                  <div className="text-[12px] text-white/45 bg-black/20 border border-white/[0.04] rounded-xl p-3.5 leading-relaxed">
                    <span className="text-white/20">Reasoning — </span>
                    {result.reasoning}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: pipeline */}
          <Pipeline activeStep={activeStep} completedSteps={completedSteps} />
        </div>
      </div>
    </div>
  );
}
