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

/** FX rates (USD → target). Adjust if you want different spot rates. */
const FX_FROM_USD: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
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

const PRIORITY_META: Record<
  PriorityKey,
  { label: string; blurb: string; defaultOn?: boolean; configurable?: boolean }
> = {
  throughput: {
    label: "Throughput",
    blurb: "Ship faster; reduce cycle time and waiting time.",
    defaultOn: true,
    configurable: true,
  },
  quality: {
    label: "Quality",
    blurb: "Fewer reworks; better first-pass yield.",
    defaultOn: true,
    configurable: false,
  },
  onboarding: {
    label: "Onboarding",
    blurb: "Ramp new hires faster with AI assist.",
    defaultOn: true,
    configurable: false,
  },
  retention: {
    label: "Retention",
    blurb: "Reduce regretted attrition via better tooling.",
    configurable: true,
  },
  upskilling: {
    label: "Upskilling",
    blurb: "Grow competency coverage; unlock compounding gains.",
    configurable: true,
  },
  costAvoidance: {
    label: "Cost avoidance",
    blurb: "Avoid outside spend/overtime via automation.",
    configurable: false,
  },
};

// maturity (1–10) -> hrs saved / wk / employee
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

/* Presets for configurable priorities */
type Band = "low" | "avg" | "high";
const THROUGHPUT_PRESETS: Record<Band, { t: number; h: number }> = {
  low: { t: 5, h: 3 },
  avg: { t: 8, h: 6 },
  high: { t: 12, h: 10 },
};
const RETENTION_PRESETS: Record<Band, { lift: number; base: number }> = {
  low: { lift: 1, base: 15 },
  avg: { lift: 2, base: 12 },
  high: { lift: 3, base: 18 },
};
const UPSKILL_PRESETS: Record<Band, { cov: number; hrs: number }> = {
  low: { cov: 40, hrs: 0.25 },
  avg: { cov: 60, hrs: 0.5 },
  high: { cov: 75, hrs: 0.75 },
};

/* Training price tiers (USD per user per YEAR) */
function usdPricePerUserYear(headcount: number): number {
  if (headcount >= 1000) return 299;
  if (headcount >= 100) return 349;
  if (headcount >= 5) return 399;
  // Fallback for very small scopes
  return 399;
}

