"use client";

import { useMemo, useState } from "react";

/* ---------- Types & constants ---------- */
type Currency = "EUR" | "USD" | "GBP" | "AUD";
const CURRENCY_SYMBOL: Record<Currency, string> = { EUR: "€", USD: "$", GBP: "£", AUD: "A$" };

type Dept =
  | "Company-wide"
  | "Marketing"
  | "Sales"
  | "Customer Support"
  | "Operations"
  | "Engineering"
  | "HR";

type PriorityKey =
  | "throughput"
  | "quality"
  | "onboarding"
  | "retention"
  | "upskilling"
  | "costAvoidance";

type WizardStep =
  | "team"
  | "adoption"
  | "priorities"
  | PriorityKey
  | "results"
  | "summary";

const PRIORITY_META: Record<PriorityKey, { label: string; blurb: string; defaultOn?: boolean }> = {
  throughput: { label: "Throughput", blurb: "Reduce cycle time and handoffs to ship faster.", defaultOn: true },
  quality: { label: "Quality", blurb: "Reduce rework via better first-pass yield and QA.", defaultOn: true },
  onboarding: { label: "Onboarding", blurb: "Accelerate ramp time with guided workflows and AI assist.", defaultOn: true },
  retention: { label: "Retention", blurb: "Reduce regretted attrition via better tooling and enablement." },
  upskilling: { label: "Upskilling", blurb: "Grow competency coverage; unlock compounding gains." },
  costAvoidance: { label: "Cost avoidance", blurb: "Avoid outside spend/overtime via automation/self-service." },
};

const AZURE = "#00D7FF";

/* ---------- Small UI helper ---------- */
function Pill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="rounded-[16px] px-5 py-4 text-center"
      style={{
        background: "rgba(0,0,0,0.85)",
        borderBottom: `3px solid ${AZURE}`,
        boxShadow: `0 3px 8px -2px ${AZURE}`,
      }}
    >
      <div className="text-sm opacity-80">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

/* Adoption scale → weekly hours per employee */
const maturityToHours = (lvl: number) => {
  const map = [5, 4.5, 4, 3.5, 3, 2.6, 2.2, 1.8, 1.4, 1];
  return map[Math.min(10, Math.max(1, lvl)) - 1];
};

const maturityExplainer = [
  "Early: ad-hoc experiments; big wins from prompt basics + workflow mapping.",
  "Exploring: a few enthusiasts; scattered wins, limited reuse.",
  "Emerging: managers aware; some templates in docs; no QA.",
  "Forming: pilots in 1–2 teams; light process; inconsistent results.",
  "Defined: prompt patterns exist; simple guardrails; visible wins.",
  "Adopted: managers model usage; shared library; track time saved.",
  "Integrated: AI in key SOPs; QA + rubrics; weekly sharing cadence.",
  "Scaled: champions cohort; coverage 40–60%; measurable cycle gains.",
  "Optimized: 60–80% coverage; golden paths; usage tied to KPIs.",
  "Embedded: >80% coverage; evals/guardrails; continuous improvement.",
];

