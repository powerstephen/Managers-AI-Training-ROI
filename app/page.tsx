"use client";

import { useMemo, useState } from "react";

/* =========================
   Types & constants
   ========================= */
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

/* =========================
   Page
   ========================= */
export default function Page() {
  const [step, setStep] = useState(1);
  const next = () => setStep((s) => Math.min(7, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const reset = () => window.location.reload();

  /* Step 1: Team + program cost assumptions */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState(850);
  const [programMonths, setProgramMonths] = useState(3);

  /* Step 2: AI Maturity */
  const [maturity, setMaturity] = useState(5);

  /* Step 3: Priorities (pick top 3) */
  const keys: PriorityKey[] = [
    "throughput",
    "quality",
    "onboarding",
    "retention",
    "upskilling",
    "costAvoidance",
  ];
  const [selected, setSelected] = useState<PriorityKey[]>(
    keys.filter((k) => PRIORITY_META[k].defaultOn)
  );

  /* Step 4–6 config (Throughput, Retention, Upskilling) */
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);
  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(0.5);

  /* Derived calcs */
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

  /* Weekly hours by priority (conservative onboarding; filter later to selected) */
  const weeklyHours = useMemo(() => {
    // Onboarding (conservative, weekly)
    const turnoverRate = baselineAttritionPct / 100; // e.g., 12%
    const newHiresPerYear = Math.round(headcount * turnoverRate);
    const rampHoursSavedPerHire = 20; // tweakable baseline
    const onboardingHoursAnnualRaw = newHiresPerYear * rampHoursSavedPerHire;
    const onboardingWeeklyRaw = onboardingHoursAnnualRaw / 52;
    // Cap to avoid runaway: ~120 hours/person/year => weekly cap:
    const onboardingWeeklyCap = (headcount * 120) / 52;
    const onboardingWeekly = Math.min(onboardingWeeklyRaw, onboardingWeeklyCap);

    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(
            baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100)
          )
        : 0,
      quality: selected.includes("quality")
        ? Math.round(baseWeeklyTeamHours * 0.15)
        : 0,
      onboarding: selected.includes("onboarding") ? Math.round(onboardingWeekly) : 0,
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

  const symbol = CURRENCY_SYMBOL[currency];

  /* Filtered breakdown (only what the user selected) */
  const allBreakdown = useMemo(
    () => [
      {
        key: "throughput" as PriorityKey,
        label: PRIORITY_META.throughput.label,
        blurb: PRIORITY_META.throughput.blurb,
        hours: weeklyHours.throughput,
        valueWeekly: weeklyHours.throughput * hourlyCost,
      },
      {
        key: "quality" as PriorityKey,
        label: PRIORITY_META.quality.label,
        blurb: PRIORITY_META.quality.blurb,
        hours: weeklyHours.quality,
        valueWeekly: weeklyHours.quality * hourlyCost,
      },
      {
        key: "onboarding" as PriorityKey,
        label: PRIORITY_META.onboarding.label,
        blurb: PRIORITY_META.onboarding.blurb,
        hours: weeklyHours.onboarding,
        valueWeekly: weeklyHours.onboarding * hourlyCost,
      },
      {
        key: "retention" as PriorityKey,
        label: PRIORITY_META.retention.label,
        blurb: PRIORITY_META.retention.blurb,
        hours: weeklyHours.retention,
        valueWeekly: weeklyHours.retention * hourlyCost,
      },
      {
        key: "upskilling" as PriorityKey,
        label: PRIORITY_META.upskilling.label,
        blurb: PRIORITY_META.upskilling.blurb,
        hours: weeklyHours.upskilling,
        valueWeekly: weeklyHours.upskilling * hourlyCost,
      },
      {
        key: "costAvoidance" as PriorityKey,
        label: PRIORITY_META.costAvoidance.label,
        blurb: PRIORITY_META.costAvoidance.blurb,
        hours: weeklyHours.costAvoidance,
        valueWeekly: weeklyHours.costAvoidance * hourlyCost,
      },
    ],
    [weeklyHours, hourlyCost]
  );

  const breakdown = useMemo(
    () => allBreakdown.filter((r) => selected.includes(r.key)),
    [allBreakdown, selected]
  );

  /* Totals & ROI math (based on selected only) */
  const weeklyTotal = useMemo(
    () => breakdown.reduce((s, r) => s + (r.hours || 0), 0),
    [breakdown]
  );
  const monthlyValue = useMemo(() => weeklyTotal * hourlyCost * 4, [weeklyTotal, hourlyCost]);
  const programCost = useMemo(() => headcount * trainingPerEmployee, [headcount, trainingPerEmployee]);
  const annualValue = useMemo(() => monthlyValue * 12, [monthlyValue]);
  const annualROI = useMemo(() => (programCost === 0 ? 0 : annualValue / programCost), [annualValue, programCost]);
  const paybackMonths = useMemo(
    () => (monthlyValue === 0 ? Infinity : programCost / monthlyValue),
    [programCost, monthlyValue]
  );

  /* UI labels / steps */
  const steps = [
    { id: 1, label: "Team" },
    { id: 2, label: "AI Maturity" },
    { id: 3, label: "Top 3 Priorities" }, // ← renamed
    { id: 4, label: "Throughput" },
    { id: 5, label: "Retention" },
    { id: 6, label: "Upskilling" },
    { id: 7, label: "Results" },
  ];

  /* Helpers */
  const togglePriority = (k: PriorityKey) => {
    const present = selected.includes(k);
    if (present) {
      setSelected(selected.filter((x) => x !== k));
    } else {
      // keep max 3 selected
      if (selected.length >= 3) return;
      setSelected([...selected, k]);
    }
  };

  const fmtMoney = (v: number) =>
    `${symbol}${Math.round(v).toLocaleString()}`;

  /* =========================
     Render
     ========================= */
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text)" }}>
      {/* HERO — same width as content, no zoom */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img
          src="/hero.png"
          alt="AI at Work — Brainster"
          className="hero-img shadow-soft"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {/* Progress */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="panel flex gap-4 flex-wrap">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className={`step-chip ${step >= s.id ? "step-chip--on" : "step-chip--off"}`}>
                {s.id}
              </span>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
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
                  <select
                    className="inp"
                    value={dept}
                    onChange={(e) => setDept(e.target.value as Dept)}
                  >
                    {[
                      "Company-wide",
                      "Marketing",
                      "Sales",
                      "Customer Support",
                      "Operations",
                      "Engineering",
                      "HR",
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
                    onChange={(e) =>
                      setHeadcount(parseInt(e.target.value || "0", 10))
                    }
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
                    onChange={(e) =>
                      setAvgSalary(parseInt(e.target.value || "0", 10))
                    }
                  />
                </div>
                <div className="card">
                  <label className="lbl">Training per employee ({symbol})</label>
                  <input
                    className="inp"
                    type="number"
                    value={trainingPerEmployee}
                    onChange={(e) =>
                      setTrainingPerEmployee(parseInt(e.target.value || "0", 10))
                    }
                  />
                </div>
                <div className="card">
                  <label className="lbl">Program duration (months)</label>
                  <input
                    className="inp"
                    type="number"
                    value={programMonths}
                    onChange={(e) =>
                      setProgramMonths(parseInt(e.target.value || "0", 10))
                    }
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

          {/* STEP 2: AI Maturity */}
          {step === 2 && (
            <div>
              <h2 className="title">AI Maturity</h2>
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
                  <div className="mt-3 text-xs muted">
                    Refine via priorities and training below.
                  </div>
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

          {/* STEP 3: Top 3 Priorities (no inputs here) */}
          {step === 3 && (
            <div>
              <h2 className="title">Top 3 Priorities</h2>
              <p className="muted mb-4">
                Pick up to three areas to focus. Inputs for each priority come in the following steps.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {keys.map((k) => {
                  const active = selected.includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => togglePriority(k)}
                      className={`card text-left transition ${
                        active ? "card--active" : "card--ghost"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="font-semibold">{PRIORITY_META[k].label}</div>
                      <div className="text-sm mt-1 muted">{PRIORITY_META[k].blurb}</div>
                      <div className="mt-3">
                        {active ? (
                          <span className="pill pill--active">Selected</span>
                        ) : (
                          <span className="pill">Tap to select</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={next} disabled={selected.length === 0}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Throughput config */}
          {step === 4 && (
            <div>
              <h2 className="title">Throughput</h2>
              <p className="muted mb-4">
                Estimate weekly hours reclaimed by improving cycle time and reducing handoffs.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Time reclaimed %</label>
                  <input
                    className="inp"
                    type="number"
                    value={throughputPct}
                    onChange={(e) => setThroughputPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <label className="lbl">Handoffs reduced %</label>
                  <input
                    className="inp"
                    type="number"
                    value={handoffPct}
                    onChange={(e) => setHandoffPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={next}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Retention config */}
          {step === 5 && (
            <div>
              <h2 className="title">Retention</h2>
              <p className="muted mb-4">
                Estimate fewer regretted exits thanks to better tooling and enablement.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Baseline attrition % (annual)</label>
                  <input
                    className="inp"
                    type="number"
                    value={baselineAttritionPct}
                    onChange={(e) =>
                      setBaselineAttritionPct(parseInt(e.target.value || "0", 10))
                    }
                  />
                </div>
                <div className="card">
                  <label className="lbl">Expected improvement %</label>
                  <input
                    className="inp"
                    type="number"
                    value={retentionLiftPct}
                    onChange={(e) =>
                      setRetentionLiftPct(parseInt(e.target.value || "0", 10))
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={next}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Upskilling config */}
          {step === 6 && (
            <div>
              <h2 className="title">Upskilling</h2>
              <p className="muted mb-4">
                Estimate weekly hours saved by improving competency coverage.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card">
                  <label className="lbl">Coverage % (employees using AI effectively)</label>
                  <input
                    className="inp"
                    type="number"
                    value={upskillCoveragePct}
                    onChange={(e) =>
                      setUpskillCoveragePct(parseInt(e.target.value || "0", 10))
                    }
                  />
                </div>
                <div className="card">
                  <label className="lbl">Hours saved per covered employee (weekly)</label>
                  <input
                    className="inp"
                    type="number"
                    step="0.1"
                    value={upskillHoursPerWeek}
                    onChange={(e) =>
                      setUpskillHoursPerWeek(parseFloat(e.target.value || "0"))
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={next}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Results */}
          {step === 7 && (
            <div>
              <h2 className="title">Results</h2>

              {/* KPIs */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="kpi">
                  <div className="label">Total annual value</div>
                  <div className="value">{fmtMoney(annualValue)}</div>
                </div>
                <div className="kpi">
                  <div className="label">Annual ROI</div>
                  <div className="value">
                    {annualROI.toFixed(1)}
                    ×
                  </div>
                </div>
                <div className="kpi">
                  <div className="label">Payback</div>
                  <div className="value">
                    {paybackMonths === Infinity ? "—" : `${paybackMonths.toFixed(1)} mo`}
                  </div>
                </div>
                <div className="kpi">
                  <div className="label">Total hours saved (est.)</div>
                  <div className="value">{(weeklyTotal * 52).toLocaleString()}</div>
                </div>
              </div>

              {/* Breakdown table: only selected priorities */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">Productivity Impact Breakdown</div>
                  <div className="muted text-sm">Estimated weekly hours saved by selected areas.</div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 muted" style={{ fontWeight: 600 }}>
                  <div className="col-span-4">Priority</div>
                  <div className="col-span-4">Why it matters</div>
                  <div className="col-span-2 text-right">Hours / wk</div>
                  <div className="col-span-2 text-right">Value / wk</div>
                </div>

                {breakdown.map((r) => (
                  <div key={r.key} className="grid grid-cols-12 items-start py-3 px-3 border-t border-[var(--hairline)]">
                    <div className="col-span-4 font-semibold">{r.label}</div>
                    <div className="col-span-4 text-sm muted">{r.blurb}</div>
                    <div className="col-span-2 text-right">{r.hours.toLocaleString()}</div>
                    <div className="col-span-2 text-right">{fmtMoney(r.valueWeekly)}</div>
                  </div>
                ))}

                <div className="grid grid-cols-12 items-start py-3 px-3 border-t border-[var(--hairline)] font-semibold">
                  <div className="col-span-8 text-right">Total</div>
                  <div className="col-span-2 text-right">
                    {weeklyTotal.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right">
                    {fmtMoney(weeklyTotal * hourlyCost)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <div className="flex gap-3">
                  <button className="btn" onClick={reset}>
                    Start over
                  </button>
                  <button className="btn-outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    Share / Print
                  </button>
                </div>
              </div>

              {/* Summary notes */}
              <div className="mt-6 panel">
                <div className="font-semibold mb-2">Summary & next steps</div>
                <ul className="list-disc pl-6 text-sm leading-relaxed">
                  <li>
                    Focus areas:{" "}
                    <strong>
                      {breakdown.map((b) => b.label).join(", ") || "—"}
                    </strong>
                    .
                  </li>
                  <li>
                    Estimated weekly savings: <strong>{weeklyTotal.toLocaleString()} hours</strong> (
                    {fmtMoney(weeklyTotal * hourlyCost)} / wk).
                  </li>
                  <li>
                    Annual ROI: <strong>{annualROI.toFixed(1)}×</strong>; payback in{" "}
                    <strong>{paybackMonths === Infinity ? "—" : `${paybackMonths.toFixed(1)} mo`}</strong>.
                  </li>
                  <li>
                    Tip: Map top workflows for each priority; ship prompt templates and QA guardrails; track usage against KPIs.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
