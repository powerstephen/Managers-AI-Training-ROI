"use client";

import { useMemo, useState } from "react";

/* -----------------------------
   Types & constants
------------------------------*/
type Currency = "EUR" | "USD" | "GBP" | "AUD";
const CURRENCY_SYMBOL: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  AUD: "A$",
};

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

/** Priorities user can *configure* on steps 4–6 (order matters).  */
const CONFIGURABLE: PriorityKey[] = ["throughput", "retention", "upskilling"];

const PRIORITY_META: Record<
  PriorityKey,
  { label: string; blurb: string; defaultOn?: boolean }
> = {
  throughput: {
    label: "Throughput",
    blurb: "Ship faster; reduce cycle time and waiting time.",
    defaultOn: true,
  },
  quality: {
    label: "Quality",
    blurb: "Fewer reworks; better first-pass yield.",
    defaultOn: true,
  },
  onboarding: {
    label: "Onboarding",
    blurb: "Ramp new hires faster with AI assist.",
    defaultOn: true,
  },
  retention: {
    label: "Retention",
    blurb: "Reduce regretted attrition via better tooling.",
  },
  upskilling: {
    label: "Upskilling",
    blurb: "Grow competency coverage; unlock compounding gains.",
  },
  costAvoidance: {
    label: "Cost avoidance",
    blurb: "Avoid outside spend/overtime via automation.",
  },
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
  "Embedded: >80% coverage; evals/guardrails; continuous improvement.",
];

