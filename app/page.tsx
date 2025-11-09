"use client";

import { useMemo, useState } from "react";

/* ──────────────────────────────────────────────────────────────────
   Types & constants
   ────────────────────────────────────────────────────────────────── */
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

type PriorityKey = "throughput" | "quality" | "onboarding" | "retention" | "upskilling" | "costAvoidance";

const PRIORITY_META: Record<
  PriorityKey,
  { label: string; blurb: string; defaultOn?: boolean }
> = {
  throughput: { label: "Throughput", blurb: "Ship faster; reduce cycle time and waiting time.", defaultOn: true },
  quality: { label: "Quality", blurb: "Fewer reworks; better first-pass yield.", defaultOn: true },
  onboarding: { label: "Onboarding", blurb: "Ramp new hires faster with AI assist.", defaultOn: true },
  retention: { label: "Retention", blurb: "Reduce regretted attrition via better tooling." },
  upskilling: { label: "Upskilling", blurb: "Grow competency coverage; unlock compounding gains." },
  costAvoidance: { label: "Cost avoidance", blurb: "Avoid outside spend/overtime via automation." },
};

/* AI Adoption mapping (hrs saved / person / week) */
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

/* Wizard steps */
type WizardStep =
  | "team"
  | "adoption"
  | "priorities"
  | "throughput"
  | "retention"
  | "upskilling"
  | "results";

const ALL_CONFIG_STEPS: WizardStep[] = ["throughput", "retention", "upskilling"];

/* Presets (Low / Average / High) that modify the inputs on each config step */
type Intensity = "low" | "avg" | "high";

/* Throughput presets */
const THROUGHPUT_PRESETS: Record<Intensity, { throughputPct: number; handoffPct: number }> = {
  low: { throughputPct: 6, handoffPct: 4 },
  avg: { throughputPct: 10, handoffPct: 6 },
  high: { throughputPct: 14, handoffPct: 9 },
};

/* Retention presets */
const RETENTION_PRESETS: Record<Intensity, { retentionLiftPct: number; baselineAttritionPct: number }> = {
  low: { retentionLiftPct: 1, baselineAttritionPct: 10 },
  avg: { retentionLiftPct: 2, baselineAttritionPct: 12 },
  high: { retentionLiftPct: 3, baselineAttritionPct: 15 },
};

/* Upskilling presets */
const UPSKILL_PRESETS: Record<Intensity, { coveragePct: number; hoursPerWeek: number }> = {
  low: { coveragePct: 40, hoursPerWeek: 0.3 },
  avg: { coveragePct: 60, hoursPerWeek: 0.5 },
  high: { coveragePct: 75, hoursPerWeek: 0.8 },
};

/* Helper: compute config step order from the selected priorities */
function getConfigOrder(selected: PriorityKey[]): WizardStep[] {
  const order: WizardStep[] = [];
  if (selected.includes("throughput")) order.push("throughput");
  if (selected.includes("retention")) order.push("retention");
  if (selected.includes("upskilling")) order.push("upskilling");
  return order;
}

