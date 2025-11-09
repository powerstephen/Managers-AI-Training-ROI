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
  | "throughput"
  | "retention"
  | "upskilling"
  | "results"
  | "quality"
  | "onboarding"
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

const AZURE = "#00D7FF";

/* ---------- Small UI helpers ---------- */
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
  const [stepKey, setStepKey] = useState<WizardStep>("team");
  const go = (key: WizardStep) => setStepKey(key);
  const reset = () => window.location.reload();

  /* Step 1: team basics */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);
  const seatUSD = headcount >= 1000 ? 299 : headcount >= 100 ? 349 : 399;
  const symbol = CURRENCY_SYMBOL[currency];

  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const programCost = useMemo(() => headcount * seatUSD, [headcount, seatUSD]);

  /* Step 2: adoption (1..10) */
  const [adoption, setAdoption] = useState(5);
  const maturityHoursPerPerson = useMemo(() => maturityToHours(adoption), [adoption]);
  const maturityHoursTeam = useMemo(
    () => Math.round(maturityHoursPerPerson * headcount),
    [maturityHoursPerPerson, headcount]
  );
  const numberTrained = headcount; // in-scope = all trained

  /* Step 3: priorities */
  const keys: PriorityKey[] = [
    "throughput",
    "quality",
    "onboarding",
    "retention",
    "upskilling",
    "costAvoidance",
  ];
  const [selected, setSelected] = useState<PriorityKey[]>(
    keys.filter((k) => PRIORITY_META[k].defaultOn).slice(0, 3)
  );

  /* Dynamic progress based on chosen priorities */
  const ALL_STEPS: { id: number; key: WizardStep; label: string }[] = useMemo(() => {
    const dynamicPriorities = selected.map((p) => ({
      key: p as WizardStep,
      label: PRIORITY_META[p].label,
    }));
    const base = [
      { key: "team", label: "Team" },
      { key: "adoption", label: "AI Adoption" },
      { key: "priorities", label: "Team Priorities" },
      ...dynamicPriorities,
      { key: "results", label: "Results" },
    ];
    return base.map((s, i) => ({ id: i + 1, ...s }));
  }, [selected]);

  /* Step 4..6 config values */
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);
  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(1.5);

  /* Derived values */
  const baseWeeklyTeamHours = useMemo(
    () => maturityHoursPerPerson * headcount,
    [maturityHoursPerPerson, headcount]
  );

  const weeklyHours = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100))
        : 0,
      quality: selected.includes("quality") ? Math.round(baseWeeklyTeamHours * 0.2) : 0,
      onboarding: selected.includes("onboarding") ? Math.round(8 * headcount) : 0,
      retention: selected.includes("retention")
        ? Math.round(
            ((headcount * (baselineAttritionPct / 100)) *
              (retentionLiftPct / 100) *
              120) /
              52
          )
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * Math.max(1, upskillHoursPerWeek))
        : 0,
      costAvoidance: selected.includes("costAvoidance")
        ? Math.round(baseWeeklyTeamHours * 0.05)
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
  const monthlyValue = useMemo(() => weeklyTotal * hourlyCost * 4, [weeklyTotal, hourlyCost]);
  const annualValue = useMemo(() => monthlyValue * 12, [monthlyValue]);
  const annualROI = useMemo(
    () => (programCost === 0 ? 0 : annualValue / programCost),
    [annualValue, programCost]
  );
  const paybackMonths = useMemo(
    () => (monthlyValue === 0 ? Infinity : programCost / monthlyValue),
    [programCost, monthlyValue]
  );
  const productivityGainPct = useMemo(() => {
    const denom = headcount * 40;
    return denom > 0 ? (weeklyTotal / denom) * 100 : 0;
  }, [weeklyTotal, headcount]);

  /* Flow helpers */
  const stepIndex = ALL_STEPS.find((s) => s.key === stepKey)?.id ?? 1;
  const visibleProgress = ((stepIndex - 1) / (ALL_STEPS.length - 1)) * 100;

  const back = () => {
    const idx = ALL_STEPS.findIndex((s) => s.key === stepKey);
    if (idx > 0) setStepKey(ALL_STEPS[idx - 1].key);
  };

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
        input.range-slim {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 10px;
          background: transparent;
        }
        input.range-slim::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${AZURE};
          border: 2px solid #000;
          box-shadow: 0 0 12px ${AZURE};
          margin-top: -4px;
        }
        .results-grid {
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 1024px) {
          .results-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      {/* Progress header */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <div className="panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              {ALL_STEPS.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span
                    className={`step-chip ${
                      stepIndex >= s.id ? "step-chip--on" : "step-chip--off"
                    }`}
                  >
                    {s.id}
                  </span>
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
          {/* TEAM STEP */}
          {stepKey === "team" && (
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
                      <option key={d}>{d}</option>
                    ))}
                  </select>
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
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="card md:col-span-1">
                  <label className="lbl">Average annual salary</label>
                  <input
                    className="inp"
                    type="number"
                    value={avgSalary}
                    onChange={(e) => setAvgSalary(parseInt(e.target.value || "0", 10))}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button className="btn" onClick={() => go("adoption")}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ADOPTION STEP */}
          {stepKey === "adoption" && (
            <div>
              <h2 className="title">AI Adoption</h2>
              <div className="card">
                <label className="lbl mb-2">Where are you today? (1–10)</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={adoption}
                  onChange={(e) => setAdoption(parseInt(e.target.value, 10))}
                  className="range-slim"
                />
                <div className="mt-3 text-sm">
                  <strong>Selected {adoption}:</strong>{" "}
                  {maturityExplainer[adoption - 1]}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button className="btn" onClick={() => go("priorities")}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* PRIORITIES STEP */}
          {stepKey === "priorities" && (
            <div>
              <h2 className="title">Team Priorities</h2>
              <p className="muted text-sm mb-4">
                Choose <b>exactly three</b> areas to focus.
              </p>
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
                        <span className="font-semibold">
                          {PRIORITY_META[k].label}
                        </span>
                        <button
                          onClick={() => {
                            if (active)
                              setSelected(selected.filter((x) => x !== k));
                            else if (!disabled) setSelected([...selected, k]);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            active
                              ? "bg-[var(--bg-chip)] text-white"
                              : "bg-[#22252c] text-white"
                          }`}
                        >
                          {active ? "Selected" : "Select"}
                        </button>
                      </div>
                      <div className="text-sm muted mt-1">
                        {PRIORITY_META[k].blurb}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="btn"
                  onClick={CONTINUE}
                  disabled={selected.length !== 3}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* RESULTS STEP */}
         