/* =========================
   Component
========================= */
export default function Page() {
  /* ---- Step system ------------------------------------------------------ */
  type StepKey =
    | "team"
    | "adoption"
    | "priorities"
    | PriorityKey // each chosen priority now gets its own step
    | "results";

  const allPriorityKeys: PriorityKey[] = [
    "throughput",
    "quality",
    "onboarding",
    "retention",
    "upskilling",
    "costAvoidance",
  ];

  // preserve selection order
  const [selected, setSelected] = useState<PriorityKey[]>(
    allPriorityKeys.filter((k) => PRIORITY_META[k].defaultOn).slice(0, 3)
  );

  const stepKeys: StepKey[] = useMemo(() => {
    return ["team", "adoption", "priorities", ...selected, "results"];
  }, [selected]);

  const [stepIndex, setStepIndex] = useState(0);
  const step = stepKeys[stepIndex];
  const gotoNext = () => setStepIndex((i) => Math.min(stepKeys.length - 1, i + 1));
  const gotoPrev = () => setStepIndex((i) => Math.max(0, i - 1));
  const resetAll = () => window.location.reload();

  /* ---- Team ------------------------------------------------------------- */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);
  const [programMonths, setProgramMonths] = useState(3);

  /* ---- Adoption --------------------------------------------------------- */
  const [maturity, setMaturity] = useState(5);

  /* ---- Configurable priority state ------------------------------------- */
  // Throughput
  const [tpTimePct, setTpTimePct] = useState(THROUGHPUT_PRESETS.avg.t);
  const [tpHandoffPct, setTpHandoffPct] = useState(THROUGHPUT_PRESETS.avg.h);
  const [tpBand, setTpBand] = useState<Band>("avg");
  const applyThroughputBand = (b: Band) => {
    setTpBand(b);
    setTpTimePct(THROUGHPUT_PRESETS[b].t);
    setTpHandoffPct(THROUGHPUT_PRESETS[b].h);
  };

  // Retention
  const [retLiftPct, setRetLiftPct] = useState(RETENTION_PRESETS.avg.lift);
  const [retBasePct, setRetBasePct] = useState(RETENTION_PRESETS.avg.base);
  const [retBand, setRetBand] = useState<Band>("avg");
  const applyRetentionBand = (b: Band) => {
    setRetBand(b);
    setRetLiftPct(RETENTION_PRESETS[b].lift);
    setRetBasePct(RETENTION_PRESETS[b].base);
  };

  // Upskilling
  const [upCovPct, setUpCovPct] = useState(UPSKILL_PRESETS.avg.cov);
  const [upHrsPerWeek, setUpHrsPerWeek] = useState(UPSKILL_PRESETS.avg.hrs);
  const [upBand, setUpBand] = useState<Band>("avg");
  const applyUpskillBand = (b: Band) => {
    setUpBand(b);
    setUpCovPct(UPSKILL_PRESETS[b].cov);
    setUpHrsPerWeek(UPSKILL_PRESETS[b].hrs);
  };

  /* ---- Pricing & calculations ------------------------------------------ */
  const symbol = CURRENCY_SYMBOL[currency];

  /** Auto price per user per YEAR in the selected currency */
  const pricePerUserYear = useMemo(() => {
    const usd = usdPricePerUserYear(headcount);
    const fx = FX_FROM_USD[currency] ?? 1;
    return usd * fx;
  }, [headcount, currency]);

  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const maturityHoursPerPerson = useMemo(() => maturityToHours(maturity), [maturity]);
  const baseWeeklyTeamHours = useMemo(
    () => maturityHoursPerPerson * headcount,
    [maturityHoursPerPerson, headcount]
  );

  const weeklyHours: Record<PriorityKey, number> = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(
            baseWeeklyTeamHours * ((tpTimePct + tpHandoffPct * 0.5) / 100)
          )
        : 0,
      quality: selected.includes("quality")
        ? Math.round(baseWeeklyTeamHours * 0.08) // toned down to realistic 8%
        : 0,
      onboarding: selected.includes("onboarding")
        ? Math.round((headcount * 0.2 * 20) / 52) // realistic weekly ramp saving
        : 0,
      retention: selected.includes("retention")
        ? Math.round(
            ((headcount * (retBasePct / 100)) * (retLiftPct / 100) * 80) / 52
          )
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upCovPct / 100) * headcount * upHrsPerWeek)
        : 0,
      costAvoidance: selected.includes("costAvoidance")
        ? Math.round(baseWeeklyTeamHours * 0.05)
        : 0,
    };
    return v;
  }, [
    selected,
    baseWeeklyTeamHours,
    tpTimePct,
    tpHandoffPct,
    headcount,
    retLiftPct,
    retBasePct,
    upCovPct,
    upHrsPerWeek,
  ]);

  const weeklyTotal = useMemo(
    () => Object.values(weeklyHours).reduce((a, b) => a + b, 0),
    [weeklyHours]
  );
  const monthlyValue = useMemo(() => weeklyTotal * hourlyCost * 4, [weeklyTotal, hourlyCost]);

  /** Program cost uses the auto price per user per YEAR, scaled by program length */
  const programCost = useMemo(
    () => headcount * pricePerUserYear * (programMonths / 12),
    [headcount, pricePerUserYear, programMonths]
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

  /* ---- UI helpers ------------------------------------------------------- */
  type StepKey =
    | "team"
    | "adoption"
    | "priorities"
    | PriorityKey
    | "results";

  const stepLabel = (k: StepKey) =>
    ({
      team: "Team",
      adoption: "AI Adoption",
      priorities: "Team Priorities",
      throughput: "Throughput",
      retention: "Retention",
      upskilling: "Upskilling",
      quality: "Quality",
      onboarding: "Onboarding",
      costAvoidance: "Cost avoidance",
      results: "Results",
    }[k]);

  const BandBox = ({
    current,
    set,
    id,
    title,
    sub,
  }: {
    current: Band;
    set: (b: Band) => void;
    id: Band;
    title: string;
    sub: string;
  }) => (
    <button
      type="button"
      onClick={() => set(id)}
      className={`band ${current === id ? "band--active" : ""}`}
    >
      <span className={`dot ${current === id ? "dot--on" : ""}`} />
      <div className="bandText">
        <div className="bandTitle">{title}</div>
        <div className="bandSub">{sub}</div>
      </div>
    </button>
  );

  const StepChip = ({ active, idx, label }: { active: boolean; idx: number; label: string }) => (
    <div className="chip">
      <span className={`chipNum ${active ? "on" : ""}`}>{idx + 1}</span>
      <span className="chipLabel">{label}</span>
    </div>
  );

  /* =========================
     Render
  ========================= */
  return (
    <div className="page">
      {/* HERO */}
      <div className="container">
        <img src="/hero.png" alt="AI at Work — Brainster" className="hero" />
      </div>

      {/* PROGRESS */}
      <div className="container">
        <div className="panel progress">
          {stepKeys.map((k, i) => (
            <StepChip key={k + i} active={i <= stepIndex} idx={i} label={stepLabel(k)} />
          ))}
        </div>
      </div>

      <div className="container main">
        <div className="panel">
          {/* TEAM */}
          {step === "team" && (
            <div>
              <h2 className="title">Team</h2>

              <div className="grid3">
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
                  <div className="pillRow">
                    {(["EUR", "USD", "GBP", "AUD"] as Currency[]).map((c) => (
                      <button
                        key={c}
                        className={`pill ${currency === c ? "pill--on" : ""}`}
                        onClick={() => setCurrency(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="section">Program cost assumptions</h3>
              <div className="grid3">
                <div className="card">
                  <label className="lbl">Average annual salary ({symbol})</label>
                  <input
                    className="inp"
                    type="number"
                    value={avgSalary}
                    onChange={(e) => setAvgSalary(parseInt(e.target.value || "0", 10))}
                  />
                </div>

                {/* Auto training price per user / year */}
                <div className="card">
                  <label className="lbl">Training price (per user / year)</label>
                  <input
                    className="inp"
                    type="number"
                    value={Math.round(pricePerUserYear)}
                    readOnly
                  />
                  <p className="hint">
                    Auto-tiered from USD: $399 (5–99), $349 (100–999), $299 (1,000+). Converted to your selected currency.
                  </p>
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

              <div className="actions">
                <button className="btnGhost" onClick={gotoPrev}>
                  ← Back
                </button>
                <button className="btn" onClick={gotoNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ADOPTION */}
          {step === "adoption" && (
            <div>
              <h2 className="title">AI Adoption</h2>
              <p className="muted">
                Where are you today? Slide to select your current adoption level. This
                sets a baseline of weekly time saved that later priorities refine.
              </p>

              <div className="adoptGrid">
                <div className="card">
                  <label className="lbl mb8">Where are you today? (1–10)</label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={maturity}
                    onChange={(e) => setMaturity(parseInt(e.target.value, 10))}
                    className="range"
                  />
                  <div className="ticks">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>
                  <div className="sel">
                    <span className="bold">Selected: {maturity} — </span>
                    {maturityExplainer[maturity - 1]}
                  </div>
                </div>

                <div className="card">
                  <div className="estTitle">Estimated hours saved</div>
                  <div className="estGrid">
                    <div className="card inner">
                      <div className="mini muted">Per employee / week</div>
                      <div className="big">{maturityToHours(maturity).toFixed(1)}</div>
                    </div>
                    <div className="card inner">
                      <div className="mini muted">Team / week</div>
                      <div className="big">
                        {(maturityToHours(maturity) * headcount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mini muted mt8">
                    Refine via priorities and training below.
                  </div>
                </div>
              </div>

              <div className="actions">
                <button className="btnGhost" onClick={gotoPrev}>
                  ← Back
                </button>
                <button className="btn" onClick={gotoNext}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* PRIORITIES */}
          {step === "priorities" && (
            <div>
              <h2 className="title">Team Priorities</h2>
              <p className="muted">
                Pick exactly three areas to model. (You’ll get a step for each—even if no
                extra inputs are required.)
              </p>

              <div className="prioGrid">
                {allPriorityKeys.map((k) => {
                  const active = selected.includes(k);
                  const disabled = !active && selected.length >= 3;
                  return (
                    <div
                      key={k}
                      className={`priority ${active ? "priority--active" : ""} ${
                        disabled ? "priority--disabled" : ""
                      }`}
                      onClick={() => {
                        if (active) {
                          setSelected(selected.filter((x) => x !== k));
                          setStepIndex((i) => Math.min(i, ["team","adoption","priorities"].length - 1));
                        } else if (!disabled) {
                          setSelected([...selected, k]);
                        }
                      }}
                    >
                      <div className="prioHead">
                        <span className="prioTitle">{PRIORITY_META[k].label}</span>
                        <span className={`badge ${active ? "badge--on" : ""}`}>
                          {active ? "Selected" : "Select"}
                        </span>
                      </div>
                      <div className="prioBlurb">{PRIORITY_META[k].blurb}</div>
                    </div>
                  );
                })}
              </div>

              <div className="actions">
                <button className="btnGhost" onClick={gotoPrev}>
                  ← Back
                </button>
                <button className="btn" onClick={gotoNext} disabled={selected.length !== 3}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* PRIORITY STEPS — configurable or info-only */}
          {selected.includes("throughput") && step === "throughput" && (
            <div>
              <h2 className="title">Throughput</h2>
              <p className="muted">Quick edit of assumptions for throughput impact.</p>

              <div className="grid2">
                <div className="card">
                  <label className="lbl">Time reclaimed %</label>
                  <input
                    className="inp"
                    type="number"
                    value={tpTimePct}
                    onChange={(e) => setTpTimePct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <label className="lbl">Handoffs reduced %</label>
                  <input
                    className="inp"
                    type="number"
                    value={tpHandoffPct}
                    onChange={(e) => setTpHandoffPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
              </div>

              <div className="bandRow">
                <BandBox current={tpBand} set={applyThroughputBand} id="low" title="Low" sub="(Conservative)" />
                <BandBox current={tpBand} set={applyThroughputBand} id="avg" title="Average" sub="(Typical)" />
                <BandBox current={tpBand} set={applyThroughputBand} id="high" title="High" sub="(Aggressive)" />
              </div>

              <div className="actions">
                <button className="btnGhost" onClick={gotoPrev}>← Back</button>
                <button className="btn" onClick={gotoNext}>Continue →</button>
              </div>
            </div>
          )}

          {selected.includes("retention") && step === "retention" && (
            <div>
              <h2 className="title">Retention</h2>

              <div className="grid2">
                <div className="card">
                  <label className="lbl">Attrition avoided %</label>
                  <input
                    className="inp"
                    type="number"
                    value={retLiftPct}
                    onChange={(e) => setRetLiftPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <label className="lbl">Baseline attrition %</label>
                  <input
                    className="inp"
                    type="number"
                    value={retBasePct}
                    onChange={(e) => setRetBasePct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
              </div>

              <div className="bandRow">
                <BandBox current={retBand} set={applyRetentionBand} id="low" title="Low" sub="(Conservative)" />
                <BandBox current={retBand} set={applyRetentionBand} id="avg" title="Average" sub="(Typical)" />
                <BandBox current={retBand} set={applyRetentionBand} id="high" title="High" sub="(Aggressive)" />
              </div>

              <div className="actions">
                <button className="btnGhost" onClick={gotoPrev}>← Back</button>
                <button className="btn" onClick={gotoNext}>Continue →</button>
              </div>
            </div>
          )}

          {selected.includes("upskilling") && step === "upskilling" && (
            <div>
              <h2 className="title">Upskilling</h2>

              <div className="grid2">
                <div className="card">
                  <label className="lbl">Coverage target %</label>
                  <input
                    className="inp"
                    type="number"
                    value={upCovPct}
                    onChange={(e) => setUpCovPct(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <label className="lbl">Hours / week per person</label>
                  <input
                    className="inp"
                    type="number"
                    step={0.1}
                    value={upHrsPerWeek}
                    onChange={(e) => setUpHrsPerWeek(parseFloat(e.target.value || "0"))}
                  />
                </div>
              </div>

              <div className="bandRow">
                <BandBox current={upBand} set={applyUpskillBand} id="low" title="Low" sub="(Conservative)" />
                <BandBox current={upBand} set={applyUpskillBand} id="avg" title="Average" sub="(Typical)" />
                <BandBox current={upBand} set={applyUpskillBand} id="high" title="High" sub="(Aggressive)" />
              </div>

              <div className="actions">
                <button className="btnGhost" onClick={gotoPrev}>← Back</button>
                <button className="btn" onClick={gotoNext}>Continue →</button>
              </div>
            </div>
          )}

          {/* Info-only steps for non-configurable priorities */}
          {selected.some((p) => !PRIORITY_META[p].configurable) &&
            selected
              .filter((p) => !PRIORITY_META[p].configurable && step === p)
              .map((p) => (
                <div key={p}>
                  <h2 className="title">{PRIORITY_META[p].label}</h2>
                  <p className="muted">{PRIORITY_META[p].blurb}</p>
                  <div className="card" style={{ marginTop: 12 }}>
                    <div className="mini muted">
                      No additional inputs needed for <b>{PRIORITY_META[p].label}</b>. We’ll
                      estimate impact using conservative defaults tied to your adoption level.
                    </div>
                  </div>

                  <div className="actions">
                    <button className="btnGhost" onClick={gotoPrev}>← Back</button>
                    <button className="btn" onClick={gotoNext}>Continue →</button>
                  </div>
                </div>
              ))}

          {/* RESULTS */}
          {step === "results" && (
            <div>
              <h2 className="title">Results</h2>

              <div className="kpis">
                <div className="kpi">
                  <div className="kpiLabel">Total annual value</div>
                  <div className="kpiValue">
                    {symbol}
                    {Math.round(annualValue).toLocaleString()}
                  </div>
                </div>
                <div className="kpi">
                  <div className="kpiLabel">Annual ROI</div>
                  <div className="kpiValue">{annualROI.toFixed(1)}×</div>
                </div>
                <div className="kpi">
                  <div className="kpiLabel">Payback</div>
                  <div className="kpiValue">
                    {isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : "—"}
                  </div>
                </div>
                <div className="kpi">
                  <div className="kpiLabel">Total hours saved (est.)</div>
                  <div className="kpiValue">{(weeklyTotal * 52).toLocaleString()}</div>
                </div>
              </div>

              <div className="table">
                <div className="thead">
                  <div>PRIORITY</div>
                  <div className="right">HOURS SAVED</div>
                  <div className="right">ANNUAL VALUE</div>
                </div>
                {allPriorityKeys
                  .filter((k) => selected.includes(k))
                  .map((k) => {
                    const hours = Math.round(weeklyHours[k] * 52);
                    const value = hours * hourlyCost;
                    return (
                      <div key={k} className="trow">
                        <div>
                          <div className="tbold">{PRIORITY_META[k].label}</div>
                          <div className="muted small">{PRIORITY_META[k].blurb}</div>
                        </div>
                        <div className="right">{hours.toLocaleString()} h</div>
                        <div className="right">
                          {symbol}
                          {Math.round(value).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                <div className="trow total">
                  <div className="tbold">Total</div>
                  <div className="right tbold">{(weeklyTotal * 52).toLocaleString()} h</div>
                  <div className="right tbold">
                    {symbol}
                    {Math.round(annualValue).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="card mt8">
                <div className="mini tbold mb8">Next steps</div>
                <ul className="bullets">
                  <li>Map top 3 workflows → ship prompt templates & QA/guardrails within 2 weeks.</li>
                  <li>Launch “AI Champions” cohort; set quarterly ROI reviews; track usage to correlate with retention.</li>
                  <li>Set competency coverage target to 60% and measure weekly AI-in-task usage.</li>
                </ul>
              </div>

              <div className="actions split">
                <button className="btnGhost" onClick={gotoPrev}>← Back</button>
                <button className="btn" onClick={resetAll}>Start over</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scoped styles (dark theme + azure accents) */}
      <style jsx global>{`
        :root {
          --bg-page: #0b0b0c;
          --panel: #121315;
          --card: #17181b;
          --card-inner: #1b1d21;
          --input: #0b0b0c;
          --border: #23262c;
          --text: #ffffff;
          --text-dim: #b7bcc7;
          --azure: #04e1f9;
          --azure-12: rgba(4, 225, 249, 0.12);
        }
        *{box-sizing:border-box}
        body{margin:0;background:var(--bg-page);color:var(--text);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Inter,"Helvetica Neue",Arial}
        .container{max-width:1120px;margin:0 auto;padding:0 16px}
        .hero{width:100%;height:auto;display:block;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.35)}
        .panel{background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:16px}
        .progress{display:flex;gap:12px;flex-wrap:wrap;justify-content:space-between}
        .chip{display:inline-flex;align-items:center;gap:8px}
        .chipNum{width:28px;height:28px;display:grid;place-items:center;border-radius:999px;border:1px solid var(--border);color:#fff}
        .chipNum.on{background:var(--azure);color:#041014;border-color:var(--azure)}
        .chipLabel{font-weight:700;color:#e6eaf0}
        .main{margin-top:16px;margin-bottom:72px}
        .title{font-size:28px;font-weight:800;margin:4px 0 16px}
        .muted{color:var(--text-dim)}
        .small{font-size:13px}
        .mb8{margin-bottom:8px}
        .mt8{margin-top:8px}
        .bold{font-weight:700}
        .grid3{display:grid;grid-template-columns:repeat(3, minmax(0,1fr));gap:12px}
        .grid2{display:grid;grid-template-columns:repeat(2, minmax(0,1fr));gap:12px}
        @media (max-width:900px){.grid3{grid-template-columns:1fr}.grid2{grid-template-columns:1fr}}
        .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px}
        .card.inner{background:var(--card-inner)}
        .lbl{font-weight:800;display:block;margin-bottom:8px}
        .hint{color:var(--text-dim);font-size:12px;margin-top:6px}
        .inp{width:100%;padding:18px 14px;border-radius:12px;outline:none;border:1px solid var(--border);background:var(--input);color:#fff;font-size:18px;font-weight:800}
        select.inp{background:var(--input);color:#fff;font-weight:700}
        .pillRow{display:flex;gap:10px;flex-wrap:wrap}
        .pill{padding:12px 18px;border-radius:999px;border:1px solid var(--border);background:transparent;color:#fff;font-weight:800}
        .pill--on{background:var(--azure);color:#041014;border-color:var(--azure)}
        .section{margin:18px 0 8px;font-size:18px;font-weight:800}
        .actions{display:flex;gap:10px;justify-content:flex-end;margin-top:18px}
        .actions.split{justify-content:space-between}
        .btn{background:var(--azure);color:#041014;font-weight:900;padding:12px 18px;border:none;border-radius:14px}
        .btn:disabled{opacity:.5;cursor:not-allowed}
        .btnGhost{background:transparent;color:#e6eaf0;border:1px solid var(--border);padding:12px 18px;border-radius:14px}
        .adoptGrid{display:grid;grid-template-columns:1fr 360px;gap:12px}
        @media (max-width:1000px){.adoptGrid{grid-template-columns:1fr}}
        .range{width:100%}
        .ticks{display:flex;justify-content:space-between;margin-top:6px;color:var(--text-dim);font-weight:700}
        .sel{margin-top:10px;font-size:15px}
        .estTitle{font-weight:800;font-size:14px;color:var(--text-dim)}
        .estGrid{display:grid;grid-template-columns:repeat(2, minmax(0,1fr));gap:12px;margin-top:10px}
        .prioGrid{display:grid;grid-template-columns:repeat(3, minmax(0,1fr));gap:10px}
        @media (max-width:900px){.prioGrid{grid-template-columns:1fr}}
        .priority{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;cursor:pointer}
        .priority--active{outline:2px solid var(--azure);background:var(--azure-12)}
        .priority--disabled{opacity:.45;cursor:not-allowed}
        .prioHead{display:flex;align-items:center;justify-content:space-between}
        .prioTitle{font-weight:800}
        .prioBlurb{color:var(--text-dim);font-size:13px;margin-top:6px}
        .badge{border-radius:999px;padding:6px 10px;border:1px solid var(--border);font-size:12px;color:#fff}
        .badge--on{background:var(--azure);color:#041014;border-color:var(--azure)}
        .bandRow{display:flex;gap:12px;margin-top:14px;flex-wrap:wrap}
        .band{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 16px}
        .band--active{outline:2px solid var(--azure);background:var(--azure-12)}
        .dot{width:16px;height:16px;border-radius:999px;border:2px solid var(--azure)}
        .dot--on{background:var(--azure);box-shadow:0 0 0 4px var(--azure-12)}
        .bandText{display:flex;flex-direction:column}
        .bandTitle{font-weight:900}
        .bandSub{font-size:12px;color:var(--text-dim)}
        .kpis{display:grid;grid-template-columns:repeat(4, minmax(0,1fr));gap:12px}
        @media (max-width:900px){.kpis{grid-template-columns:repeat(2, minmax(0,1fr))}}
        .kpi{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;position:relative}
        .kpi::after{content:"";position:absolute;inset:auto 0 0 0;height:3px;background:var(--azure);border-bottom-left-radius:14px;border-bottom-right-radius:14px}
        .kpiLabel{font-size:12px;color:var(--text-dim);font-weight:800}
        .kpiValue{font-size:24px;font-weight:900;margin-top:4px}
        .table{width:100%;margin-top:14px;border:1px solid var(--border);border-radius:14px;overflow:hidden}
        .thead{display:grid;grid-template-columns:1fr 180px 200px;padding:10px 12px;background:#0f1114;color:var(--text-dim);font-weight:800;font-size:12px}
        .trow{display:grid;grid-template-columns:1fr 180px 200px;padding:14px 12px;border-top:1px solid var(--border)}
        .trow.total{background:#0f1114}
        .tbold{font-weight:900}
        .right{text-align:right}
        .bullets{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px}
      `}</style>
    </div>
  );
}
