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

const PRIORITY_META: Record<PriorityKey, { label: string; blurb: string; defaultOn?: boolean }> = {
  throughput: { label: "Throughput", blurb: "Ship faster; reduce cycle time and waiting time.", defaultOn: true },
  quality: { label: "Quality", blurb: "Fewer reworks; better first-pass yield.", defaultOn: true },
  onboarding: { label: "Onboarding", blurb: "Ramp new hires faster with AI assist.", defaultOn: true },
  retention: { label: "Retention", blurb: "Reduce regretted attrition via better tooling." },
  upskilling: { label: "Upskilling", blurb: "Grow competency coverage; unlock compounding gains." },
  costAvoidance: { label: "Cost avoidance", blurb: "Avoid outside spend/overtime via automation." }
};

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
  "Embedded: >80% coverage; evals/guardrails; continuous improvement."
];

/* Wizard steps key (replaces any old StepKey) */
type WizardStep =
  | "team"
  | "adoption"
  | "priorities"
  | "throughput"
  | "retention"
  | "upskilling"
  | "results";

/* ---------- Component ---------- */
export default function Page() {
  /* ---- Step system ---- */
  const [step, setStep] = useState<WizardStep>("team");
  const orderedConfigSteps: PriorityKey[] = ["throughput", "retention", "upskilling"];

  const goBack = () => {
    const order: WizardStep[] = computeFullFlow(selected);
    const i = order.indexOf(step);
    if (i > 0) setStep(order[i - 1]);
  };
  const goNext = () => {
    const order: WizardStep[] = computeFullFlow(selected);
    const i = order.indexOf(step);
    if (i < order.length - 1) setStep(order[i + 1]);
  };
  const reset = () => window.location.reload();

  /* ---- Step 1: Team ---- */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState(850);
  const [programMonths, setProgramMonths] = useState(3);

  /* ---- Step 2: AI Adoption ---- */
  const [maturity, setMaturity] = useState(5);

  /* ---- Step 3: Team Priorities ---- */
  const keys: PriorityKey[] = [
    "throughput",
    "quality",
    "onboarding",
    "retention",
    "upskilling",
    "costAvoidance"
  ];
  const [selected, setSelected] = useState<PriorityKey[]>(
    keys.filter((k) => PRIORITY_META[k].defaultOn).slice(0, 3)
  );

  /* ---- Config choices for 4–6 ---- */
  // Throughput
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);
  const [throughputBand, setThroughputBand] = useState<"low" | "avg" | "high">("avg");

  // Retention
  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);
  const [retentionBand, setRetentionBand] = useState<"low" | "avg" | "high">("avg");

  // Upskilling
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(0.5);
  const [upskillBand, setUpskillBand] = useState<"low" | "avg" | "high">("avg");

  /* ---- Calcs ---- */
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const maturityHoursPerPerson = useMemo(() => maturityToHours(maturity), [maturity]);
  const maturityHoursTeam = useMemo(
    () => Math.round(maturityHoursPerPerson * headcount),
    [maturityHoursPerPerson, headcount]
  );
  const baseWeeklyTeamHours = useMemo(
    () => maturityHoursPerPerson * headcount,
    [maturityHoursPerPerson, headcount]
  );

  // Apply “Low / Average / High” presets to inputs (no sliders)
  const applyBand = (
    which: "throughput" | "retention" | "upskilling",
    band: "low" | "avg" | "high"
  ) => {
    if (which === "throughput") {
      if (band === "low") {
        setThroughputPct(4);
        setHandoffPct(3);
      } else if (band === "avg") {
        setThroughputPct(8);
        setHandoffPct(6);
      } else {
        setThroughputPct(14);
        setHandoffPct(10);
      }
      setThroughputBand(band);
    }
    if (which === "retention") {
      if (band === "low") {
        setRetentionLiftPct(1);
        setBaselineAttritionPct(10);
      } else if (band === "avg") {
        setRetentionLiftPct(2);
        setBaselineAttritionPct(12);
      } else {
        setRetentionLiftPct(3);
        setBaselineAttritionPct(15);
      }
      setRetentionBand(band);
    }
    if (which === "upskilling") {
      if (band === "low") {
        setUpskillCoveragePct(40);
        setUpskillHoursPerWeek(0.3);
      } else if (band === "avg") {
        setUpskillCoveragePct(60);
        setUpskillHoursPerWeek(0.5);
      } else {
        setUpskillCoveragePct(75);
        setUpskillHoursPerWeek(0.7);
      }
      setUpskillBand(band);
    }
  };

  // Weekly hours by priority (tamed onboarding)
  const weeklyHours = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100))
        : 0,
      quality: selected.includes("quality") ? Math.round(baseWeeklyTeamHours * 0.08) : 0, // more conservative 8%
      onboarding: selected.includes("onboarding")
        ? Math.round(Math.min(headcount * 0.2, Math.max(0, headcount * 0.12)) * 8) // tamed to realistic weekly hours
        : 0,
      retention: selected.includes("retention")
        ? Math.round(((headcount * (baselineAttritionPct / 100)) * (retentionLiftPct / 100) * 40) / 52)
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * upskillHoursPerWeek)
        : 0,
      costAvoidance: selected.includes("costAvoidance")
        ? Math.round(baseWeeklyTeamHours * 0.05) // conservative 5%
        : 0
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
    upskillHoursPerWeek
  ]);

  const weeklyTotal = useMemo(() => Object.values(weeklyHours).reduce((a, b) => a + b, 0), [weeklyHours]);
  const monthlyValue = useMemo(() => weeklyTotal * hourlyCost * 4, [weeklyTotal, hourlyCost]);
  const programCost = useMemo(() => headcount * trainingPerEmployee, [headcount, trainingPerEmployee]);
  const annualValue = useMemo(() => monthlyValue * 12, [monthlyValue]);
  const annualROI = useMemo(() => (programCost === 0 ? 0 : annualValue / programCost), [annualValue, programCost]);
  const paybackMonths = useMemo(() => (monthlyValue === 0 ? Infinity : programCost / monthlyValue), [programCost, monthlyValue]);

  const symbol = CURRENCY_SYMBOL[currency];

  /* ---- Step list for progress UI ---- */
  const progressSteps: { key: WizardStep; label: string }[] = [
    { key: "team", label: "Team" },
    { key: "adoption", label: "AI Adoption" },
    { key: "priorities", label: "Team Priorities" },
    { key: "throughput", label: "Throughput" },
    { key: "retention", label: "Retention" },
    { key: "upskilling", label: "Upskilling" },
    { key: "results", label: "Results" }
  ];

  const flow = computeFullFlow(selected);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text)" }}>
      {/* HERO */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img src="/hero.png" alt="AI at Work — Brainster" className="hero-img shadow-soft" />
      </div>

      {/* Progress */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="panel flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            {progressSteps.map((s) => {
              const inFlow = flow.includes(s.key);
              const idx = flow.indexOf(s.key);
              const activeIdx = flow.indexOf(step);
              const done = inFlow && idx <= activeIdx;
              return (
                <div key={s.key} className="flex items-center gap-2 opacity-100">
                  <span className={`step-chip ${done ? "step-chip--on" : "step-chip--off"}`}>{inFlow ? (idx + 1) : "•"}</span>
                  <span className="step-label">{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="grow h-1 rounded-full" style={{ background: "var(--brand)" }} />
        </div>
      </div>

      {/* Main */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4 pb-16">
        <div className="panel">
          {/* STEP: Team */}
          {step === "team" && (
            <div>
              <h2 className="title">Team</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="card">
                  <label className="lbl">Department</label>
                  <select className="inp" value={dept} onChange={(e) => setDept(e.target.value as Dept)}>
                    {[
                      "Company-wide",
                      "Marketing",
                      "Sales",
                      "Customer Support",
                      "Operations",
                      "Engineering",
                      "HR"
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <p className="hint">Choose a function or “Company-wide”.</p>
                </div>

                <div className="card">
                  <label className="lbl">Employees in scope</label>
                  <input
                    className="inp"
                    type="number"
                    value={headcount}
                    onChange={(e) => setHeadcount(parseInt(e.target.value || "0", 10))}
                  />
                </div>

                <div className="card">
                  <label className="lbl">Currency</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["EUR", "USD", "GBP", "AUD"] as Currency[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={`pill ${currency === c ? "pill--active" : ""}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold mt-8 mb-2">Program cost assumptions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="card">
                  <label className="lbl">Average annual salary ({symbol})</label>
                  <input
                    className="inp"
                    type="number"
                    value={avgSalary}
                    onChange={(e) => setAvgSalary(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <label className="lbl">Training per employee ({symbol})</label>
                  <input
                    className="inp"
                    type="number"
                    value={trainingPerEmployee}
                    onChange={(e) => setTrainingPerEmployee(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <label className="lbl">Program duration (months)</label>
                  <input
                    className="inp"
                    type="number"
                    value={programMonths}
                    onChange={(e) => setProgramMonths(parseInt(e.target.value || "0", 10))}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: AI Adoption */}
          {step === "adoption" && (
            <div>
              <div className="title">AI Adoption</div>
              <p className="muted text-sm mb-4">
                Benchmark where you are today to set realistic improvement targets.
              </p>
              <div className="grid md:grid-cols-[1fr_360px] gap-6">
                <div className="card">
                  <label className="lbl mb-2">Where are you today? (1–10)</label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={maturity}
                    onChange={(e) => setMaturity(parseInt(e.target.value, 10))}
                    className="w-full range-slim"
                    style={{ accentColor: "var(--brand)" }}
                  />
                  <div
                    className="flex justify-between mt-2 font-semibold"
                    style={{ color: "var(--text-dim)", fontSize: "15px" }}
                  >
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>
                  <div className="mt-4 text-[15px]">
                    <span className="font-bold">Selected: {maturity} — </span>
                    {maturityExplainer[maturity - 1]}
                  </div>
                </div>

                <div className="card">
                  <div className="text-sm font-semibold muted">Estimated hours saved</div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="card">
                      <div className="text-xs muted">Per employee / week</div>
                      <div className="text-3xl font-extrabold">
                        {maturityToHours(maturity).toFixed(1)}
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs muted">Team / week</div>
                      <div className="text-3xl font-extrabold">
                        {maturityHoursTeam.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs muted">Refine via priorities and training below.</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Team Priorities */}
          {step === "priorities" && (
            <div>
              <h2 className="title">Team Priorities</h2>
              <p className="muted text-sm mb-4">Choose exactly three areas to focus your ROI model.</p>

              <div className="grid md:grid-cols-3 gap-3">
                {keys.map((k) => {
                  const active = selected.includes(k);
                  const disabled = !active && selected.length >= 3;
                  return (
                    <div
                      key={k}
                      className={`priority ${active ? "priority--active" : ""} ${
                        disabled ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{PRIORITY_META[k].label}</span>
                        <button
                          onClick={() => {
                            if (active) setSelected(selected.filter((x) => x !== k));
                            else if (!disabled) setSelected([...selected, k]);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            active ? "bg-[var(--bg-chip)] text-white" : "bg-[#22252c] text-white"
                          }`}
                        >
                          {active ? "Selected" : "Select"}
                        </button>
                      </div>
                      <div className="text-sm muted mt-1">{PRIORITY_META[k].blurb}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext} disabled={selected.length !== 3}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Throughput config (only if selected) */}
          {step === "throughput" && selected.includes("throughput") && (
            <div>
              <h2 className="title">Throughput</h2>
              <p className="muted text-sm mb-4">Quick edit of assumptions for throughput impact.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Time reclaimed %</label>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    max={30}
                    value={throughputPct}
                    onChange={(e) => setThroughputPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <label className="lbl">Handoffs reduced %</label>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    max={30}
                    value={handoffPct}
                    onChange={(e) => setHandoffPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
              </div>

              {/* Low / Avg / High boxes */}
              <div className="flex gap-3 mt-4 flex-wrap">
                {[
                  { k: "low", title: "Low", sub: "(Conservative)" },
                  { k: "avg", title: "Average", sub: "(Typical)" },
                  { k: "high", title: "Aggressive", sub: "(Best case)" }
                ].map((b) => (
                  <button
                    key={b.k}
                    onClick={() => applyBand("throughput", b.k as "low" | "avg" | "high")}
                    className={`select-box ${throughputBand === b.k ? "select-box--on" : "select-box--off"}`}
                  >
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-xs mt-0.5 opacity-80">{b.sub}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Retention config (only if selected) */}
          {step === "retention" && selected.includes("retention") && (
            <div>
              <h2 className="title">Retention</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Attrition avoided %</label>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    max={30}
                    value={retentionLiftPct}
                    onChange={(e) => setRetentionLiftPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <label className="lbl">Baseline attrition %</label>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    max={40}
                    value={baselineAttritionPct}
                    onChange={(e) => setBaselineAttritionPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
              </div>

              {/* Low / Avg / High boxes */}
              <div className="flex gap-3 mt-4 flex-wrap">
                {[
                  { k: "low", title: "Low", sub: "(Conservative)" },
                  { k: "avg", title: "Average", sub: "(Typical)" },
                  { k: "high", title: "Aggressive", sub: "(Best case)" }
                ].map((b) => (
                  <button
                    key={b.k}
                    onClick={() => applyBand("retention", b.k as "low" | "avg" | "high")}
                    className={`select-box ${retentionBand === b.k ? "select-box--on" : "select-box--off"}`}
                  >
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-xs mt-0.5 opacity-80">{b.sub}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Upskilling config (only if selected) */}
          {step === "upskilling" && selected.includes("upskilling") && (
            <div>
              <h2 className="title">Upskilling</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Coverage target %</label>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    max={100}
                    value={upskillCoveragePct}
                    onChange={(e) => setUpskillCoveragePct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <label className="lbl">Hours / week per person</label>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    step={0.1}
                    value={upskillHoursPerWeek}
                    onChange={(e) => setUpskillHoursPerWeek(parseFloat(e.target.value || "0"))}
                  />
                </div>
              </div>

              {/* Low / Avg / High boxes */}
              <div className="flex gap-3 mt-4 flex-wrap">
                {[
                  { k: "low", title: "Low", sub: "(Conservative)" },
                  { k: "avg", title: "Average", sub: "(Typical)" },
                  { k: "high", title: "Aggressive", sub: "(Best case)" }
                ].map((b) => (
                  <button
                    key={b.k}
                    onClick={() => applyBand("upskilling", b.k as "low" | "avg" | "high")}
                    className={`select-box ${upskillBand === b.k ? "select-box--on" : "select-box--off"}`}
                  >
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-xs mt-0.5 opacity-80">{b.sub}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Results */}
          {step === "results" && (
            <div>
              <h2 className="title">Results</h2>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="kpi kpi--accent">
                  <div className="kpi__label">Total annual value</div>
                  <div className="kpi__value">
                    {symbol}
                    {Math.round(annualValue).toLocaleString()}
                  </div>
                </div>
                <div className="kpi kpi--accent">
                  <div className="kpi__label">Annual ROI</div>
                  <div className="kpi__value">{annualROI.toFixed(1)}×</div>
                </div>
                <div className="kpi kpi--accent">
                  <div className="kpi__label">Payback</div>
                  <div className="kpi__value">{isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : "—"}</div>
                </div>
                <div className="kpi kpi--accent">
                  <div className="kpi__label">Total hours saved (est.)</div>
                  <div className="kpi__value">{(weeklyTotal * 52).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <div
                  className="grid grid-cols-[1fr_180px_200px] py-3 px-4 text-xs font-semibold"
                  style={{ color: "var(--text-dim)", background: "#101317" }}
                >
                  <div>PRIORITY</div>
                  <div className="text-right">HOURS SAVED</div>
                  <div className="text-right">ANNUAL VALUE</div>
                </div>
                {keys
                  .filter((k) => selected.includes(k))
                  .map((k) => {
                    const hours = Math.round(weeklyHours[k] * 52);
                    const value = hours * hourlyCost;
                    return (
                      <div
                        key={k}
                        className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div>
                          <div className="font-bold">{PRIORITY_META[k].label}</div>
                          <div className="text-sm muted">{PRIORITY_META[k].blurb}</div>
                        </div>
                        <div className="text-right font-semibold">{hours.toLocaleString()} h</div>
                        <div className="text-right font-semibold">
                          {symbol}
                          {Math.round(value).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                <div
                  className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t"
                  style={{ borderColor: "var(--border-strong)", background: "#0f1216" }}
                >
                  <div className="font-extrabold">Total</div>
                  <div className="text-right font-extrabold">{(weeklyTotal * 52).toLocaleString()} h</div>
                  <div className="text-right font-extrabold">
                    {symbol}
                    {Math.round(annualValue).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="card mt-6">
                <div className="text-sm font-bold mb-2">Next steps</div>
                <ul className="list-disc pl-5 space-y-1 text-sm muted">
                  <li>Map top 3 workflows → ship prompt templates & QA/guardrails within 2 weeks.</li>
                  <li>Launch “AI Champions” cohort; set quarterly ROI reviews; track usage to correlate with retention.</li>
                  <li>Set competency coverage target to 60% and measure weekly AI-in-task usage.</li>
                </ul>
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={reset}>
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function computeFullFlow(selected: PriorityKey[]): WizardStep[] {
  const base: WizardStep[] = ["team", "adoption", "priorities"];
  const chosenConfigs: WizardStep[] = ["throughput", "retention", "upskilling"].filter(
    (k) => selected.includes(k as PriorityKey)
  ) as WizardStep[];
  return [...base, ...chosenConfigs, "results"];
}