/* ──────────────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────────────── */
export default function Page() {
  /* Wizard navigation */
  const [step, setStep] = useState<WizardStep>("team");
  const go = (s: WizardStep) => setStep(s);

  const reset = () => {
    // Simple reset
    window.location.reload();
  };

  /* Step 1: Team / costs */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);

  // Price per seat, tiered by headcount (USD base), then display-only currency symbol.
  const tierPriceUSD = useMemo(() => {
    if (headcount >= 1000) return 299;
    if (headcount >= 100) return 349;
    return 399; // 5–99
  }, [headcount]);

  // Simple currency conversion (you can refine later if you want live FX)
  const FX: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.78, AUD: 1.55 };
  const seatPrice = useMemo(() => Math.round(tierPriceUSD * FX[currency]), [tierPriceUSD, currency]);

  /* Step 2: AI Adoption (1–10) */
  const [maturity, setMaturity] = useState(5);

  /* Step 3: Priorities (choose up to 3) */
  const keys: PriorityKey[] = [
    "throughput",
    "quality",
    "onboarding",
    "retention",
    "upskilling",
    "costAvoidance",
  ];
  const [selected, setSelected] = useState<PriorityKey[]>(
    keys.filter((k) => PRIORITY_META[k].defaultOn) // starts with 3
  );

  /* Priority Configs — inputs + intensity states */
  // Throughput
  const [throughputPct, setThroughputPct] = useState(10);
  const [handoffPct, setHandoffPct] = useState(6);
  const [throughputIntensity, setThroughputIntensity] = useState<Intensity>("avg");

  // Retention
  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);
  const [retentionIntensity, setRetentionIntensity] = useState<Intensity>("avg");

  // Upskilling
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(0.5);
  const [upskillIntensity, setUpskillIntensity] = useState<Intensity>("avg");

  /* Derived / shared calc pieces */
  const symbol = CURRENCY_SYMBOL[currency];
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);

  const adoptionHrsPerPerson = useMemo(() => maturityToHours(maturity), [maturity]);
  const teamAdoptionHours = useMemo(
    () => Math.round(adoptionHrsPerPerson * headcount),
    [adoptionHrsPerPerson, headcount]
  );
  const baseWeeklyTeamHours = useMemo(
    () => adoptionHrsPerPerson * headcount,
    [adoptionHrsPerPerson, headcount]
  );

  /* Weekly hours contribution per priority (only include if selected) */
  const weeklyHours = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100))
        : 0,
      quality: selected.includes("quality") ? Math.round(baseWeeklyTeamHours * 0.2) : 0,
      onboarding: selected.includes("onboarding")
        ? Math.round((/* cap 2 wks */ 2 * 40) * (headcount * 0.15)) // toned down from earlier (was too large)
        : 0,
      retention: selected.includes("retention")
        ? Math.round(((headcount * (baselineAttritionPct / 100)) * (retentionLiftPct / 100) * 80) / 52) // softened
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * upskillHoursPerWeek)
        : 0,
      costAvoidance: selected.includes("costAvoidance")
        ? Math.round(baseWeeklyTeamHours * 0.06)
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
  ]);

  const weeklyTotal = useMemo(() => Object.values(weeklyHours).reduce((a, b) => a + b, 0), [weeklyHours]);
  const monthlyValue = useMemo(() => weeklyTotal * hourlyCost * 4, [weeklyTotal, hourlyCost]);
  const programCost = useMemo(() => headcount * seatPrice, [headcount, seatPrice]); // per-seat pricing
  const annualValue = useMemo(() => monthlyValue * 12, [monthlyValue]);
  const annualROI = useMemo(() => (programCost === 0 ? 0 : annualValue / programCost), [annualValue, programCost]);
  const paybackMonths = useMemo(
    () => (monthlyValue === 0 ? Infinity : programCost / monthlyValue),
    [programCost, monthlyValue]
  );

  /* Progress model */
  const steps: { id: WizardStep; label: string }[] = [
    { id: "team", label: "Team" },
    { id: "adoption", label: "AI Adoption" },
    { id: "priorities", label: "Team Priorities" },
    { id: "throughput", label: "Throughput" },
    { id: "retention", label: "Retention" },
    { id: "upskilling", label: "Upskilling" },
    { id: "results", label: "Results" },
  ];

  const stepIndex = steps.findIndex((s) => s.id === step);

  /* Next/back logic with dynamic config sequence */
  const configOrder = getConfigOrder(selected);

  const next = () => {
    if (step === "priorities") {
      // Enforce exactly 3 priorities before continuing
      if (selected.length !== 3) return;
      const first = configOrder[0];
      setStep(first ?? "results");
      return;
    }

    if (ALL_CONFIG_STEPS.includes(step)) {
      const idx = configOrder.indexOf(step);
      const nextCfg = configOrder[idx + 1];
      setStep(nextCfg ?? "results");
      return;
    }

    // ordinary linear flow before priorities
    if (step === "team") return setStep("adoption");
    if (step === "adoption") return setStep("priorities");
    if (step === "results") return;
  };

  const back = () => {
    if (step === "results") {
      // jump to last chosen config if any, else priorities
      const last = configOrder[configOrder.length - 1];
      setStep(last ?? "priorities");
      return;
    }

    if (ALL_CONFIG_STEPS.includes(step)) {
      const idx = configOrder.indexOf(step);
      if (idx <= 0) return setStep("priorities");
      setStep(configOrder[idx - 1]);
      return;
    }

    if (step === "priorities") return setStep("adoption");
    if (step === "adoption") return setStep("team");
  };

  /* UI helpers */
  const StepChip = ({ active, n }: { active: boolean; n: number }) => (
    <span className={`step-chip ${active ? "step-chip--on" : "step-chip--off"}`}>{n}</span>
  );

  const Adjuster = ({
    value,
    onChange,
    labels = ["Low", "Average", "High"],
    subs = ["Conservative", "Typical", "Aggressive"],
  }: {
    value: Intensity;
    onChange: (v: Intensity) => void;
    labels?: [string, string, string] | string[];
    subs?: [string, string, string] | string[];
  }) => {
    const options: Intensity[] = ["low", "avg", "high"];
    return (
      <div className="flex gap-3 mt-4 flex-wrap">
        {options.map((opt, i) => {
          const isOn = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`adjuster ${isOn ? "adjuster--on" : ""}`}
              type="button"
              aria-pressed={isOn}
            >
              <div className="font-semibold">{labels[i] ?? opt}</div>
              <div className="text-xs muted mt-0.5">({subs[i] ?? ""})</div>
            </button>
          );
        })}
      </div>
    );
  };

  /* Apply presets when intensity changes */
  const applyThroughputPreset = (mode: Intensity) => {
    const p = THROUGHPUT_PRESETS[mode];
    setThroughputPct(p.throughputPct);
    setHandoffPct(p.handoffPct);
    setThroughputIntensity(mode);
  };

  const applyRetentionPreset = (mode: Intensity) => {
    const p = RETENTION_PRESETS[mode];
    setRetentionLiftPct(p.retentionLiftPct);
    setBaselineAttritionPct(p.baselineAttritionPct);
    setRetentionIntensity(mode);
  };

  const applyUpskillPreset = (mode: Intensity) => {
    const p = UPSKILL_PRESETS[mode];
    setUpskillCoveragePct(p.coveragePct);
    setUpskillHoursPerWeek(p.hoursPerWeek);
    setUpskillIntensity(mode);
  };

  /* Adoption slider fill % */
  const adoptionFill = ((maturity - 1) / 9) * 100;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text)" }}>
      {/* HERO (same width as content) */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img src="/hero.png" alt="AI at Work — Brainster" className="hero-img shadow-soft" />
      </div>

      {/* Progress */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="panel flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-4 flex-wrap">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2">
                <StepChip active={idx <= stepIndex} n={idx + 1} />
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="text-sm muted">Step {stepIndex + 1} / {steps.length}</div>
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
                    {["Company-wide", "Marketing", "Sales", "Customer Support", "Operations", "Engineering", "HR"].map((d) => (
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
                        type="button"
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
                  <label className="lbl">Price per seat (auto) ({symbol})</label>
                  <div className="inp read-only">{symbol}{seatPrice.toLocaleString()}</div>
                  <p className="hint">Tiered by seat count: 5–99 = 399 USD, 100–999 = 349 USD, 1000+ = 299 USD (converted).</p>
                </div>
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
                  <label className="lbl">Total program cost ({symbol})</label>
                  <div className="inp read-only">{symbol}{(headcount * seatPrice).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back} type="button">
                  ← Back
                </button>
                <button className="btn" onClick={next} type="button">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: AI Adoption */}
          {step === "adoption" && (
            <div>
              <h2 className="title">AI Adoption</h2>
              <p className="muted text-sm mb-3">
                Pick where your team is today (1–10). The bar fills up to your selection.
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
                    style={{
                      background: `linear-gradient(to right, var(--azure) ${adoptionFill}%, var(--track) ${adoptionFill}%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2 font-semibold" style={{ color: "var(--text-dim)", fontSize: "15px" }}>
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
                      <div className="text-3xl font-extrabold">{adoptionHrsPerPerson.toFixed(1)}</div>
                    </div>
                    <div className="card">
                      <div className="text-xs muted">Team / week</div>
                      <div className="text-3xl font-extrabold">{teamAdoptionHours.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs muted">Refine via priorities and training below.</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back} type="button">
                  ← Back
                </button>
                <button className="btn" onClick={next} type="button">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Priorities (select up to 3) */}
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
                          type="button"
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
                <button className="btn-ghost" onClick={back} type="button">
                  ← Back
                </button>
                <button className="btn" onClick={next} disabled={selected.length !== 3} type="button">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Throughput */}
          {step === "throughput" && (
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

              {/* Adjuster */}
              <Adjuster
                value={throughputIntensity}
                onChange={(v) => applyThroughputPreset(v)}
                labels={["Low", "Average", "High"] as any}
                subs={["Conservative", "Typical", "Aggressive"] as any}
              />

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back} type="button">
                  ← Back
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    const idx = configOrder.indexOf("throughput");
                    const nextCfg = configOrder[idx + 1];
                    setStep(nextCfg ?? "results");
                  }}
                  type="button"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Retention */}
          {step === "retention" && (
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

              {/* Adjuster */}
              <Adjuster
                value={retentionIntensity}
                onChange={(v) => applyRetentionPreset(v)}
                labels={["Low", "Average", "High"] as any}
                subs={["Conservative", "Typical", "Aggressive"] as any}
              />

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back} type="button">
                  ← Back
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    const idx = configOrder.indexOf("retention");
                    const nextCfg = configOrder[idx + 1];
                    setStep(nextCfg ?? "results");
                  }}
                  type="button"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Upskilling */}
          {step === "upskilling" && (
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

              {/* Adjuster */}
              <Adjuster
                value={upskillIntensity}
                onChange={(v) => applyUpskillPreset(v)}
                labels={["Low", "Average", "High"] as any}
                subs={["Conservative", "Typical", "Aggressive"] as any}
              />

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back} type="button">
                  ← Back
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    const idx = configOrder.indexOf("upskilling");
                    const nextCfg = configOrder[idx + 1];
                    setStep(nextCfg ?? "results");
                  }}
                  type="button"
                >
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

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back} type="button">
                  ← Back
                </button>
                <button className="btn" onClick={reset} type="button">
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
