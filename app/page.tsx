"use client";

import { useMemo, useState } from "react";

/* ----------------------------- Types / helpers ---------------------------- */

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

// map maturity 1–10 → weekly hours saved per person (baseline suggestion)
const maturityToHours = (level: number) => {
  // Gentle curve: bigger early wins, tapering later
  // 1 → 5h/w, 10 → 1h/w
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

/* --------------------------------- Page ---------------------------------- */

export default function Page() {
  /* ------------------------------- Step state ------------------------------ */
  const [step, setStep] = useState(1);

  // Step 1 – Basics
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState<number>(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState<number>(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [programMonths, setProgramMonths] = useState<number>(3);

  // Step 2 – AI Maturity
  const [maturity, setMaturity] = useState<number>(5);

  // Step 3 – Priorities (allow 6 options, preselect top 3)
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

  // Step 4–6 simple dials (you can refine later)
  const [throughputPct, setThroughputPct] = useState(8); // % weekly time reclaimed
  const [retentionLiftPct, setRetentionLiftPct] = useState(2); // % attrition avoided
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60); // % of team competent

  /* ------------------------------ Calculations ----------------------------- */

  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);

  const maturityHoursPerPerson = useMemo(
    () => maturityToHours(maturity),
    [maturity]
  );
  const maturityHoursTeam = useMemo(
    () => Math.round(maturityHoursPerPerson * headcount),
    [maturityHoursPerPerson, headcount]
  );

  // Simple illustrative value mapping per priority (weekly team hours)
  const weeklyHoursByPriority = useMemo(() => {
    const hpp = maturityHoursPerPerson; // hours per person / week baseline
    const base = hpp * headcount; // total team baseline hours

    const entries: Record<PriorityKey, number> = {
      throughput:
        selected.includes("throughput") ? Math.round(base * (throughputPct / 100)) : 0,
      quality: selected.includes("quality") ? Math.round(base * 0.2) : 0,
      onboarding: selected.includes("onboarding") ? Math.round(headcount * 0.3) : 0,
      retention: selected.includes("retention") ? Math.round(headcount * (retentionLiftPct / 100) * 4) : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * 0.5)
        : 0,
      costAvoidance: selected.includes("costAvoidance") ? Math.round(base * 0.1) : 0,
    };
    return entries;
  }, [
    headcount,
    maturityHoursPerPerson,
    selected,
    throughputPct,
    retentionLiftPct,
    upskillCoveragePct,
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

  /* --------------------------------- UI bits -------------------------------- */

  const symbol = CURRENCY_SYMBOL[currency];

  const goNext = () => setStep((s) => Math.min(7, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));
  const startOver = () => window.location.reload();

  const stepItems = [
    { id: 1, label: "Basics" },
    { id: 2, label: "AI Maturity" },
    { id: 3, label: "Pick top 3 priorities" },
    { id: 4, label: "Throughput" },
    { id: 5, label: "Retention" },
    { id: 6, label: "Upskilling" },
    { id: 7, label: "Results" },
  ];

  /* --------------------------------- Render -------------------------------- */

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#0e1328]">
      {/* HERO (image replaces the old blue header) */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img
          src="/hero.png"
          alt="AI at Work — Brainster"
          className="w-full h-[220px] md:h-[260px] lg:h-[300px] object-cover rounded-2xl shadow-[0_4px_24px_rgba(2,6,23,0.15)]"
        />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="rounded-2xl bg-white shadow-soft p-4 flex gap-4 flex-wrap">
          {stepItems.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                  step >= s.id ? "bg-[#3366fe]" : "bg-[#b6c3ff]"
                }`}
              >
                {s.id}
              </span>
              <span className="text-sm font-medium text-[#0e1328]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card frame */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4 pb-16">
        <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
          {/* STEP CONTENTS */}
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

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div>
                  <label className="lbl">
                    Program cost assumptions — Average annual salary ({symbol})
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

          {step === 2 && (
            <div>
              <h2 className="text-xl font-extrabold mb-4">AI Maturity</h2>

              <div className="grid md:grid-cols-[1fr_320px] gap-6">
                {/* slider + explainer */}
                <div>
                  <label className="lbl mb-2">Where are you today?</label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={maturity}
                    onChange={(e) => setMaturity(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1 text-[#51608e]">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-[#f3f6ff] border border-[#dfe6ff]">
                    <div className="text-sm font-semibold">
                      {maturity}. {["Early","Exploring","Emerging","Forming","Defined","Adopted","Integrated","Scaled","Optimized","Embedded"][maturity-1]}
                    </div>
                    <p className="text-sm mt-1">{maturityExplainer(maturity)}</p>
                  </div>
                </div>

                {/* side box: hours saved */}
                <div className="rounded-2xl border border-[#e6e9f5] bg-[#fbfcff] p-4">
                  <div className="text-sm font-semibold text-[#51608e]">
                    Estimated hours saved (per week)
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-xs text-[#51608e]">Per person</div>
                      <div className="text-2xl font-extrabold">
                        {maturityHoursPerPerson.toFixed(1)} h
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#51608e]">Team</div>
                      <div className="text-2xl font-extrabold">
                        {maturityHoursTeam.toLocaleString()} h
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-[#51608e]">
                    Based on maturity benchmark mapping. You can refine in later steps.
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

          {step === 3 && (
            <div>
              <h2 className="text-xl font-extrabold mb-2">Pick top 3 priorities</h2>
              <p className="text-sm text-[#51608e] mb-4">
                Choose up to three areas to focus your business case.
              </p>

              <div className="grid md:grid-cols-3 gap-3">
                {allPriorityKeys.map((k) => {
                  const active = selected.includes(k);
                  const disabled = !active && selected.length >= 3;
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        if (active) {
                          setSelected(selected.filter((x) => x !== k));
                        } else if (!disabled) {
                          setSelected([...selected, k]);
                        }
                      }}
                      className={`priority ${active ? "priority--active" : ""} ${
                        disabled ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {PRIORITY_META[k].label}
                        </span>
                        {active ? (
                          <span className="tag">Selected</span>
                        ) : (
                          <span className="tag tag--ghost">Tap to select</span>
                        )}
                      </div>
                      <div className="text-sm text-[#51608e] mt-1">
                        {PRIORITY_META[k].blurb}
                      </div>
                    </button>
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

          {step === 4 && (
            <div>
              <h2 className="text-xl font-extrabold mb-2">Throughput</h2>
              <p className="text-sm text-[#51608e] mb-4">
                Estimated weekly time reclaimed via shorter cycles.
              </p>
              <label className="lbl">% of weekly time reclaimed</label>
              <input
                className="inp"
                type="number"
                min={0}
                max={30}
                value={throughputPct}
                onChange={(e) => setThroughputPct(parseInt(e.target.value || "0", 10))}
              />
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

          {step === 5 && (
            <div>
              <h2 className="text-xl font-extrabold mb-2">Retention</h2>
              <p className="text-sm text-[#51608e] mb-4">
                % attrition avoided thanks to better tools / work satisfaction.
              </p>
              <label className="lbl">% attrition avoided</label>
              <input
                className="inp"
                type="number"
                min={0}
                max={20}
                value={retentionLiftPct}
                onChange={(e) =>
                  setRetentionLiftPct(parseInt(e.target.value || "0", 10))
                }
              />
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

          {step === 6 && (
            <div>
              <h2 className="text-xl font-extrabold mb-2">Upskilling</h2>
              <p className="text-sm text-[#51608e] mb-4">
                Target competency coverage across the in-scope team.
              </p>
              <label className="lbl">Coverage target (%)</label>
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

              <div className="mt-6 border border-[#e6e9f5] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_180px_200px] py-3 px-4 text-xs font-semibold text-[#51608e] bg-[#f8faff]">
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
                        className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t border-[#eef1f8]"
                        key={k}
                      >
                        <div>
                          <div className="font-bold">
                            {PRIORITY_META[k].label}
                          </div>
                          <div className="text-sm text-[#51608e]">
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
                <div className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t-2 border-[#dfe6ff] bg-[#f8faff]">
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

              <div className="mt-6 rounded-2xl border border-[#e6e9f5] bg-[#fbfcff] p-4">
                <div className="text-sm font-bold mb-2">Next steps</div>
                <ul className="list-disc pl-5 text-sm text-[#1b2559] space-y-1">
                  <li>
                    Map top 3 workflows → ship prompt templates & QA/guardrails within
                    2 weeks.
                  </li>
                  <li>
                    Launch “AI Champions” cohort; set quarterly ROI reviews; track usage
                    to correlate with retention.
                  </li>
                  <li>
                    Set competency coverage target to {upskillCoveragePct}% and measure
                    weekly AI-in-task usage.
                  </li>
                </ul>
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
