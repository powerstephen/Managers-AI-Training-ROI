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
  quality: { label: "Quality", blurb: "Reduce rework and lift first-pass yield (less do-overs).", defaultOn: true },
  onboarding: { label: "Onboarding", blurb: "Accelerate ramp with guided workflows and AI assist.", defaultOn: true },
  retention: { label: "Retention", blurb: "Reduce regretted attrition via better tooling and enablement." },
  upskilling: { label: "Upskilling", blurb: "Grow competency coverage; unlock compounding gains." },
  costAvoidance: { label: "Cost avoidance", blurb: "Avoid overtime/outside spend via automation/self-service." },
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

  // Quality (now 2 inputs + aggression)
  const [qualityReworkPct, setQualityReworkPct] = useState(12);
  const [qualityFirstPassPct, setQualityFirstPassPct] = useState(16);
  const [qualityAgg, setQualityAgg] = useState<"low" | "avg" | "high">("avg");

  // Onboarding (now coverage + hours + aggression)
  const [onboardingCoveragePct, setOnboardingCoveragePct] = useState(20);
  const [onboardingHoursPerPerson, setOnboardingHoursPerPerson] = useState(0.5);
  const [onboardingAgg, setOnboardingAgg] = useState<"low" | "avg" | "high">("avg");

  // Cost Avoidance (now 2 inputs + aggression)
  const [costAvoidancePct, setCostAvoidancePct] = useState(5);
  const [overtimeAvoidancePct, setOvertimeAvoidancePct] = useState(4);
  const [costAgg, setCostAgg] = useState<"low" | "avg" | "high">("avg");

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
    if (k === "quality") {
      setQualityAgg(level);
      if (level === "low") { setQualityReworkPct(8); setQualityFirstPassPct(10); }
      if (level === "avg") { setQualityReworkPct(12); setQualityFirstPassPct(16); }
      if (level === "high") { setQualityReworkPct(16); setQualityFirstPassPct(22); }
    }
    if (k === "onboarding") {
      setOnboardingAgg(level);
      if (level === "low") { setOnboardingCoveragePct(10); setOnboardingHoursPerPerson(0.3); }
      if (level === "avg") { setOnboardingCoveragePct(20); setOnboardingHoursPerPerson(0.5); }
      if (level === "high") { setOnboardingCoveragePct(30); setOnboardingHoursPerPerson(0.8); }
    }
    if (k === "costAvoidance") {
      setCostAgg(level);
      if (level === "low") { setCostAvoidancePct(3); setOvertimeAvoidancePct(2); }
      if (level === "avg") { setCostAvoidancePct(5); setOvertimeAvoidancePct(4); }
      if (level === "high") { setCostAvoidancePct(8); setOvertimeAvoidancePct(6); }
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
        ? Math.round(baseWeeklyTeamHours * ((qualityReworkPct + qualityFirstPassPct * 0.5) / 100))
        : 0,
      onboarding: selected.includes("onboarding")
        ? Math.round((onboardingCoveragePct / 100) * headcount * Math.max(0, onboardingHoursPerPerson))
        : 0,
      retention: selected.includes("retention")
        ? Math.round(((headcount * (baselineAttritionPct / 100)) * (retentionLiftPct / 100) * 120) / 52)
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * Math.max(0, upskillHoursPerWeek))
        : 0,
      costAvoidance: selected.includes("costAvoidance")
        ? Math.round(baseWeeklyTeamHours * ((costAvoidancePct + overtimeAvoidancePct * 0.5) / 100))
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
    qualityReworkPct,
    qualityFirstPassPct,
    onboardingCoveragePct,
    onboardingHoursPerPerson,
    costAvoidancePct,
    overtimeAvoidancePct,
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
        .progress-rail { width: 100%; height: 10px; border-radius: 9999px; background: #0c0f14; position: relative; }
        .progress-fill { height: 10px; border-radius: 9999px; background: ${AZURE}; box-shadow: 0 0 12px ${AZURE}, 0 0 4px ${AZURE} inset; transition: width 150ms ease; }
        .range-wrap { position: relative; height: 10px; }
        input.range-slim { -webkit-appearance: none; appearance: none; position: absolute; top: 0; left: 0; right: 0; height: 10px; background: transparent; margin: 0; padding: 0; }
        input.range-slim::-webkit-slider-runnable-track { height: 10px; background: transparent; }
        input.range-slim::-moz-range-track { height: 10px; background: transparent; }
        input.range-slim::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${AZURE}; border: 2px solid #000; box-shadow: 0 0 12px ${AZURE}; margin-top: -4px; }
        input.range-slim::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: ${AZURE}; border: 2px solid #000; box-shadow: 0 0 12px ${AZURE}; }
        .agg-row { display: flex; gap: 10px; justify-content: center; margin-top: 18px; }
        .agg-box { padding: 8px 14px; border-radius: 9999px; background: #1a1a1a; border: 1px solid #333; text-align: center; width: 110px; }
        .agg-title { font-weight: 600; font-size: 0.9rem; }
        .agg-sub { opacity: 0.8; font-size: 0.75rem; }
        .agg-box--on { background: ${AZURE}; color: #000; border-color: ${AZURE}; }
        .results-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 1024px) { .results-3 { grid-template-columns: 1fr; } }
        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0 12px; }
        .divider::before, .divider::after { content: ""; height: 1px; background: #1f2430; flex: 1; }
        .roi-circle { border: 2px solid ${AZURE}; border-radius: 50%; padding: 6px 12px; display: inline-block; box-shadow: 0 0 6px ${AZURE}; }
        .fin-table { width: 100%; border-collapse: collapse; }
        .fin-table td, .fin-table th { padding: 10px 12px; }
        .fin-row { border-bottom: 1px solid #1f2430; }
        .fin-row--hi { border-bottom: 1px solid ${AZURE}; font-weight: 800; }
        .fin-cell-r { text-align: right; }
        .muted-80 { opacity: 0.8; }
        .btn-green { background: #16a34a; color: white; font-weight: 600; padding: 0.5rem 1.25rem; border-radius: 0.5rem; }
      `}</style>

      {/* HERO */}
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

          {/* QUALITY (now 2 inputs + L/A/H) */}
          {stepKey === "quality" && selected.includes("quality") && (
            <div>
              <h2 className="title">Quality</h2>
              <p className="muted text-sm mb-4">Use your inputs or the defaults; adjust to conservative or aggressive forecasting.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Rework reduction %</label>
                  <input className="inp" type="number" min={0} max={50} value={qualityReworkPct} onChange={(e) => setQualityReworkPct(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">First-pass yield lift %</label>
                  <input className="inp" type="number" min={0} max={50} value={qualityFirstPassPct} onChange={(e) => setQualityFirstPassPct(parseInt(e.target.value || "0", 10))} />
                </div>
              </div>
              <div className="agg-row">
                {[
                  { k: "low", t: "Low", sub: "(Conservative)" },
                  { k: "avg", t: "Average", sub: "(Typical)" },
                  { k: "high", t: "Aggressive", sub: "(Stretch)" },
                ].map((o) => (
                  <button key={o.k} className={`agg-box ${qualityAgg === (o.k as any) ? "agg-box--on" : ""}`} onClick={() => applyAgg("quality", o.k as any)}>
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

          {/* ONBOARDING (now coverage + hours + L/A/H) */}
          {stepKey === "onboarding" && selected.includes("onboarding") && (
            <div>
              <h2 className="title">Onboarding</h2>
              <p className="muted text-sm mb-4">Use your inputs or the defaults; adjust to conservative or aggressive forecasting.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Coverage target %</label>
                  <input className="inp" type="number" min={0} max={100} value={onboardingCoveragePct} onChange={(e) => setOnboardingCoveragePct(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">Hours / week per person</label>
                  <input className="inp" type="number" min={0} step={0.1} value={onboardingHoursPerPerson} onChange={(e) => setOnboardingHoursPerPerson(parseFloat(e.target.value || "0"))} />
                </div>
              </div>
              <div className="agg-row">
                {[
                  { k: "low", t: "Low", sub: "(Conservative)" },
                  { k: "avg", t: "Average", sub: "(Typical)" },
                  { k: "high", t: "Aggressive", sub: "(Stretch)" },
                ].map((o) => (
                  <button key={o.k} className={`agg-box ${onboardingAgg === (o.k as any) ? "agg-box--on" : ""}`} onClick={() => applyAgg("onboarding", o.k as any)}>
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

          {/* COST AVOIDANCE (now 2 inputs + L/A/H) */}
          {stepKey === "costAvoidance" && selected.includes("costAvoidance") && (
            <div>
              <h2 className="title">Cost Avoidance</h2>
              <p className="muted text-sm mb-4">Use your inputs or the defaults; adjust to conservative or aggressive forecasting.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Avoided low-value work %</label>
                  <input className="inp" type="number" min={0} max={30} value={costAvoidancePct} onChange={(e) => setCostAvoidancePct(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">Overtime/external spend avoided %</label>
                  <input className="inp" type="number" min={0} max={30} value={overtimeAvoidancePct} onChange={(e) => setOvertimeAvoidancePct(parseInt(e.target.value || "0", 10))} />
                </div>
              </div>
              <div className="agg-row">
                {[
                  { k: "low", t: "Low", sub: "(Conservative)" },
                  { k: "avg", t: "Average", sub: "(Typical)" },
                  { k: "high", t: "Aggressive", sub: "(Stretch)" },
                ].map((o) => (
                  <button key={o.k} className={`agg-box ${costAgg === (o.k as any) ? "agg-box--on" : ""}`} onClick={() => applyAgg("costAvoidance", o.k as any)}>
                    <div className="agg-title">{o.t}</div>
                    <div className="agg-sub">{o.sub}</div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className
