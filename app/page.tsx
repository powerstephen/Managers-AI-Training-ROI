"use client";

import { useMemo, useState } from "react";

/* ───────────────────────── Types / helpers ───────────────────────── */

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

const PRIORITY_META: Record<
  PriorityKey,
  { label: string; blurb: string; defaultOn?: boolean }
> = {
  throughput: {
    label: "Throughput",
    blurb: "Ship faster; reduce cycle time and waiting time in workflows.",
    defaultOn: true,
  },
  quality: {
    label: "Quality",
    blurb: "Fewer reworks; better first-pass yield and accuracy.",
    defaultOn: true,
  },
  onboarding: {
    label: "Onboarding",
    blurb: "Ramp new hires quicker with AI guidance and templates.",
    defaultOn: true,
  },
  retention: {
    label: "Retention",
    blurb: "Reduce regretted attrition via better tooling + less drudgery.",
  },
  upskilling: {
    label: "Upskilling",
    blurb: "Grow competency coverage; unlock compounding gains.",
  },
  costAvoidance: {
    label: "Cost avoidance",
    blurb: "Avoid outside spend / overtime by automating repetitive work.",
  },
};

// 1–10 → weekly hours saved per person (baseline)
const maturityToHours = (level: number) => {
  const clamped = Math.min(10, Math.max(1, level));
  const table = [5, 4.5, 4, 3.5, 3, 2.6, 2.2, 1.8, 1.4, 1];
  return table[clamped - 1];
};

