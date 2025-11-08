"use client";

import { useMemo, useState } from "react";

/** ───────────────── Types & constants ───────────────── **/
type Currency = "EUR" | "USD" | "GBP" | "AUD";
const SYMBOL: Record<Currency, string> = { EUR: "€", USD: "$", GBP: "£", AUD: "A$" };

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

const ALL_KEYS: PriorityKey[] = [
  "throughput",
  "quality",
  "onboarding",
  "retention",
  "upskilling",
  "costAvoidance",
];

const CONFIG_ORDER: PriorityKey[] = ["throughput", "retention", "upskilling"];

const META: Record<PriorityKey, { label: string; blurb: string }> = {
  throughput: { label: "Throughput", blurb: "Ship faster; reduce cycle time and waiting time." },
  quality: { label: "Quality", blurb: "Fewer reworks; better first-pass yield." },
  onboarding: { label: "Onboarding", blurb: "Ramp new hires faster with AI assist." },
  retention: { label: "Retention", blurb: "Reduce regretted attrition via better tooling." },
  upskilling: { label: "Upskilling", blurb: "Grow competency coverage; unlock compounding gains." },
  costAvoidance: { label: "Cost avoidance", blurb: "Avoid outside spend/overtime via automation." },
};

const maturityToHours = (lvl: number) => {
  const map = [5, 4.5, 4, 3.5, 3, 2.6, 2.2, 1.8, 1.4, 1];
  const idx = Math.min(10, Math.max(1, lvl)) - 1;
  return map[idx];
};

