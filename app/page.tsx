"use client";

import { useMemo, useState, useCallback } from "react";

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

/** very light, static FX to keep it simple (you can wire a live rate later) */
const FX: Record<Currency, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.77,
  AUD: 1.55,
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

/** All selectable priorities (you can add copy here safely) */
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
  },
  onboarding: {
    label: "Onboarding",
    blurb: "Ramp new hires faster with AI assist.",
  },
  retention: {
    label: "Retention",
    blurb: "Reduce regretted attrition via better tooling.",
    defaultOn: true,
  },
  upskilling: {
    label: "Upskilling",
    blurb: "Grow competency coverage; unlock compounding gains.",
    defaultOn: true,
  },
  costAvoidance: {
    label: "Cost avoidance",
    blurb: "Avoid outside spend/overtime via automation.",
  },
};

/** Adoption slider mapping (1..10) -> base hrs/week per person */
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
   Component
========================= */
export default function Page() {
  /* ---------- Global UI state ---------- */
  const [step, setStep] = useState<number>(1);
  const next = () => setStep((s) => Math.min(7, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const reset = () => window.location.reload();

  /* ---------- Step 1: Team ---------- */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState<number>(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState<number>(52000);

  // Program cost is now derived from the tiered price per seat.
  const pricePerSeatUSD = useMemo(() => {
    if (headcount >= 1000) return 299;
    if (headcount >= 100) return 349;
    return 399;
  }, [headcount]);

  const pricePerSeat = useMemo(
    () => pricePerSeatUSD * FX[currency],
    [pricePerSeatUSD, currency]
  );

  /* ---------- Step 2: Adoption ---------- */
  const [adoption, setAdoption] = useState<number>(5);

  /* ---------- Step 3: Priorities ---------- */
  const PRIORITY_KEYS: PriorityKey[] = [
    "throughput",
    "quality",
    "onboarding",
    "retention",
    "upskilling",
    "costAvoidance",
  ];
  const [selected, setSelected] = useState<PriorityKey[]>(
    PRIORITY_KEYS.filter((k) => PRIORITY_META[k].defaultOn).slice(0, 3)
  );

  const togglePriority = (k: PriorityKey) => {
    const isOn = selected.includes(k);
    if (isOn) {
      setSelected(selected.filter((x) => x !== k));
    } else {
      if (selected.length >= 3) return; // max 3
      setSelected([...selected, k]);
    }
  };

  /* ---------- Step 4–6: Config for chosen priorities ---------- */
  // Throughput
  const [throughputPct, setThroughputPct] = useState<number>(8);
  const [handoffPct, setHandoffPct] = useState<number>(6);

  // Retention
  const [retentionLiftPct, setRetentionLiftPct] = useState<number>(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState<number>(12);

  // Upskilling
  const [upskillCoveragePct, setUpskillCoveragePct] = useState<number>(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState<number>(1);

  // Presets (Low / Average / Aggressive) for each config step
  type AggLevel = "low" | "avg" | "high";
  const [throughputAgg, setThroughputAgg] = useState<AggLevel>("avg");
  const [retentionAgg, setRetentionAgg] = useState<AggLevel>("avg");
  const [upskillingAgg, setUpskillingAgg] = useState<AggLevel>("avg");

  const applyThroughputPreset = useCallback(
    (lvl: AggLevel) => {
      setThroughputAgg(lvl);
      if (lvl === "low") {
        setThroughputPct(4);
        setHandoffPct(2);
      } else if (lvl === "avg") {
        setThroughputPct(8);
        setHandoffPct(6);
      } else {
        setThroughputPct(14);
        setHandoffPct(10);
      }
    },
    [setThroughputPct, setHandoffPct]
  );

  const applyRetentionPreset = useCallback(
    (lvl: AggLevel) => {
      setRetentionAgg(lvl);
      if (lvl === "low") {
        setRetentionLiftPct(1);
        setBaselineAttritionPct(10);
      } else if (lvl === "avg") {
        setRetentionLiftPct(2);
        setBaselineAttritionPct(12);
      } else {
        setRetentionLiftPct(4);
        setBaselineAttritionPct(15);
      }
    },
    [setRetentionLiftPct, setBaselineAttritionPct]
  );

  const applyUpskillingPreset = useCallback(
    (lvl: AggLevel) => {
      setUpskillingAgg(lvl);
      if (lvl === "low") {
        setUpskillCoveragePct(40);
        setUpskillHoursPerWeek(1);
      } else if (lvl === "avg") {
        setUpskillCoveragePct(60);
        setUpskillHoursPerWeek(1.5);
      } else {
        setUpskillCoveragePct(80);
        setUpskillHoursPerWeek(2);
      }
    },
    [setUpskillCoveragePct, setUpskillHoursPerWeek]
  );

  /* ---------- Calculations ---------- */
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const adoptionHrsPerPerson = useMemo(
    () => maturityToHours(adoption),
    [adoption]
  );
  const baseWeeklyTeamHours = useMemo(
    () => adoptionHrsPerPerson * headcount,
    [adoptionHrsPerPerson, headcount]
  );

  /** weekly hours from each chosen priority */
  const weeklyHours = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(
            baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100)
          )
        : 0,

      quality: selected.includes("quality")
        ? Math.round(baseWeeklyTeamHours * 0.12) // toned down
        : 0,

      onboarding: selected.includes("onboarding")
        ? Math.round(headcount * 0.2 * 6) // more realistic than prior spike
        : 0,

      retention: selected.includes("retention")
        ? Math.round(
            ((headcount * (baselineAttritionPct / 100)) *
              (retentionLiftPct / 100) *
              40) /
              52
          )
        : 0,

      upskilling: selected.includes("upskilling")
        ? Math.max(
            Math.round((upskillCoveragePct / 100) * headcount * upskillHoursPerWeek),
            headcount > 0 ? 1 : 0 // ensure at least some signal when covered
          )
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

  /** Derived program cost from tiered price per seat; seat = headcount */
  const programCost = useMemo(
    () => headcount * pricePerSeat,
    [headcount, pricePerSeat]
  );

  const annualROI = useMemo(
    () => (programCost === 0 ? 0 : annualValue / programCost),
    [annualValue, programCost]
  );
  const paybackMonths = useMemo(
    () => (monthlyValue === 0 ? Infinity : programCost / monthlyValue),
    [programCost, monthlyValue]
  );
  const symbol = CURRENCY_SYMBOL[currency];

  /* ---------- Progress & step model ---------- */
  const stepDefs: { id: number; key: string; label: string }[] = [
    { id: 1, key: "team", label: "Team" },
    { id: 2, key: "adoption", label: "AI Adoption" },
    { id: 3, key: "priorities", label: "Team Priorities" },
    { id: 4, key: "throughput", label: "Throughput" },
    { id: 5, key: "retention", label: "Retention" },
    { id: 6, key: "upskilling", label: "Upskilling" },
    { id: 7, key: "results", label: "Results" },
  ];

  // which config screens we actually need, in order:
  const chosenConfigSequence: number[] = useMemo(() => {
    const order: PriorityKey[] = ["throughput", "retention", "upskilling"];
    const needed = order.filter((k) => selected.includes(k));
    // map to step ids (4..6)
    const map: Record<PriorityKey, number> = {
      throughput: 4,
      retention: 5,
      upskilling: 6,
      quality: 0,
      onboarding: 0,
      costAvoidance: 0,
    };
    return needed.map((k) => map[k]).filter(Boolean);
  }, [selected]);

  // go forward smartly from Priorities
  const goFromPriorities = useCallback(() => {
    if (selected.length < 3) return; // must choose 3
    if (chosenConfigSequence.length > 0) {
      setStep(chosenConfigSequence[0]);
    } else {
      setStep(7);
    }
  }, [selected.length, chosenConfigSequence]);

  // go forward smartly from a config step to the next config step (or results)
  const goFromConfig = useCallback(
    (currentStepId: number) => {
      const idx = chosenConfigSequence.indexOf(currentStepId);
      if (idx === -1) {
        setStep(7);
      } else if (idx === chosenConfigSequence.length - 1) {
        setStep(7);
      } else {
        setStep(chosenConfigSequence[idx + 1]);
      }
    },
    [chosenConfigSequence]
  );

  /* ---------- Small render helpers ---------- */
  const Pill = ({
    on,
    children,
    onClick,
  }: {
    on: boolean;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button
      className={`pill ${on ? "pill--active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );

  const AggChooser = ({
    value,
    onChange,
  }: {
    value: AggLevel;
    onChange: (v: AggLevel) => void;
  }) => {
    const box = (key: AggLevel, title: string, sub: string) => (
      <button
        type="button"
        onClick={() => onChange(key)}
        className={`agg-box ${value === key ? "agg-box--on" : ""}`}
      >
        <div className="agg-title">{title}</div>
        <div className="agg-sub">{sub}</div>
      </button>
    );
    return (
      <div className="agg-row">
        {box("low", "Low", "(Conservative)")}
        {box("avg", "Average", "(Typical)")}
        {box("high", "Aggressive", "(Stretch)")}
      </div>
    );
  };

  /* =========================
     Render
  ========================= */
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text)" }}>
      {/* HERO */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img src="/hero.png" alt="AI at Work — Brainster" className="hero-img shadow-soft" />
      </div>

      {/* Progress */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="panel flex items-center justify-between flex-wrap gap-3">
          <div className="progress-rail">
            <div
              className="progress-fill"
              style={{
                width: `${((step - 1) / (stepDefs.length - 1)) * 100}%`,
              }}
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            {stepDefs.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className={`step-chip ${step >= s.id ? "step-chip--on" : "step-chip--off"}`}>
                  {s.id}
                </span>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main card */}
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
                    onChange={(e) => setHeadcount(parseInt(e.target.value || "0", 10))}
                  />
                </div>

                <div className="card">
                  <label className="lbl">Currency</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["EUR", "USD", "GBP", "AUD"] as Currency[]).map((c) => (
                      <Pill key={c} on={currency === c} onClick={() => setCurrency(c)}>
                        {c}
                      </Pill>
                    ))}
                  </div>
                  <p className="hint">Values render in {currency} ({CURRENCY_SYMBOL[currency]}).</p>
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
                  <label className="lbl">Price per seat (auto-tiered)</label>
                  <div className="big-number">
                    {symbol}
                    {Math.round(pricePerSeat).toLocaleString()}
                    <span className="big-unit"> / user / year </span>
                  </div>
                  <div className="hint">
                    Tiers: 5–99 = $399, 100–999 = $349, 1000+ = $299 (converted to {currency}).
                  </div>
                </div>
                <div className="card">
                  <label className="lbl">Estimated annual program cost</label>
                  <div className="big-number">
                    {symbol}
                    {Math.round(programCost).toLocaleString()}
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

          {/* STEP 2: AI Adoption */}
          {step === 2 && (
            <div>
              <h2 className="title">AI Adoption</h2>
              <p className="muted text-sm mb-4">
                Rate current adoption across your team. Higher adoption creates higher time savings.
              </p>

              <div className="grid md:grid-cols-[1fr_380px] gap-6">
                <div className="card">
                  <label className="lbl mb-2">Where are you today? (1–10)</label>

                  {/* slider with fill only up to the selected value */}
                  <div className="adopt-wrap">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={adoption}
                      onChange={(e) => setAdoption(parseInt(e.target.value, 10))}
                      className="range"
                      style={
                        {
                          "--range-fill": `${((adoption - 1) / 9) * 100}%`,
                        } as React.CSSProperties
                      }
                    />
                    <div className="ticks">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span key={i} className="tick">
                          {i + 1}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-[15px]">
                    <span className="font-bold">Selected: {adoption} — </span>
                    {maturityExplainer[adoption - 1]}
                  </div>
                </div>

                <div className="card">
                  <div className="text-sm font-semibold muted">Estimated hours saved</div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="card">
                      <div className="text-xs muted">Per employee / week</div>
                      <div className="text-4xl font-extrabold">
                        {adoptionHrsPerPerson.toFixed(1)}
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs muted">Team / week</div>
                      <div className="text-4xl font-extrabold">
                        {Math.round(adoptionHrsPerPerson * headcount).toLocaleString()}
                      </div>
                    </div>
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

          {/* STEP 3: Team Priorities */}
          {step === 3 && (
            <div>
              <h2 className="title">Team Priorities</h2>
              <p className="muted text-sm mb-4">Choose exactly three areas to focus your ROI model.</p>

              <div className="grid md:grid-cols-3 gap-3">
                {PRIORITY_KEYS.map((k) => {
                  const active = selected.includes(k);
                  const disabled = !active && selected.length >= 3;
                  return (
                    <div
                      key={k}
                      className={`priority ${active ? "priority--active" : ""} ${
                        disabled ? "priority--disabled" : ""
                      }`}
                      onClick={() => togglePriority(k)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{PRIORITY_META[k].label}</span>
                        <span className={`badge ${active ? "badge--on" : "badge--off"}`}>
                          {active ? "Selected" : "Select"}
                        </span>
                      </div>
                      <div className="text-sm muted mt-1">{PRIORITY_META[k].blurb}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="muted text-sm">
                  Selected: <strong>{selected.map((k) => PRIORITY_META[k].label).join(", ")}</strong>
                </div>
                <div className="flex gap-3">
                  <button className="btn-ghost" onClick={back}>
                    ← Back
                  </button>
                  <button className="btn" disabled={selected.length !== 3} onClick={goFromPriorities}>
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Throughput (if chosen) */}
          {step === 4 && selected.includes("throughput") && (
            <div>
              <h2 className="title">Throughput</h2>
              <p className="muted text-sm mb-4">Quick edit of assumptions for throughput impact.</p>

              <AggChooser
                value={throughputAgg}
                onChange={(lvl) => {
                  applyThroughputPreset(lvl);
                }}
              />

              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div className="card">
                  <label className="lbl">Time reclaimed %</label>
                  <input
                    className="inp inp--dark"
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
                    className="inp inp--dark"
                    type="number"
                    min={0}
                    max={30}
                    value={handoffPct}
                    onChange={(e) => setHandoffPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={() => goFromConfig(4)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Retention (if chosen) */}
          {step === 5 && selected.includes("retention") && (
            <div>
              <h2 className="title">Retention</h2>

              <AggChooser
                value={retentionAgg}
                onChange={(lvl) => {
                  applyRetentionPreset(lvl);
                }}
              />

              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div className="card">
                  <label className="lbl">Attrition avoided %</label>
                  <input
                    className="inp inp--dark"
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
                    className="inp inp--dark"
                    type="number"
                    min={0}
                    max={40}
                    value={baselineAttritionPct}
                    onChange={(e) => setBaselineAttritionPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={() => goFromConfig(5)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Upskilling (if chosen) */}
          {step === 6 && selected.includes("upskilling") && (
            <div>
              <h2 className="title">Upskilling</h2>

              <AggChooser
                value={upskillingAgg}
                onChange={(lvl) => {
                  applyUpskillingPreset(lvl);
                }}
              />

              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div className="card">
                  <label className="lbl">Coverage target %</label>
                  <input
                    className="inp inp--dark"
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
                    className="inp inp--dark"
                    type="number"
                    min={0}
                    step={0.1}
                    value={upskillHoursPerWeek}
                    onChange={(e) => setUpskillHoursPerWeek(parseFloat(e.target.value || "0"))}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>
                  ← Back
                </button>
                <button className="btn" onClick={() => goFromConfig(6)}>
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
                  <div className="kpi__value">
                    {isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : "—"}
                  </div>
                </div>
                <div className="kpi kpi--accent">
                  <div className="kpi__label">Total hours saved (est.)</div>
                  <div className="kpi__value">{(weeklyTotal * 52).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <div
                  className="grid grid-cols-[1fr_180px_200px] py-3 px-4 text-xs font-semibold"
                  style={{ color: "var(--text-dim)", background: "#0f1216" }}
                >
                  <div>PRIORITY</div>
                  <div className="text-right">HOURS SAVED</div>
                  <div className="text-right">ANNUAL VALUE</div>
                </div>

                {PRIORITY_KEYS.filter((k) => selected.includes(k)).map((k) => {
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

              {/* Summary / Next steps */}
              <div className="card mt-6">
                <div className="text-sm font-bold mb-2">Next steps</div>
                <ul className="list-disc pl-5 space-y-1 text-sm muted">
                  <li>Map top 3 workflows → ship prompt templates & QA/guardrails within 2 weeks.</li>
                  <li>
                    Launch “AI Champions” cohort; set quarterly ROI reviews; track usage to correlate with
                    retention.
                  </li>
                  <li>Set competency coverage target to 60% and measure weekly AI-in-task usage.</li>
                </ul>
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={() => setStep(3)}>
                  ← Adjust priorities
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