const maturityExplainer = (level: number) => {
  const copy = [
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
  const idx = Math.min(10, Math.max(1, level)) - 1;
  return copy[idx];
};

/* ───────────────────────────── Page ───────────────────────────── */

export default function Page() {
  /* Steps */
  const [step, setStep] = useState(1);
  const goNext = () => setStep((s) => Math.min(7, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));
  const startOver = () => window.location.reload();

  /* Step 1 – Basics */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState<number>(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState<number>(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [programMonths, setProgramMonths] = useState<number>(3);

  /* Step 2 – AI Maturity */
  const [maturity, setMaturity] = useState<number>(5);

  /* Step 3 – Priorities */
  const allPriorityKeys: PriorityKey[] = [
    "throughput",
    "quality",
    "onboarding",
    "retention",
    "upskilling",
    "costAvoidance",
  ];
  const [selected, setSelected] = useState<PriorityKey[]>(
    allPriorityKeys.filter((k) => PRIORITY_META[k].defaultOn)
  );

  /* Config that lives ONLY on steps 4–6 */
  // Throughput
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);
  // Retention
  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);
  // Upskilling
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(0.5);

  /* Calcs */
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

  const weeklyHoursByPriority = useMemo(() => {
    const entries: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100))
        : 0,
      quality: selected.includes("quality")
        ? Math.round(baseWeeklyTeamHours * 0.2)
        : 0,
      onboarding: selected.includes("onboarding")
        ? Math.round((Math.max(0, Math.min(52, 2)) * 40) * (headcount * 0.2))
        : 0,
      retention: selected.includes("retention")
        ? Math.round(
            ((headcount * (baselineAttritionPct / 100)) *
              (retentionLiftPct / 100) *
              120) / 52
          )
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * upskillHoursPerWeek)
        : 0,
      costAvoidance: selected.includes("costAvoidance")
        ? Math.round(baseWeeklyTeamHours * 0.1)
        : 0,
    };
    return entries;
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

  const weeklyHoursTotal = useMemo(
    () => Object.values(weeklyHoursByPriority).reduce((a, b) => a + b, 0),
    [weeklyHoursByPriority]
  );

  const monthlyValue = useMemo(
    () => weeklyHoursTotal * hourlyCost * 4,
    [weeklyHoursTotal, hourlyCost]
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

  const stepItems = [
    { id: 1, label: "Basics" },
    { id: 2, label: "AI Maturity" },
    { id: 3, label: "Pick top 3 priorities" },
    { id: 4, label: "Throughput" },
    { id: 5, label: "Retention" },
    { id: 6, label: "Upskilling" },
    { id: 7, label: "Results" },
  ];

  /* ───────────────────────────── Render ───────────────────────────── */

  return (
    <div className="min-h-screen bg-[#0b1022] text-white">
      {/* HERO: match content width (flush with boxes below), dark theme */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-4">
        <img
          src="/hero.png"
          alt="AI at Work — Brainster"
          className="block w-full h-[200px] md:h-[240px] lg:h-[260px] object-cover rounded-2xl"
        />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="rounded-2xl bg-[#121831] border border-[#1f2747] p-4 flex gap-4 flex-wrap">
          {stepItems.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                  step >= s.id ? "bg-[#4b6bff]" : "bg-[#2a3560]"
                }`}
              >
                {s.id}
              </span>
              <span className="text-sm font-medium text-white/90">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card frame */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4 pb-16">
        <div className="bg-[#121831] border border-[#1f2747] rounded-2xl shadow-soft p-6 md:p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-extrabold mb-4">Team</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
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

                <div>
                  <label className="lbl">Employees in scope</label>
                  <input
                    className="inp"
                    type="number"
                    value={headcount}
                    onChange={(e) => setHeadcount(parseInt(e.target.value || "0", 10))}
                  />
                </div>

                <div>
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

              {/* Program cost assumptions */}
              <h3 className="text-lg font-bold mt-8 mb-2">Program cost assumptions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
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
                <div>
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
                <div>
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
                <button className="btn--ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-extrabold mb-4">AI Maturity</h2>

              <div className="grid md:grid-cols-[1fr_320px] gap-6">
                <div>
                  <label className="lbl mb-2">Where are you today?</label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={maturity}
                    onChange={(e) => setMaturity(parseInt(e.target.value, 10))}
                    className="w-full range-xl"
                  />
                  <div className="flex justify-between text-[14px] mt-2 text-white/90 font-semibold">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>

                  <div className="mt-5 p-5 rounded-xl bg-[#0f1633] border border-[#243158]">
                    <div className="text-[15px] font-bold">
                      {maturity}.{" "}
                      {
                        [
                          "Early",
                          "Exploring",
                          "Emerging",
                          "Forming",
                          "Defined",
                          "Adopted",
                          "Integrated",
                          "Scaled",
                          "Optimized",
                          "Embedded",
                        ][maturity - 1]
                      }
                    </div>
                    <p className="text-[15px] mt-1 text-white/90">
                      {maturityExplainer(maturity)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#243158] bg-[#0f1633] p-4">
                  <div className="text-sm font-semibold text-white/70">
                    Estimated hours saved (per week)
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-xs text-white/60">Per person</div>
                      <div className="text-2xl font-extrabold">
                        {maturityHoursPerPerson.toFixed(1)} h
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60">Team</div>
                      <div className="text-2xl font-extrabold">
                        {maturityHoursTeam.toLocaleString()} h
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-white/60">
                    Based on maturity benchmark mapping. You can refine in the next step.
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn--ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-extrabold mb-2">Pick top 3 priorities</h2>
              <p className="text-sm text-white/70 mb-4">
                Choose up to three areas to focus your ROI model.
              </p>

              <div className="grid md:grid-cols-3 gap-3">
                {allPriorityKeys.map((k) => {
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
                        <span className="font-semibold">
                          {PRIORITY_META[k].label}
                        </span>
                        <button
                          onClick={() => {
                            if (active) {
                              setSelected(selected.filter((x) => x !== k));
                            } else if (!disabled) {
                              setSelected([...selected, k]);
                            }
                          }}
                          className={`tag ${active ? "" : "tag--ghost"}`}
                        >
                          {active ? "Selected" : "Select"}
                        </button>
                      </div>
                      <div className="text-sm text-white/70 mt-1">
                        {PRIORITY_META[k].blurb}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn--ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext} disabled={selected.length === 0}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-extrabold mb-2">Throughput</h2>
              <p className="text-sm text-white/70 mb-4">
                Quick edit of the assumptions for throughput impact.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
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
                <div>
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
                <button className="btn--ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-extrabold mb-2">Retention</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Attrition avoided %</label>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    max={30}
                    value={retentionLiftPct}
                    onChange={(e) =>
                      setRetentionLiftPct(parseInt(e.target.value || "0", 10))
                    }
                  />
                </div>
                <div>
                  <label className="lbl">Baseline attrition %</label>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    max={40}
                    value={baselineAttritionPct}
                    onChange={(e) =>
                      setBaselineAttritionPct(parseInt(e.target.value || "0", 10))
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn--ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <div>
              <h2 className="text-xl font-extrabold mb-2">Upskilling</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Coverage target %</label>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    max={100}
                    value={upskillCoveragePct}
                    onChange={(e) =>
                      setUpskillCoveragePct(parseInt(e.target.value || "0", 10))
                    }
                  />
                </div>
                <div>
                  <label className="lbl">Hours / week per person</label>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    step={0.1}
                    value={upskillHoursPerWeek}
                    onChange={(e) =>
                      setUpskillHoursPerWeek(parseFloat(e.target.value || "0"))
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn--ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn" onClick={goNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 7 */}
          {step === 7 && (
            <div>
              <h2 className="text-xl font-extrabold mb-4">Results</h2>

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
                  <div className="kpi__value">
                    {isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : "—"}
                  </div>
                </div>
                <div className="kpi">
                  <div className="kpi__label">Total hours saved (est.)</div>
                  <div className="kpi__value">
                    {(weeklyHoursTotal * 52).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-6 border border-[#243158] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_180px_200px] py-3 px-4 text-xs font-semibold text-white/70 bg-[#0f1633]">
                  <div>PRIORITY</div>
                  <div className="text-right">HOURS SAVED</div>
                  <div className="text-right">ANNUAL VALUE</div>
                </div>
                {allPriorityKeys
                  .filter((k) => selected.includes(k))
                  .map((k) => {
                    const hours = Math.round(weeklyHoursByPriority[k] * 52);
                    const value = hours * hourlyCost;
                    return (
                      <div
                        className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t border-[#1f2747]"
                        key={k}
                      >
                        <div>
                          <div className="font-bold">{PRIORITY_META[k].label}</div>
                          <div className="text-sm text-white/70">
                            {PRIORITY_META[k].blurb}
                          </div>
                        </div>
                        <div className="text-right font-semibold">
                          {hours.toLocaleString()} h
                        </div>
                        <div className="text-right font-semibold">
                          {symbol}
                          {Math.round(value).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                <div className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t-2 border-[#2d3a70] bg-[#0f1633]">
                  <div className="font-extrabold">Total</div>
                  <div className="text-right font-extrabold">
                    {(weeklyHoursTotal * 52).toLocaleString()} h
                  </div>
                  <div className="text-right font-extrabold">
                    {symbol}
                    {Math.round(annualValue).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn--ghost" onClick={goBack}>
                  ← Back
                </button>
                <button className="btn btn--subtle" onClick={startOver}>
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
