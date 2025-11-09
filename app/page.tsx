"use client";

import { useMemo, useState } from "react";

/* =========================
   Types & constants
   ========================= */

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

/* Wizard steps key (replaces any old StepKey) */
type WizardStep =
  | "team"
  | "adoption"
  | "priorities"
  | "throughput"
  | "retention"
  | "upskilling"
  | "results";

/* Hours saved by maturity level (1..10) */
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

/* Training price tiers (USD base, converted later) */
function perSeatPriceUSD(seats: number) {
  if (seats >= 1000) return 299;
  if (seats >= 100) return 349;
  return 399; // 5–99 (and default)
}

/* Currency conversion for training price — simple static multipliers */
function convertFromUSD(amount: number, ccy: Currency) {
  switch (ccy) {
    case "EUR":
      return amount * 0.92; // rough factor
    case "GBP":
      return amount * 0.78;
    case "AUD":
      return amount * 1.55;
    case "USD":
    default:
      return amount;
  }
}

/* =========================
   Component
   ========================= */

export default function Page() {
  /* ---- Step system ------------------------------------------------------ */
  const [step, setStep] = useState<WizardStep>("team");
  const next = () => {
    const order: WizardStep[] = [
      "team",
      "adoption",
      "priorities",
      "throughput",
      "retention",
      "upskilling",
      "results",
    ];
    const i = order.indexOf(step);
    setStep(order[Math.min(order.length - 1, i + 1)]);
  };
  const back = () => {
    const order: WizardStep[] = [
      "team",
      "adoption",
      "priorities",
      "throughput",
      "retention",
      "upskilling",
      "results",
    ];
    const i = order.indexOf(step);
    setStep(order[Math.max(0, i - 1)]);
  };
  const reset = () => window.location.reload();

  /* ---- Step 1: Team ----------------------------------------------------- */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);
  const [programMonths, setProgramMonths] = useState(3);

  /* training cost (per-seat × seats), currency-adjusted */
  const perSeatBaseUSD = perSeatPriceUSD(headcount);
  const perSeatInCcy = convertFromUSD(perSeatBaseUSD, currency);
  const trainingPerEmployee = perSeatInCcy;
  const programCost = headcount * trainingPerEmployee;

  /* ---- Step 2: AI Adoption --------------------------------------------- */
  const [maturity, setMaturity] = useState(5);

  /* ---- Step 3: Priorities (choose up to 3) ------------------------------ */
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

  /* Enforce max 3 selections */
  const togglePriority = (k: PriorityKey) => {
    const active = selected.includes(k);
    if (active) {
      setSelected(selected.filter((x) => x !== k));
    } else {
      if (selected.length >= 3) return; // do nothing if already 3
      setSelected([...selected, k]);
    }
  };

  /* ---- Step 4–6 config -------------------------------------------------- */
  // Throughput
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);
  // Retention
  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);
  // Upskilling
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(0.5);

  /* ---- Core calcs ------------------------------------------------------- */
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const maturityHoursPerPerson = useMemo(
    () => maturityToHours(maturity),
    [maturity]
  );
  const baseWeeklyTeamHours = useMemo(
    () => maturityHoursPerPerson * headcount,
    [maturityHoursPerPerson, headcount]
  );

  /* More conservative onboarding math (only if chosen) */
  const onboardingWeeklyHours = useMemo(() => {
    if (!selected.includes("onboarding")) return 0;
    // Previously huge; now narrower:
    // assume average 10 new hires (or 8% of team) onboarding at any time, save 4h/wk each
    const newHireShare = Math.max(0.05, Math.min(0.15, headcount * 0.0008)); // 8% bounded 5–15%
    const activeNewHires = Math.round(headcount * newHireShare);
    const perHireHours = 4; // hours saved / week per active new hire
    return activeNewHires * perHireHours;
  }, [selected, headcount]);

  const weeklyHours = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(
            baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100)
          )
        : 0,
      quality: selected.includes("quality")
        ? Math.round(baseWeeklyTeamHours * 0.06) // 6% not 20%
        : 0,
      onboarding: onboardingWeeklyHours, // conservative calc above
      retention: selected.includes("retention")
        ? Math.round(
            ((headcount * (baselineAttritionPct / 100)) *
              (retentionLiftPct / 100) *
              60) / 52
          ) // ~half a week reclaimed per avoided backfill, smoothed
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * upskillHoursPerWeek)
        : 0,
      costAvoidance: selected.includes("costAvoidance")
        ? Math.round(baseWeeklyTeamHours * 0.04) // 4%
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
    onboardingWeeklyHours,
  ]);

  const weeklyTotal = useMemo(
    () => Object.values(weeklyHours).reduce((a, b) => a + b, 0),
    [weeklyHours]
  );
  const monthlyValue = useMemo(
    () => weeklyTotal * hourlyCost * 4,
    [weeklyTotal, hourlyCost]
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

  /* Ordered steps for the progress bar */
  const steps: { id: number; key: WizardStep; label: string }[] = [
    { id: 1, key: "team", label: "Team" },
    { id: 2, key: "adoption", label: "AI Adoption" },
    { id: 3, key: "priorities", label: "Team Priorities" },
    { id: 4, key: "throughput", label: "Throughput" },
    { id: 5, key: "retention", label: "Retention" },
    { id: 6, key: "upskilling", label: "Upskilling" },
    { id: 7, key: "results", label: "Results" },
  ];

  /* =========================
     UI
     ========================= */
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text)" }}>
      {/* HERO */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img src="/hero.png" alt="AI at Work — Brainster" className="hero-img shadow-soft" />
      </div>

      {/* Progress */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="panel flex gap-4 flex-wrap justify-between items-center">
          <div className="flex gap-4 flex-wrap">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className={`step-chip ${steps.findIndex((x) => x.key === step) + 1 >= s.id ? "step-chip--on" : "step-chip--off"}`}>
                  {s.id}
                </span>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>
          {/* Right-aligned live summary of chosen priorities */}
          <div className="text-xs muted">
            {selected.length > 0
              ? `Selected: ${selected.map((k) => PRIORITY_META[k].label).join(", ")}`
              : "No priorities selected"}
          </div>
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
                    {["Company-wide","Marketing","Sales","Customer Support","Operations","Engineering","HR"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <p className="hint">Choose a function or “Company-wide”.</p>
                </div>

                <div className="card">
                  <label className="lbl">Employees in scope</label>
                  <input className="inp" type="number" value={headcount}
                         onChange={(e) => setHeadcount(parseInt(e.target.value || "0", 10))} />
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

              <h3 className="text-lg font-bold mt-8 mb-2">Program cost assumptions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="card">
                  <label className="lbl">Avg. annual salary ({symbol})</label>
                  <input className="inp" type="number" value={avgSalary}
                         onChange={(e) => setAvgSalary(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">Per-seat training ({symbol})</label>
                  <input className="inp" type="number" value={Math.round(trainingPerEmployee)}
                         onChange={() => { /* derived from headcount/currency; locked */ }} readOnly />
                  <div className="hint">Tiered: $399 (5–99), $349 (100–999), $299 (1000+), converted to {currency}.</div>
                </div>
                <div className="card">
                  <label className="lbl">Program duration (months)</label>
                  <input className="inp" type="number" value={programMonths}
                         onChange={(e) => setProgramMonths(parseInt(e.target.value || "0", 10))} />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP: AI Adoption */}
          {step === "adoption" && (
            <div>
              <h2 className="title">AI Adoption</h2>
              <p className="muted text-sm mb-3">Gauge where you are today to estimate baseline time savings.</p>

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
                    style={{ accentColor: "var(--azure)" }}
                  />
                  <div className="flex justify-between mt-2 font-semibold" style={{ color: "var(--text-dim)", fontSize: "15px" }}>
                    {Array.from({ length: 10 }).map((_, i) => <span key={i}>{i + 1}</span>)}
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
                      <div className="text-3xl font-extrabold">
                        {Math.round(maturityToHours(maturity) * headcount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs muted">Refine via priorities and training below.</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP: Team Priorities */}
          {step === "priorities" && (
            <div>
              <h2 className="title">Team Priorities</h2>
              <p className="muted text-sm mb-4">Pick up to three. You must select three to continue.</p>

              <div className="grid md:grid-cols-3 gap-3">
                {keys.map((k) => {
                  const active = selected.includes(k);
                  const disabled = !active && selected.length >= 3;
                  return (
                    <div
                      key={k}
                      className={`priority ${active ? "priority--active" : ""} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                      onClick={() => togglePriority(k)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{PRIORITY_META[k].label}</span>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${active ? "bg-[var(--bg-chip)] text-white" : "bg-[#22252c] text-white"}`}>
                          {active ? "Selected" : "Select"}
                        </span>
                      </div>
                      <div className="text-sm muted mt-1">{PRIORITY_META[k].blurb}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next} disabled={selected.length !== 3}>
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
                  <input className="inp" type="number" min={0} max={30} value={throughputPct}
                         onChange={(e) => setThroughputPct(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">Handoffs reduced %</label>
                  <input className="inp" type="number" min={0} max={30} value={handoffPct}
                         onChange={(e) => setHandoffPct(parseInt(e.target.value || "0", 10))} />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
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
                  <input className="inp" type="number" min={0} max={30} value={retentionLiftPct}
                         onChange={(e) => setRetentionLiftPct(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">Baseline attrition %</label>
                  <input className="inp" type="number" min={0} max={40} value={baselineAttritionPct}
                         onChange={(e) => setBaselineAttritionPct(parseInt(e.target.value || "0", 10))} />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
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
                  <input className="inp" type="number" min={0} max={100} value={upskillCoveragePct}
                         onChange={(e) => setUpskillCoveragePct(parseInt(e.target.value || "0", 10))} />
                </div>
                <div className="card">
                  <label className="lbl">Hours / week per person</label>
                  <input className="inp" type="number" min={0} step={0.1} value={upskillHoursPerWeek}
                         onChange={(e) => setUpskillHoursPerWeek(parseFloat(e.target.value || "0"))} />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP: Results */}
          {step === "results" && (
            <div>
              <h2 className="title">Results</h2>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="kpi kpi--accent"><div className="kpi__label">Total annual value</div><div className="kpi__value">{symbol}{Math.round(annualValue).toLocaleString()}</div></div>
                <div className="kpi kpi--accent"><div className="kpi__label">Annual ROI</div><div className="kpi__value">{annualROI.toFixed(1)}×</div></div>
                <div className="kpi kpi--accent"><div className="kpi__label">Payback</div><div className="kpi__value">{isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : "—"}</div></div>
                <div className="kpi kpi--accent"><div className="kpi__label">Total hours saved (est.)</div><div className="kpi__value">{(weeklyTotal * 52).toLocaleString()}</div></div>
              </div>

              <div className="mt-6 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <div className="grid grid-cols-[1fr_180px_200px] py-3 px-4 text-xs font-semibold" style={{ color: "var(--text-dim)", background: "#101317" }}>
                  <div>PRIORITY</div><div className="text-right">HOURS SAVED</div><div className="text-right">ANNUAL VALUE</div>
                </div>
                {keys.filter((k) => selected.includes(k)).map((k) => {
                  const hours = Math.round(weeklyHours[k] * 52);
                  const value = hours * hourlyCost;
                  return (
                    <div key={k} className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <div className="font-bold">{PRIORITY_META[k].label}</div>
                        <div className="text-sm muted">{PRIORITY_META[k].blurb}</div>
                      </div>
                      <div className="text-right font-semibold">{hours.toLocaleString()} h</div>
                      <div className="text-right font-semibold">{symbol}{Math.round(value).toLocaleString()}</div>
                    </div>
                  );
                })}
                <div className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t" style={{ borderColor: "var(--border-strong)", background: "#0f1216" }}>
                  <div className="font-extrabold">Total</div>
                  <div className="text-right font-extrabold">{(weeklyTotal * 52).toLocaleString()} h</div>
                  <div className="text-right font-extrabold">{symbol}{Math.round(annualValue).toLocaleString()}</div>
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
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={reset}>Start over</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simple styles expected by globals.css:
         - .panel, .card, .inp, .pill, .btn, .btn-ghost
         - .step-chip(.--on/--off), .step-label
         - .range-slim, .muted, .kpi(.--accent), .hero-img, .hint, etc.
      */}
    </div>
  );
}