/* ---------- Component ---------- */
export default function Page() {
  /* Step & navigation */
  const [stepKey, setStepKey] = useState<WizardStep>("team");
  const go = (key: WizardStep) => setStepKey(key);
  const back = () => {
    const idx = ALL_STEPS.findIndex((s) => s.key === stepKey);
    if (idx > 0) setStepKey(ALL_STEPS[idx - 1].key);
  };
  const reset = () => window.location.reload();

  /* Step 1: team basics */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);

  const seatUSD = headcount >= 1000 ? 299 : headcount >= 100 ? 349 : 399; // tiering
  const symbol = CURRENCY_SYMBOL[currency];

  /* Derived costs */
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const programCost = useMemo(() => headcount * seatUSD, [headcount, seatUSD]);

  /* Step 2: adoption (1..10) */
  const [adoption, setAdoption] = useState(5);
  const maturityHoursPerPerson = useMemo(() => maturityToHours(adoption), [adoption]);
  const maturityHoursTeam = useMemo(
    () => Math.round(maturityHoursPerPerson * headcount),
    [maturityHoursPerPerson, headcount]
  );

  /* In-scope = trained */
  const numberTrained = headcount;

  /* Step 3: priorities */
  const allPriorityKeys: PriorityKey[] = [
    "throughput",
    "quality",
    "onboarding",
    "retention",
    "upskilling",
    "costAvoidance",
  ];
  const [selected, setSelected] = useState<PriorityKey[]>(
    allPriorityKeys.filter((k) => PRIORITY_META[k].defaultOn).slice(0, 3)
  );

  /* Dynamic step list (reflects EXACT user picks + results + summary) */
  const ALL_STEPS: { id: number; key: WizardStep; label: string }[] = useMemo(() => {
    const dyn = selected.map((p) => ({
      key: p as WizardStep,
      label: PRIORITY_META[p].label,
    }));
    const base = [
      { key: "team", label: "Team" },
      { key: "adoption", label: "AI Adoption" },
      { key: "priorities", label: "Team Priorities" },
      ...dyn,
      { key: "results", label: "Results" },
      { key: "summary", label: "Summary" },
    ] as const;
    return base.map((s, i) => ({ id: i + 1, key: s.key, label: s.label }));
  }, [selected]);

  /* Priority inputs (adjustable for all) */
  // Throughput + aggression
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);
  const [throughputAgg, setThroughputAgg] = useState<"low" | "avg" | "high">("avg");
  // Retention + aggression
  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);
  const [retentionAgg, setRetentionAgg] = useState<"low" | "avg" | "high">("avg");
  // Upskilling + aggression
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(1.5);
  const [upskillingAgg, setUpskillingAgg] = useState<"low" | "avg" | "high">("avg");
  // Quality (adjustable)
  const [qualityPct, setQualityPct] = useState(20); // % of base weekly hours regained
  // Onboarding (adjustable)
  const [onboardingHoursPerPerson, setOnboardingHoursPerPerson] = useState(0.5); // hours/week/employee
  // Cost Avoidance (adjustable)
  const [costAvoidancePct, setCostAvoidancePct] = useState(5); // % of base weekly hours avoided

  /* Aggression preset handler */
  const applyAgg = (k: PriorityKey, level: "low" | "avg" | "high") => {
    if (k === "throughput") {
      setThroughputAgg(level);
      if (level === "low") { setThroughputPct(4); setHandoffPct(3); }
      if (level === "avg") { setThroughputPct(8); setHandoffPct(6); }
      if (level === "high") { setThroughputPct(12); setHandoffPct(10); }
    }
    if (k === "retention") {
      setRetentionAgg(level);
      if (level === "low") { setRetentionLiftPct(1); setBaselineAttritionPct(10); }
      if (level === "avg") { setRetentionLiftPct(2); setBaselineAttritionPct(12); }
      if (level === "high") { setRetentionLiftPct(3); setBaselineAttritionPct(15); }
    }
    if (k === "upskilling") {
      setUpskillingAgg(level);
      if (level === "low") { setUpskillCoveragePct(40); setUpskillHoursPerWeek(1); }
      if (level === "avg") { setUpskillCoveragePct(60); setUpskillHoursPerWeek(1.5); }
      if (level === "high") { setUpskillCoveragePct(80); setUpskillHoursPerWeek(2); }
    }
  };

  /* Hours model */
  const baseWeeklyTeamHours = useMemo(
    () => maturityHoursPerPerson * headcount,
    [maturityHoursPerPerson, headcount]
  );

  const weeklyHours = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100))
        : 0,
      quality: selected.includes("quality")
        ? Math.round(baseWeeklyTeamHours * (qualityPct / 100))
        : 0,
      onboarding: selected.includes("onboarding")
        ? Math.round(onboardingHoursPerPerson * headcount)
        : 0,
      retention: selected.includes("retention")
        ? Math.round(((headcount * (baselineAttritionPct / 100)) * (retentionLiftPct / 100) * 120) / 52)
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * Math.max(0, upskillHoursPerWeek))
        : 0,
      costAvoidance: selected.includes("costAvoidance")
        ? Math.round(baseWeeklyTeamHours * (costAvoidancePct / 100))
        : 0,
    };
    return v;
  }, [
    selected,
    baseWeeklyTeamHours,
    throughputPct,
    handoffPct,
    headcount,
    retentionLiftPct,
    baselineAttritionPct,
    upskillCoveragePct,
    upskillHoursPerWeek,
    qualityPct,
    onboardingHoursPerPerson,
    costAvoidancePct,
  ]);

  const weeklyTotal = useMemo(() => Object.values(weeklyHours).reduce((a, b) => a + b, 0), [weeklyHours]);
  const monthlyValue = useMemo(() => weeklyTotal * hourlyCost * 4, [weeklyTotal, hourlyCost]);
  const annualValue = useMemo(() => monthlyValue * 12, [monthlyValue]);
  const annualROI = useMemo(() => (programCost === 0 ? 0 : annualValue / programCost), [annualValue, programCost]);
  const paybackMonths = useMemo(() => (monthlyValue === 0 ? Infinity : programCost / monthlyValue), [programCost, monthlyValue]);
  const productivityGainPct = useMemo(() => {
    const denom = headcount * 40;
    return denom > 0 ? (weeklyTotal / denom) * 100 : 0;
  }, [weeklyTotal, headcount]);

  /* Flow helpers */
  const stepIndex = ALL_STEPS.find((s) => s.key === stepKey)?.id ?? 1;
  const visibleProgress = ((stepIndex - 1) / (ALL_STEPS.length - 1)) * 100;

  const CONTINUE = () => {
    const idx = ALL_STEPS.findIndex((s) => s.key === stepKey);
    if (idx >= 0 && idx < ALL_STEPS.length - 1) setStepKey(ALL_STEPS[idx + 1].key);
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text)" }}>
      <style jsx>{`
        .progress-rail {
          width: 100%;
          height: 10px;
          border-radius: 9999px;
          background: #0c0f14;
          position: relative;
        }
        .progress-fill {
          height: 10px;
          border-radius: 9999px;
          background: ${AZURE};
          box-shadow: 0 0 12px ${AZURE}, 0 0 4px ${AZURE} inset;
          transition: width 150ms ease;
        }
        /* Slider: thumb sits centered on the rail */
        .range-wrap { position: relative; height: 10px; }
        input.range-slim {
          -webkit-appearance: none;
          appearance: none;
          position: absolute; top: 0; left: 0; right: 0;
          height: 10px; background: transparent; margin: 0; padding: 0;
        }
        input.range-slim::-webkit-slider-runnable-track { height: 10px; background: transparent; }
        input.range-slim::-moz-range-track { height: 10px; background: transparent; }
        input.range-slim::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: ${AZURE}; border: 2px solid #000; box-shadow: 0 0 12px ${AZURE};
          margin-top: -4px; /* centers on 10px rail */
        }
        input.range-slim::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: ${AZURE}; border: 2px solid #000; box-shadow: 0 0 12px ${AZURE};
        }
        /* Aggression pills */
        .agg-row { display: flex; gap: 10px; justify-content: center; margin-top: 18px; }
        .agg-box {
          padding: 8px 14px; border-radius: 9999px; background: #1a1a1a; border: 1px solid #333;
          text-align: center; width: 110px;
        }
        .agg-title { font-weight: 600; font-size: 0.9rem; }
        .agg-sub { opacity: 0.8; font-size: 0.75rem; }
        .agg-box--on { background: ${AZURE}; color: #000; border-color: ${AZURE}; }
        /* Results grid: 3 equal tiles */
        .results-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 1024px) { .results-3 { grid-template-columns: 1fr; } }
        /* Divider */
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0 12px; }
        .divider::before, .divider::after { content: ""; height: 1px; background: #1f2430; flex: 1; }
        /* ROI circle */
        .roi-circle {
          border: 2px solid ${AZURE};
          border-radius: 50%;
          padding: 6px 12px;
          display: inline-block;
          box-shadow: 0 0 6px ${AZURE};
        }
        /* Table */
        .fin-table { width: 100%; border-collapse: collapse; }
        .fin-table td, .fin-table th { padding: 10px 12px; }
        .fin-row { border-bottom: 1px solid #1f2430; }
        .fin-row--hi { border-bottom: 1px solid ${AZURE}; font-weight: 800; }
        .fin-cell-r { text-align: right; }
        .muted-80 { opacity: 0.8; }
        /* Contact button (green) */
        .btn-green {
          background: #16a34a; /* green-600 */
          color: white;
          font-weight: 600;
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
        }
      `}</style>

      {/* HERO (image in /public/hero.png) */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img src="/hero.png" alt="AI at Work — Brainster" className="hero-img shadow-soft" />
      </div>

      {/* Progress header */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              {ALL_STEPS.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className={`step-chip ${stepIndex >= s.id ? "step-chip--on" : "step-chip--off"}`}>{s.id}</span>
                  <span className="step-label">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="w-full mt-3">
              <div className="progress-rail">
                <div className="progress-fill" style={{ width: `${visibleProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4 pb-16">
        <div className="panel">
          {/* TEAM */}
          {stepKey === "team" && (
            <div>
              <h2 className="title">Team</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="card">
                  <label className="lbl">Department</label>
                  <select className="inp" value={dept} onChange={(e) => setDept(e.target.value as Dept)}>
                    {["Company-wide","Marketing","Sales","Customer Support","Operations","Engineering","HR"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="card">
                  <label className="lbl">Employees in scope</label>
                  <input className="inp" type="number" value={headcount} onChange={(e) => setHeadcount(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">Currency</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["EUR","USD","GBP","AUD"] as Currency[]).map((c) => (
                      <button key={c} onClick={() => setCurrency(c)} className={`pill ${currency === c ? "pill--active" : ""}`}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="card md:col-span-1">
                  <label className="lbl">Average annual salary</label>
                  <input className="inp" type="number" value={avgSalary} onChange={(e) => setAvgSalary(parseInt(e.target.value || "0", 10))} />
                  <div className="hint text-xs mt-2">Used to value hours saved.</div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn" onClick={() => go("adoption")}>Continue →</button>
              </div>
            </div>
          )}

          {/* ADOPTION */}
          {stepKey === "adoption" && (
            <div>
              <h2 className="title">AI Adoption</h2>
              <p className="muted text-sm mb-3">Slide to estimate current AI-in-workflow adoption.</p>

              <div className="grid md:grid-cols-[1fr_360px] gap-6">
                <div className="card">
                  <label className="lbl mb-2">Where are you today? (1–10)</label>
                  <div className="range-wrap">
                    <div className="progress-rail">
                      <div className="progress-fill" style={{ width: `${((adoption - 1) / 9) * 100}%` }} />
                    </div>
                    <input type="range" min={1} max={10} value={adoption} onChange={(e) => setAdoption(parseInt(e.target.value, 10))} className="range-slim" />
                  </div>
                  <div className="flex justify-between mt-2 font-semibold" style={{ color: "var(--text-dim)", fontSize: "15px" }}>
                    {Array.from({ length: 10 }).map((_, i) => <span key={i}>{i + 1}</span>)}
                  </div>
                  <div className="mt-4 text-[15px]">
                    <span className="font-bold">Selected: {adoption} — </span>{maturityExplainer[adoption - 1]}
                  </div>
                </div>

                <div className="card">
                  <div className="text-sm font-semibold muted">Estimated hours saved</div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="card">
                      <div className="text-xs muted">Per employee / week</div>
                      <div className="text-3xl font-extrabold">{maturityHoursPerPerson.toFixed(1)}</div>
                    </div>
                    <div className="card">
                      <div className="text-xs muted">Team / week</div>
                      <div className="text-3xl font-extrabold">{maturityHoursTeam.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="btn" onClick={() => go("priorities")}>Continue →</button>
              </div>
            </div>
          )}

          {/* PRIORITIES */}
          {stepKey === "priorities" && (
            <div>
              <h2 className="title">Team Priorities</h2>
              <p className="muted text-sm mb-4">Choose <b>exactly three</b> areas to focus.</p>

              <div className="grid md:grid-cols-3 gap-3">
                {allPriorityKeys.map((k) => {
                  const active = selected.includes(k);
                  const disabled = !active && selected.length >= 3;
                  return (
                    <div key={k} className={`priority ${active ? "priority--active" : ""} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{PRIORITY_META[k].label}</span>
                        <button
                          onClick={() => {
                            if (active) setSelected(selected.filter((x) => x !== k));
                            else if (!disabled) setSelected([...selected, k]);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${active ? "bg-[var(--bg-chip)] text-white" : "bg-[#22252c] text-white"}`}
                        >
                          {active ? "Selected" : "Select"}
                        </button>
                      </div>
                      <div className="text-sm muted mt-1">{PRIORITY_META[k].blurb}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button className="btn" onClick={CONTINUE} disabled={selected.length !== 3}>Continue →</button>
              </div>
            </div>
          )}

          {/* THROUGHPUT */}
          {stepKey === "throughput" && selected.includes("throughput") && (
            <div>
              <h2 className="title">Throughput</h2>
              <p className="muted text-sm mb-4">Use your inputs or the defaults; adjust to conservative or aggressive forecasting.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Time reclaimed %</label>
                  <input className="inp" type="number" min={0} max={30} value={throughputPct} onChange={(e) => setThroughputPct(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">Handoffs reduced %</label>
                  <input className="inp" type="number" min={0} max={30} value={handoffPct} onChange={(e) => setHandoffPct(parseInt(e.target.value || "0", 10))} />
                </div>
              </div>

              <div className="agg-row">
                {[
                  { k: "low", t: "Low", sub: "(Conservative)" },
                  { k: "avg", t: "Average", sub: "(Typical)" },
                  { k: "high", t: "Aggressive", sub: "(Stretch)" },
                ].map((o) => (
                  <button key={o.k} className={`agg-box ${throughputAgg === (o.k as any) ? "agg-box--on" : ""}`} onClick={() => applyAgg("throughput", o.k as any)}>
                    <div className="agg-title">{o.t}</div>
                    <div className="agg-sub">{o.sub}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={CONTINUE}>Continue →</button>
              </div>
            </div>
          )}

          {/* RETENTION */}
          {stepKey === "retention" && selected.includes("retention") && (
            <div>
              <h2 className="title">Retention</h2>
              <p className="muted text-sm mb-4">Use your inputs or the defaults; adjust to conservative or aggressive forecasting.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Attrition avoided %</label>
                  <input className="inp" type="number" min={0} max={30} value={retentionLiftPct} onChange={(e) => setRetentionLiftPct(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">Baseline attrition %</label>
                  <input className="inp" type="number" min={0} max={40} value={baselineAttritionPct} onChange={(e) => setBaselineAttritionPct(parseInt(e.target.value || "0", 10))} />
                </div>
              </div>

              <div className="agg-row">
                {[
                  { k: "low", t: "Low", sub: "(Conservative)" },
                  { k: "avg", t: "Average", sub: "(Typical)" },
                  { k: "high", t: "Aggressive", sub: "(Stretch)" },
                ].map((o) => (
                  <button key={o.k} className={`agg-box ${retentionAgg === (o.k as any) ? "agg-box--on" : ""}`} onClick={() => applyAgg("retention", o.k as any)}>
                    <div className="agg-title">{o.t}</div>
                    <div className="agg-sub">{o.sub}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={CONTINUE}>Continue →</button>
              </div>
            </div>
          )}

          {/* UPSKILLING */}
          {stepKey === "upskilling" && selected.includes("upskilling") && (
            <div>
              <h2 className="title">Upskilling</h2>
              <p className="muted text-sm mb-4">Use your inputs or the defaults; adjust to conservative or aggressive forecasting.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Coverage target %</label>
                  <input className="inp" type="number" min={0} max={100} value={upskillCoveragePct} onChange={(e) => setUpskillCoveragePct(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">Hours / week per person</label>
                  <input className="inp" type="number" min={0} step={0.1} value={upskillHoursPerWeek} onChange={(e) => setUpskillHoursPerWeek(parseFloat(e.target.value || "0"))} />
                </div>
              </div>

              <div className="agg-row">
                {[
                  { k: "low", t: "Low", sub: "(Conservative)" },
                  { k: "avg", t: "Average", sub: "(Typical)" },
                  { k: "high", t: "Aggressive", sub: "(Stretch)" },
                ].map((o) => (
                  <button key={o.k} className={`agg-box ${upskillingAgg === (o.k as any) ? "agg-box--on" : ""}`} onClick={() => applyAgg("upskilling", o.k as any)}>
                    <div className="agg-title">{o.t}</div>
                    <div className="agg-sub">{o.sub}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={CONTINUE}>Continue →</button>
              </div>
            </div>
          )}

          {/* QUALITY */}
          {stepKey === "quality" && selected.includes("quality") && (
            <div>
              <h2 className="title">Quality</h2>
              <p className="muted text-sm mb-4">Use your inputs or the defaults; adjust to conservative or aggressive forecasting.</p>
              <div className="grid md:grid-cols-1 gap-4">
                <div className="card">
                  <label className="lbl">Quality improvement (% of base weekly hours)</label>
                  <input className="inp" type="number" min={0} max={50} value={qualityPct} onChange={(e) => setQualityPct(parseInt(e.target.value || "0", 10))} />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={CONTINUE}>Continue →</button>
              </div>
            </div>
          )}

          {/* ONBOARDING */}
          {stepKey === "onboarding" && selected.includes("onboarding") && (
            <div>
              <h2 className="title">Onboarding</h2>
              <p className="muted text-sm mb-4">Use your inputs or the defaults; adjust to conservative or aggressive forecasting.</p>
              <div className="grid md:grid-cols-1 gap-4">
                <div className="card">
                  <label className="lbl">Hours / week saved per employee (onboarding/ramp)</label>
                  <input className="inp" type="number" min={0} step={0.1} value={onboardingHoursPerPerson} onChange={(e) => setOnboardingHoursPerPerson(parseFloat(e.target.value || "0"))} />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={CONTINUE}>Continue →</button>
              </div>
            </div>
          )}

          {/* COST AVOIDANCE */}
          {stepKey === "costAvoidance" && selected.includes("costAvoidance") && (
            <div>
              <h2 className="title">Cost Avoidance</h2>
              <p className="muted text-sm mb-4">Use your inputs or the defaults; adjust to conservative or aggressive forecasting.</p>
              <div className="grid md:grid-cols-1 gap-4">
                <div className="card">
                  <label className="lbl">Hours avoided (% of base weekly hours)</label>
                  <input className="inp" type="number" min={0} max={30} value={costAvoidancePct} onChange={(e) => setCostAvoidancePct(parseInt(e.target.value || "0", 10))} />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={CONTINUE}>Continue →</button>
              </div>
            </div>
          )}

          {/* RESULTS — 3 headline boxes */}
          {stepKey === "results" && (
            <div>
              <h2 className="title">Results</h2>

              <div className="results-3">
                <Pill label="Total Annual Value" value={<>{symbol}{Math.round(annualValue).toLocaleString()}</>} />
                <Pill label="Total Hours Saved" value={(weeklyTotal * 52).toLocaleString()} />
                <Pill label="Productivity Gain (%)" value={`${productivityGainPct.toFixed(1)}%`} />
              </div>

              {/* Priority breakdown table */}
              <div className="mt-6 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <div className="grid grid-cols-[1fr_180px_200px] py-3 px-4 text-xs font-semibold table-header">
                  <div>PRIORITY</div>
                  <div className="text-right">HOURS SAVED</div>
                  <div className="text-right">ANNUAL VALUE</div>
                </div>

                {allPriorityKeys.filter((k) => selected.includes(k)).map((k) => {
                  const hours = Math.round(weeklyHours[k] * 52);
                  const value = hours * hourlyCost;
                  return (
                    <div key={k} className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 table-row">
                      <div>
                        <div className="font-bold">{PRIORITY_META[k].label}</div>
                        <div className="text-sm muted">{PRIORITY_META[k].blurb}</div>
                      </div>
                      <div className="text-right font-semibold">{hours.toLocaleString()} h</div>
                      <div className="text-right font-semibold">
                        {symbol}{Math.round(value).toLocaleString()}
                      </div>
                    </div>
                  );
                })}

                <div className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 table-total">
                  <div className="font-extrabold">Total</div>
                  <div className="text-right font-extrabold">{(weeklyTotal * 52).toLocaleString()} h</div>
                  <div className="text-right font-extrabold">
                    {symbol}{Math.round(annualValue).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={() => go("summary")}>Continue →</button>
              </div>
            </div>
          )}

          {/* SUMMARY — financial table + executive summary + CTA row */}
          {stepKey === "summary" && (
            <div>
              <h2 className="title">Summary</h2>

              <div className="divider"><span className="muted-80 font-semibold">Financial Summary</span></div>

              <div className="card">
                <table className="fin-table">
                  <tbody>
                    <tr className="fin-row fin-row--hi">
                      <td><strong>Total Program Investment (Annual)</strong></td>
                      <td className="muted-80">{numberTrained.toLocaleString()} × {symbol}{seatUSD.toLocaleString()}</td>
                      <td className="fin-cell-r"><strong>{symbol}{programCost.toLocaleString()}</strong></td>
                    </tr>
                    <tr className="fin-row">
                      <td>Number Trained</td>
                      <td className="muted-80">—</td>
                      <td className="fin-cell-r">{numberTrained.toLocaleString()}</td>
                    </tr>
                    <tr className="fin-row">
                      <td>Cost per Seat</td>
                      <td className="muted-80">—</td>
                      <td className="fin-cell-r">{symbol}{seatUSD.toLocaleString()}</td>
                    </tr>
                    <tr className="fin-row">
                      <td><strong>Estimated Value Generated (Annual)</strong></td>
                      <td className="muted-80">Time saved × salary</td>
                      <td className="fin-cell-r"><strong>{symbol}{Math.round(annualValue).toLocaleString()}</strong></td>
                    </tr>
                    <tr className="fin-row">
                      <td>ROI</td>
                      <td className="muted-80">Value ÷ Investment</td>
                      <td className="fin-cell-r"><span className="roi-circle">{annualROI.toFixed(1)}×</span></td>
                    </tr>
                    <tr className="fin-row">
                      <td>Payback Period</td>
                      <td className="muted-80">Investment ÷ Monthly Value</td>
                      <td className="fin-cell-r">{isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} months` : "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="divider"><span className="muted-80 font-semibold">Executive Summary</span></div>

              <div className="card">
                {/* Where you are today */}
                <p className="text-sm muted mb-3">
                  Based on your AI adoption score of <b>{adoption}</b>, your team is operating at the{" "}
                  <b>{maturityExplainer[adoption - 1].split(":")[0]}</b> stage. {maturityExplainer[adoption - 1]}{" "}
                  At this maturity level, you’re already reclaiming about <b>{maturityHoursTeam.toLocaleString()} hours/week</b> across the team,
                  which can compound further by focusing on the selected priorities.
                </p>

                {/* What you can achieve */}
                <p className="text-sm muted mb-3">
                  With <b>{headcount.toLocaleString()}</b> employees in scope, the current model unlocks{" "}
                  <b>{(weeklyTotal * 52).toLocaleString()} hours/year</b> — roughly{" "}
                  <b>{(weeklyTotal * 52 / 1800).toFixed(1)} FTEs</b> of capacity — valued at{" "}
                  <b>{symbol}{Math.round(annualValue).toLocaleString()}</b> annually. This translates to an ROI of{" "}
                  <b>{annualROI.toFixed(1)}×</b> and a payback of <b>{isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} months` : "—"}</b>,
                  with an estimated productivity gain of <b>{productivityGainPct.toFixed(1)}%</b>.
                </p>

                {/* Next steps + CTA text */}
                <p className="text-sm muted">
                  Given the scale of opportunity, <b>get in touch to discuss pilot programs</b> and how we can set next steps in motion
                  across your top workflows. We’ll align on quick wins, formalize enablement, and track value capture from day one.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm muted mt-3">
                  <li>Prioritize 3 workflows for pilot; ship templates & QA/guardrails in 2 weeks.</li>
                  <li>Launch an “AI Champions” enablement program to scale adoption.</li>
                  <li>Track value capture monthly; review ROI quarterly and iterate.</li>
                </ul>
              </div>

              {/* Footer row with centered Contact Us */}
              <div className="mt-6 grid grid-cols-3 items-center">
                <div className="justify-self-start">
                  <button className="btn-ghost" onClick={() => go("results")}>← Back</button>
                </div>
                <div className="justify-self-center">
                  <a
                    className="btn-green"
                    href={
                      `mailto:spower@monaco.edu` +
                      `?subject=${encodeURIComponent("AI Enablement Pilot — Next Steps")}` +
                      `&body=${encodeURIComponent(
                        `Hi Stephen,\n\nI'd like to discuss pilot programs and next steps for our team.\n\nContext:\n- Headcount: ${headcount}\n- Adoption score: ${adoption}\n- Estimated annual value: ${symbol}${Math.round(annualValue).toLocaleString()}\n- ROI: ${annualROI.toFixed(1)}x\n\nThanks,\n`
                      )}`
                    }
                  >
                    Contact Us
                  </a>
                </div>
                <div className="justify-self-end">
                  <button className="btn" onClick={reset}>Start over</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