const MATURITY_EXPLAIN = [
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

const AZURE = "#04e1f9";

/** ───────────────── Page ───────────────── **/
export default function Page() {
  /** nav */
  const [step, setStep] = useState(1);
  const next = () => setStep((s) => Math.min(7, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const reset = () => window.location.reload();

  /** Step 1: Team + costs */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState(850);

  /** Step 2: AI Adoption */
  const [maturity, setMaturity] = useState(5);

  /** Step 3: must choose exactly 3 */
  const [selected, setSelected] = useState<PriorityKey[]>(["throughput", "quality", "onboarding"]);

  /** Step 4–6 inputs & estimate presets */
  const [estimateLevel, setEstimateLevel] = useState<"low" | "avg" | "high">("avg");
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);
  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(0.5);

  const handleEstimateChange = (lvl: "low" | "avg" | "high") => {
    setEstimateLevel(lvl);
    const mult = lvl === "low" ? 0.7 : lvl === "high" ? 1.3 : 1;
    setThroughputPct(Math.round(8 * mult));
    setHandoffPct(Math.round(6 * mult));
    setRetentionLiftPct(Math.max(1, Math.round(2 * mult)));
    setUpskillHoursPerWeek(parseFloat((0.5 * mult).toFixed(1)));
  };

  /** calcs */
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const maturityHoursPerPerson = maturityToHours(maturity);
  const maturityHoursTeam = Math.round(maturityHoursPerPerson * headcount);
  const baseWeeklyTeamHours = maturityHoursPerPerson * headcount;

  const weeklyByPriority = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100))
        : 0,
      quality: selected.includes("quality")
        ? Math.round(baseWeeklyTeamHours * 0.12)
        : 0,
      onboarding: selected.includes("onboarding")
        ? Math.round(((6 * 40) * (headcount * 0.1)) / 52) // toned down onboarding
        : 0,
      retention: selected.includes("retention")
        ? Math.round(((headcount * (baselineAttritionPct / 100)) * (retentionLiftPct / 100) * 80) / 52)
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * upskillHoursPerWeek)
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

  const weeklyTotal = Object.values(weeklyByPriority).reduce((a, b) => a + b, 0);
  const monthlyValue = weeklyTotal * hourlyCost * 4;
  const programCost = headcount * trainingPerEmployee;
  const annualValue = monthlyValue * 12;
  const annualROI = programCost === 0 ? 0 : annualValue / programCost;
  const paybackMonths = monthlyValue === 0 ? Infinity : programCost / monthlyValue;
  const symbol = SYMBOL[currency];

  /** config step flow (fix for jumping straight to results) */
  const selectedConfigOrder = useMemo(
    () => CONFIG_ORDER.filter((k) => selected.includes(k)),
    [selected]
  );

  const firstConfigStep = useMemo(() => {
    if (selectedConfigOrder[0] === "throughput") return 4;
    if (selectedConfigOrder[0] === "retention") return 5;
    if (selectedConfigOrder[0] === "upskilling") return 6;
    return 7;
  }, [selectedConfigOrder]);

  const goFromPriorities = () => {
    if (selected.length !== 3) return; // must pick three
    setStep(firstConfigStep);
  };

  const goNextConfig = (current: number) => {
    const currentKey: PriorityKey | null =
      current === 4 ? "throughput" : current === 5 ? "retention" : current === 6 ? "upskilling" : null;

    if (!currentKey) {
      setStep(7);
      return;
    }

    // find the next chosen config key in order
    const idx = selectedConfigOrder.indexOf(currentKey);
    const nextKey = selectedConfigOrder[idx + 1];

    if (!nextKey) {
      setStep(7);
      return;
    }

    if (nextKey === "throughput") setStep(4);
    else if (nextKey === "retention") setStep(5);
    else if (nextKey === "upskilling") setStep(6);
    else setStep(7);
  };

  /** UI bits */
  const steps = [
    { id: 1, label: "Team" },
    { id: 2, label: "AI Adoption" },
    { id: 3, label: "Team Priorities" },
    { id: 4, label: "Throughput" },
    { id: 5, label: "Retention" },
    { id: 6, label: "Upskilling" },
    { id: 7, label: "Results" },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* hero */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <img
          src="/hero.png"
          alt="Hero"
          className="w-full h-56 md:h-64 object-cover rounded-xl"
          style={{ objectPosition: "center" }}
        />
      </div>

      {/* progress (azure) */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "#13161a" }}>
          <div
            className="h-1 rounded-full"
            style={{
              width: `${((step - 1) / (steps.length - 1)) * 100}%`,
              background: AZURE,
              transition: "width 200ms",
            }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: step >= s.id ? AZURE : "#1b1f24",
                  color: step >= s.id ? "black" : "#94a3b8",
                }}
              >
                {s.id}
              </div>
              <div className="text-sm" style={{ color: step >= s.id ? "white" : "#9ca3af" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* main panel (no brown — neutral deep greys) */}
      <div className="max-w-6xl mx-auto px-4 mt-4 pb-16">
        <div
          className="rounded-2xl p-5 md:p-6"
          style={{ background: "#0b0e11", border: "1px solid #1f2937" }}
        >
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Team</h2>
              <p className="text-zinc-400 text-sm mb-4">Program cost assumptions included below.</p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                  <label className="block text-sm text-zinc-400 mb-1">Department</label>
                  <select
                    className="w-full rounded-lg px-3 py-2 font-semibold"
                    style={{ background: "#111418", border: "1px solid #2a3441" }}
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
                </div>

                <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                  <label className="block text-sm text-zinc-400 mb-1">Employees in scope</label>
                  <input
                    type="number"
                    className="w-full rounded-lg px-3 py-2 font-bold text-white"
                    style={{ background: "#111418", border: "1px solid #2a3441" }}
                    value={headcount}
                    onChange={(e) => setHeadcount(parseInt(e.target.value || "0", 10))}
                  />
                </div>

                <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                  <label className="block text-sm text-zinc-400 mb-2">Currency</label>
                  <div className="flex flex-wrap gap-2">
                    {(["EUR", "USD", "GBP", "AUD"] as Currency[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className="px-3 py-1.5 rounded-full text-sm"
                        style={{
                          border: `1px solid ${currency === c ? AZURE : "#2a3441"}`,
                          background: currency === c ? "#0f1419" : "#0a0e12",
                          color: "white",
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold mt-8 mb-2">Program cost assumptions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                  <label className="block text-sm text-zinc-400 mb-1">
                    Average annual salary ({SYMBOL[currency]})
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg px-3 py-2 font-bold text-white"
                    style={{ background: "#111418", border: "1px solid #2a3441" }}
                    value={avgSalary}
                    onChange={(e) => setAvgSalary(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                  <label className="block text-sm text-zinc-400 mb-1">
                    Training per employee ({SYMBOL[currency]})
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg px-3 py-2 font-bold text-white"
                    style={{ background: "#111418", border: "1px solid #2a3441" }}
                    value={trainingPerEmployee}
                    onChange={(e) => setTrainingPerEmployee(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                  <label className="block text-sm text-zinc-400 mb-1">Program duration (months)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg px-3 py-2 font-bold text-white"
                    style={{ background: "#111418", border: "1px solid #2a3441" }}
                    value={3}
                    readOnly
                  />
                  <div className="text-xs text-zinc-500 mt-1">Fixed for now</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg"
                  style={{ border: "1px solid #2a3441", color: "#d1d5db" }}
                  onClick={back}
                >
                  ← Back
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-semibold"
                  style={{ background: AZURE, color: "black" }}
                  onClick={next}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">AI Adoption</h2>
              <p className="text-zinc-400 text-sm mb-4">
                Gauge your current adoption level to estimate baseline time savings.
              </p>

              <div className="grid md:grid-cols-[1fr_360px] gap-6">
                <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                  <label className="block text-sm text-zinc-400 mb-2">Where are you today? (1–10)</label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={maturity}
                    onChange={(e) => setMaturity(parseInt(e.target.value, 10))}
                    className="w-full"
                    style={{ accentColor: AZURE }}
                  />
                  <div className="flex justify-between mt-2 text-[13px] text-zinc-400 font-semibold">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>
                  <div className="mt-4 text-[15px]">
                    <span className="font-bold">Selected: {maturity} — </span>
                    {MATURITY_EXPLAIN[maturity - 1]}
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                  <div className="text-sm font-semibold text-zinc-300">Estimated hours saved</div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="rounded-lg p-3" style={{ background: "#0e1318", border: "1px solid #1f2937" }}>
                      <div className="text-xs text-zinc-400">Per employee / week</div>
                      <div className="text-3xl font-extrabold">{maturityToHours(maturity).toFixed(1)}</div>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: "#0e1318", border: "1px solid #1f2937" }}>
                      <div className="text-xs text-zinc-400">Team / week</div>
                      <div className="text-3xl font-extrabold">{maturityHoursTeam.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-zinc-500">Refine via priorities and training below.</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg"
                  style={{ border: "1px solid #2a3441", color: "#d1d5db" }}
                  onClick={back}
                >
                  ← Back
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-semibold"
                  style={{ background: AZURE, color: "black" }}
                  onClick={next}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Team Priorities</h2>
              <p className="text-zinc-400 text-sm mb-4">Select exactly three areas to continue.</p>
              <div className="grid md:grid-cols-3 gap-3">
                {ALL_KEYS.map((k) => {
                  const active = selected.includes(k);
                  const disabled = !active && selected.length >= 3;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        if (active) setSelected(selected.filter((x) => x !== k));
                        else if (!disabled) setSelected([...selected, k]);
                      }}
                      className="text-left rounded-xl p-4"
                      style={{
                        background: active ? "#0f1419" : "#0a0e12",
                        border: `1px solid ${active ? AZURE : "#2a3441"}`,
                        opacity: disabled ? 0.5 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <div className="font-semibold">{META[k].label}</div>
                      <div className="text-xs text-zinc-400 mt-1">{META[k].blurb}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg"
                  style={{ border: "1px solid #2a3441", color: "#d1d5db" }}
                  onClick={back}
                >
                  ← Back
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-semibold"
                  style={{
                    background: selected.length === 3 ? AZURE : "#0d0f12",
                    color: selected.length === 3 ? "black" : "#777",
                    border: "1px solid #2a3441",
                  }}
                  onClick={goFromPriorities}
                  disabled={selected.length !== 3}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 4–6 */}
          {(step === 4 || step === 5 || step === 6) && (
            <div>
              <div className="flex items-center gap-6 mb-6">
                <h2 className="text-2xl font-bold">
                  {step === 4 && "Throughput"}
                  {step === 5 && "Retention"}
                  {step === 6 && "Upskilling"}
                </h2>

                {/* Estimate boxes (Low / Average / High) */}
                <div className="flex gap-3">
                  {(["low", "avg", "high"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleEstimateChange(lvl)}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                      style={{
                        border: `1px solid ${estimateLevel === lvl ? AZURE : "#2a3441"}`,
                        background: estimateLevel === lvl ? "#0f1419" : "#0a0e12",
                      }}
                    >
                      {lvl === "low" && (
                        <>
                          Low
                          <div className="text-[11px] text-zinc-400">(Conservative)</div>
                        </>
                      )}
                      {lvl === "avg" && <>Average</>}
                      {lvl === "high" && (
                        <>
                          High
                          <div className="text-[11px] text-zinc-400">(Aggressive)</div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {step === 4 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                    <label className="block text-sm text-zinc-400 mb-1">Time reclaimed %</label>
                    <input
                      type="number"
                      className="w-full rounded-lg px-3 py-2 font-bold text-white"
                      style={{ background: "#111418", border: "1px solid #2a3441" }}
                      value={throughputPct}
                      onChange={(e) => setThroughputPct(parseInt(e.target.value || "0", 10))}
                    />
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                    <label className="block text-sm text-zinc-400 mb-1">Handoffs reduced %</label>
                    <input
                      type="number"
                      className="w-full rounded-lg px-3 py-2 font-bold text-white"
                      style={{ background: "#111418", border: "1px solid #2a3441" }}
                      value={handoffPct}
                      onChange={(e) => setHandoffPct(parseInt(e.target.value || "0", 10))}
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                    <label className="block text-sm text-zinc-400 mb-1">Attrition avoided %</label>
                    <input
                      type="number"
                      className="w-full rounded-lg px-3 py-2 font-bold text-white"
                      style={{ background: "#111418", border: "1px solid #2a3441" }}
                      value={retentionLiftPct}
                      onChange={(e) => setRetentionLiftPct(parseInt(e.target.value || "0", 10))}
                    />
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                    <label className="block text-sm text-zinc-400 mb-1">Baseline attrition %</label>
                    <input
                      type="number"
                      className="w-full rounded-lg px-3 py-2 font-bold text-white"
                      style={{ background: "#111418", border: "1px solid #2a3441" }}
                      value={baselineAttritionPct}
                      onChange={(e) => setBaselineAttritionPct(parseInt(e.target.value || "0", 10))}
                    />
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                    <label className="block text-sm text-zinc-400 mb-1">Coverage target %</label>
                    <input
                      type="number"
                      className="w-full rounded-lg px-3 py-2 font-bold text-white"
                      style={{ background: "#111418", border: "1px solid #2a3441" }}
                      value={upskillCoveragePct}
                      onChange={(e) => setUpskillCoveragePct(parseInt(e.target.value || "0", 10))}
                    />
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "#07090c", border: "1px solid #1f2937" }}>
                    <label className="block text-sm text-zinc-400 mb-1">Hours / week per person</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-lg px-3 py-2 font-bold text-white"
                      style={{ background: "#111418", border: "1px solid #2a3441" }}
                      value={upskillHoursPerWeek}
                      onChange={(e) => setUpskillHoursPerWeek(parseFloat(e.target.value || "0"))}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg"
                  style={{ border: "1px solid #2a3441", color: "#d1d5db" }}
                  onClick={back}
                >
                  ← Back
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-semibold"
                  style={{ background: AZURE, color: "black" }}
                  onClick={() => goNextConfig(step)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 7 */}
          {step === 7 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Results</h2>

              {/* KPIs with subtle azure accents */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { label: "Total annual value", value: `${symbol}${Math.round(annualValue).toLocaleString()}` },
                  { label: "Annual ROI", value: `${annualROI.toFixed(1)}×` },
                  {
                    label: "Payback",
                    value: isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : "—",
                  },
                  { label: "Total hours saved (est.)", value: (weeklyTotal * 52).toLocaleString() },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="rounded-xl p-4"
                    style={{ background: "#07090c", border: `1px solid ${AZURE}` }}
                  >
                    <div className="text-sm text-zinc-400">{k.label}</div>
                    <div className="text-2xl font-extrabold mt-1">{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Breakdown table */}
              <div className="mt-6 rounded-2xl overflow-hidden" style={{ border: "1px solid #1f2937" }}>
                <div
                  className="grid grid-cols-[1fr_180px_200px] py-3 px-4 text-xs font-semibold"
                  style={{ background: "#0f1318", color: "#a3aab3" }}
                >
                  <div>PRIORITY</div>
                  <div className="text-right">HOURS SAVED</div>
                  <div className="text-right">ANNUAL VALUE</div>
                </div>

                {ALL_KEYS.filter((k) => selected.includes(k)).map((k) => {
                  const hours = Math.round(weeklyByPriority[k] * 52);
                  const value = hours * hourlyCost;
                  return (
                    <div
                      key={k}
                      className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4"
                      style={{ borderTop: "1px solid #1f2937" }}
                    >
                      <div>
                        <div className="font-bold">{META[k].label}</div>
                        <div className="text-sm text-zinc-400">{META[k].blurb}</div>
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
                  className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4"
                  style={{ borderTop: "1px solid #1f2937", background: "#0f1318" }}
                >
                  <div className="font-extrabold">Total</div>
                  <div className="text-right font-extrabold">{(weeklyTotal * 52).toLocaleString()} h</div>
                  <div className="text-right font-extrabold">
                    {symbol}
                    {Math.round(annualValue).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Next steps */}
              <div
                className="rounded-xl p-4 mt-6"
                style={{ background: "#07090c", border: "1px solid #1f2937" }}
              >
                <div className="text-sm font-bold mb-2">Next steps</div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-400">
                  <li>Map top 3 workflows → ship prompt templates & QA/guardrails within 2 weeks.</li>
                  <li>Launch “AI Champions” cohort; set quarterly ROI reviews; track usage vs retention.</li>
                  <li>Set competency coverage target to 60% and measure weekly AI-in-task usage.</li>
                </ul>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  className="px-4 py-2 rounded-lg"
                  style={{ border: "1px solid #2a3441", color: "#d1d5db" }}
                  onClick={back}
                >
                  ← Back
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-semibold"
                  style={{ background: AZURE, color: "black" }}
                  onClick={reset}
                >
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