/* -----------------------------
   Component
------------------------------*/
export default function Page() {
  const [step, setStep] = useState(1);
  const next = () => setStep((s) => Math.min(7, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const reset = () => window.location.reload();

  /* Step 1 */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState(850);
  const [programMonths, setProgramMonths] = useState(3);

  /* Step 2 (AI Adoption / Maturity) */
  const [maturity, setMaturity] = useState(5);

  /* Step 3 (priorities) */
  const ALL_KEYS: PriorityKey[] = [
    "throughput",
    "quality",
    "onboarding",
    "retention",
    "upskilling",
    "costAvoidance",
  ];
  const [selected, setSelected] = useState<PriorityKey[]>(
    ALL_KEYS.filter((k) => PRIORITY_META[k].defaultOn).slice(0, 3)
  );

  /* Step 4–6 config values */
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);

  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);

  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(0.5);

  /* -----------------------------
     Calculations
  ------------------------------*/
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const maturityHoursPerPerson = useMemo(
    () => maturityToHours(maturity),
    [maturity]
  );
  const maturityHoursTeam = useMemo(
    () => Math.round(maturityHoursPerPerson * headcount),
    [maturityHoursPerPerson, headcount]
  );
  const baseWeeklyTeamHours = useMemo(
    () => maturityHoursPerPerson * headcount,
    [maturityHoursPerPerson, headcount]
  );

  const weeklyHours = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(
            baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100)
          )
        : 0,

      quality: selected.includes("quality")
        ? Math.round(baseWeeklyTeamHours * 0.2)
        : 0,

      // Onboarding (toned down – previously too large):
      // Assume 4 weeks of ramp reduction * 10 h/week per new hire * 15% new hires of headcount per year,
      // spread over 52 weeks => weekly equivalent.
      onboarding: selected.includes("onboarding")
        ? Math.round(((4 * 10) * (headcount * 0.15)) / 52)
        : 0,

      retention: selected.includes("retention")
        ? Math.round(
            ((headcount * (baselineAttritionPct / 100)) *
              (retentionLiftPct / 100) *
              120) /
              52
          )
        : 0,

      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * upskillHoursPerWeek)
        : 0,

      costAvoidance: selected.includes("costAvoidance")
        ? Math.round(baseWeeklyTeamHours * 0.1)
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

  const weeklyTotal = useMemo(
    () => Object.values(weeklyHours).reduce((a, b) => a + b, 0),
    [weeklyHours]
  );
  const monthlyValue = useMemo(
    () => weeklyTotal * hourlyCost * 4,
    [weeklyTotal, hourlyCost]
  );
  const programCost = useMemo(
    () => headcount * trainingPerEmployee,
    [headcount, trainingPerEmployee]
  );
  const annualValue = useMemo(() => monthlyValue * 12, [monthlyValue]);
  const annualROI = useMemo(
    () => (programCost === 0 ? 0 : annualValue / programCost),
    [annualValue, programCost]
  );
  const paybackMonths = useMemo(
    () => (monthlyValue === 0 ? Infinity : programCost / monthlyValue),
    [programCost, monthlyValue]
  );

  const symbol = CURRENCY_SYMBOL[currency];

  /* -----------------------------
     Step helpers
  ------------------------------*/
  /** From the current config step (4–6), jump to the next *selected* config step or to Results (7). */
  const goToNextSelectedConfig = (currentStep: number) => {
    const order: Record<number, PriorityKey> = {
      4: "throughput",
      5: "retention",
      6: "upskilling",
    };
    const remaining: { step: number; key: PriorityKey }[] = [
      { step: 5, key: "retention" },
      { step: 6, key: "upskilling" },
    ].filter((x) => (currentStep < x.step ? selected.includes(x.key) : false));

    // If current step is 4 and 4 wasn't actually selected, we should still skip forward.
    if (currentStep === 4 && !selected.includes("throughput")) {
      if (selected.includes("retention")) return setStep(5);
      if (selected.includes("upskilling")) return setStep(6);
      return setStep(7);
    }

    // Generic: find the next selected config step ahead; else go to results
    for (const r of remaining) {
      if (selected.includes(r.key)) {
        setStep(r.step);
        return;
      }
    }
    setStep(7);
  };

  /** From priorities step (3), decide where to go next based on selections. */
  const goFromPriorities = () => {
    // Use typed CONFIGURABLE list to avoid the TS error you hit.
    const future = CONFIGURABLE.filter((k) => selected.includes(k));
    if (future.length === 0) {
      setStep(7);
      return;
    }
    // First selected config step in fixed order
    if (selected.includes("throughput")) return setStep(4);
    if (selected.includes("retention")) return setStep(5);
    if (selected.includes("upskilling")) return setStep(6);
    setStep(7);
  };

  const steps = [
    { id: 1, label: "Team" },
    { id: 2, label: "AI Adoption" },
    { id: 3, label: "Team Priorities" },
    { id: 4, label: "Throughput" },
    { id: 5, label: "Retention" },
    { id: 6, label: "Upskilling" },
    { id: 7, label: "Results" },
  ];

  /* -----------------------------
     Render
  ------------------------------*/
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text)" }}>
      {/* HERO — same width as content, no zoom */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img src="/hero.png" alt="AI at Work — Brainster" className="hero-img shadow-soft" />
      </div>

      {/* Progress */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="panel flex gap-4 flex-wrap justify-between">
          <div className="flex gap-4 flex-wrap">
            {steps
              .filter((s) => {
                // Hide config steps that aren't selected
                if (s.id === 4 && !selected.includes("throughput")) return false;
                if (s.id === 5 && !selected.includes("retention")) return false;
                if (s.id === 6 && !selected.includes("upskilling")) return false;
                return true;
              })
              .map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className={`step-chip ${step >= s.id ? "step-chip--on" : "step-chip--off"}`}>{s.id}</span>
                  <span className="step-label">{s.label}</span>
                </div>
              ))}
          </div>
          {/* spacer to push to edges */}
          <div />
        </div>
      </div>

      {/* Main */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4 pb-16">
        <div className="panel">
          {/* STEP 1: Team */}
          {step === 1 && (
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
                  <label className="lbl">
                    Average annual salary ({symbol})
                  </label>
                  <input
                    className="inp"
                    type="number"
                    value={avgSalary}
                    onChange={(e) => setAvgSalary(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <label className="lbl">
                    Training per employee ({symbol})
                  </label>
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
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={next}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AI Adoption */}
          {step === 2 && (
            <div>
              <h2 className="title">AI Adoption</h2>
              <p className="muted text-sm mb-3">
                Benchmark your current usage. Higher adoption usually correlates with more time reclaimed and better outcomes.
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
                      <div className="text-3xl font-extrabold">{maturityToHours(maturity).toFixed(1)}</div>
                    </div>
                    <div className="card">
                      <div className="text-xs muted">Team / week</div>
                      <div className="text-3xl font-extrabold">{maturityHoursTeam.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs muted">Refine via priorities and training below.</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={next}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Team Priorities */}
          {step === 3 && (
            <div>
              <h2 className="title">Team Priorities</h2>
              <p className="muted text-sm mb-4">Choose up to three areas to focus your ROI model.</p>

              <div className="grid md:grid-cols-3 gap-3">
                {ALL_KEYS.map((k) => {
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
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>

                {/* FIXED: typed future list (no 'string' vs 'PriorityKey' error) */}
                <button
                  className="btn"
                  onClick={() => {
                    const future = CONFIGURABLE.filter((k) => selected.includes(k));
                    if (future.length === 0) {
                      setStep(7); // straight to results
                    } else {
                      // go to the first selected config step
                      if (selected.includes("throughput")) setStep(4);
                      else if (selected.includes("retention")) setStep(5);
                      else if (selected.includes("upskilling")) setStep(6);
                      else setStep(7);
                    }
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Throughput (skip if not selected) */}
          {step === 4 && selected.includes("throughput") && (
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

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={() => goToNextSelectedConfig(4)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Retention (skip if not selected) */}
          {step === 5 && selected.includes("retention") && (
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

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={() => goToNextSelectedConfig(5)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Upskilling (skip if not selected) */}
          {step === 6 && selected.includes("upskilling") && (
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

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={() => goToNextSelectedConfig(6)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Results */}
          {step === 7 && (
            <div>
              <h2 className="title">Results</h2>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="kpi">
                  <div className="kpi__label">Total annual value</div>
                  <div className="kpi__value">
                    {symbol}
                    {Math.round(annualValue).toLocaleString()}
                  </div>
                </div>
                <div className="kpi">
                  <div className="kpi__label">Annual ROI</div>
                  <div className="kpi__value">{annualROI.toFixed(1)}×</div>
                </div>
                <div className="kpi">
                  <div className="kpi__label">Payback</div>
                  <div className="kpi__value">{isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : "—"}</div>
                </div>
                <div className="kpi">
                  <div className="kpi__label">Total hours saved (est.)</div>
                  <div className="kpi__value">{(weeklyTotal * 52).toLocaleString()}</div>
                </div>
              </div>

              <div
                className="mt-6 rounded-2xl overflow-hidden border"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="grid grid-cols-[1fr_180px_200px] py-3 px-4 text-xs font-semibold"
                  style={{ color: "var(--text-dim)", background: "#101317" }}
                >
                  <div>PRIORITY</div>
                  <div className="text-right">HOURS SAVED</div>
                  <div className="text-right">ANNUAL VALUE</div>
                </div>

                {ALL_KEYS.filter((k) => selected.includes(k)).map((k) => {
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
                <button className="btn-ghost" onClick={back}>
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
