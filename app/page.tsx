"use client";

import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Types & constants */
/* ------------------------------------------------------------------ */
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

const CONFIGURABLE: PriorityKey[] = ["throughput", "retention", "upskilling"];

const PRIORITY_META: Record<
  PriorityKey,
  { label: string; blurb: string; defaultOn?: boolean }
> = {
  throughput: { label: "Throughput", blurb: "Ship faster; reduce cycle time.", defaultOn: true },
  quality: { label: "Quality", blurb: "Fewer reworks; better first-pass yield.", defaultOn: true },
  onboarding: { label: "Onboarding", blurb: "Ramp new hires faster with AI assist.", defaultOn: true },
  retention: { label: "Retention", blurb: "Reduce regretted attrition via better tooling." },
  upskilling: { label: "Upskilling", blurb: "Grow competency coverage; unlock compounding gains." },
  costAvoidance: { label: "Cost avoidance", blurb: "Avoid outside spend/overtime via automation." },
};

/* Utility for AI Adoption */
const maturityToHours = (lvl: number) => {
  const map = [5, 4.5, 4, 3.5, 3, 2.6, 2.2, 1.8, 1.4, 1];
  return map[Math.min(10, Math.max(1, lvl)) - 1];
};

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export default function Page() {
  const [step, setStep] = useState(1);
  const next = () => setStep((s) => Math.min(7, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const reset = () => window.location.reload();

  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState(850);

  const [maturity, setMaturity] = useState(5);

  const ALL_KEYS: PriorityKey[] = [
    "throughput", "quality", "onboarding", "retention", "upskilling", "costAvoidance"
  ];
  const [selected, setSelected] = useState<PriorityKey[]>(
    ALL_KEYS.filter((k) => PRIORITY_META[k].defaultOn).slice(0, 3)
  );

  /* Estimates */
  const [estimateLevel, setEstimateLevel] = useState<"low" | "avg" | "high">("avg");

  /* Input states */
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);
  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(0.5);

  /* Adjust metrics dynamically when estimate level changes */
  const handleEstimateChange = (lvl: "low" | "avg" | "high") => {
    setEstimateLevel(lvl);
    const mult = lvl === "low" ? 0.7 : lvl === "high" ? 1.3 : 1;
    setThroughputPct(Math.round(8 * mult));
    setHandoffPct(Math.round(6 * mult));
    setRetentionLiftPct(Math.round(2 * mult));
    setUpskillHoursPerWeek(parseFloat((0.5 * mult).toFixed(1)));
  };

  /* Calculations */
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const maturityHoursPerPerson = maturityToHours(maturity);
  const baseWeeklyTeamHours = maturityHoursPerPerson * headcount;

  const weeklyHours = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100))
        : 0,
      quality: selected.includes("quality") ? Math.round(baseWeeklyTeamHours * 0.2) : 0,
      onboarding: selected.includes("onboarding")
        ? Math.round(((4 * 10) * (headcount * 0.15)) / 52)
        : 0,
      retention: selected.includes("retention")
        ? Math.round(((headcount * (baselineAttritionPct / 100)) * (retentionLiftPct / 100) * 120) / 52)
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * upskillHoursPerWeek)
        : 0,
      costAvoidance: selected.includes("costAvoidance") ? Math.round(baseWeeklyTeamHours * 0.1) : 0,
    };
    return v;
  }, [
    selected, baseWeeklyTeamHours, throughputPct, handoffPct,
    headcount, retentionLiftPct, baselineAttritionPct,
    upskillCoveragePct, upskillHoursPerWeek
  ]);

  const weeklyTotal = Object.values(weeklyHours).reduce((a, b) => a + b, 0);
  const monthlyValue = weeklyTotal * hourlyCost * 4;
  const programCost = headcount * trainingPerEmployee;
  const annualValue = monthlyValue * 12;
  const annualROI = programCost === 0 ? 0 : annualValue / programCost;
  const paybackMonths = monthlyValue === 0 ? Infinity : programCost / monthlyValue;
  const symbol = CURRENCY_SYMBOL[currency];

  /* Step navigation helpers */
  const goToNextSelectedConfig = (current: number) => {
    if (current <= 4 && selected.includes("retention")) return setStep(5);
    if (current <= 5 && selected.includes("upskilling")) return setStep(6);
    setStep(7);
  };
  const goFromPriorities = () => {
    if (selected.length < 3) return; // guard
    if (selected.includes("throughput")) setStep(4);
    else if (selected.includes("retention")) setStep(5);
    else if (selected.includes("upskilling")) setStep(6);
    else setStep(7);
  };

  /* ------------------------------------------------------------------ */
  /* Render */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-[#0b0e11] text-white px-4 pb-16">
      <div className="max-w-6xl mx-auto pt-8">
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Team Priorities</h2>
            <p className="text-sm text-gray-400 mb-4">Select exactly 3 priorities to continue.</p>
            <div className="grid md:grid-cols-3 gap-3">
              {ALL_KEYS.map((k) => {
                const active = selected.includes(k);
                const disabled = !active && selected.length >= 3;
                return (
                  <div
                    key={k}
                    className={`rounded-xl p-4 border ${active ? "border-azure-400 bg-[#14181d]" : "border-gray-700 bg-[#101317]"} ${
                      disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    onClick={() => {
                      if (active) setSelected(selected.filter((x) => x !== k));
                      else if (!disabled) setSelected([...selected, k]);
                    }}
                  >
                    <div className="font-semibold">{PRIORITY_META[k].label}</div>
                    <div className="text-xs text-gray-400 mt-1">{PRIORITY_META[k].blurb}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-ghost" onClick={back}>← Back</button>
              <button
                className={`btn ${selected.length < 3 ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={goFromPriorities}
                disabled={selected.length < 3}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Config steps with estimate selector */}
        {(step === 4 || step === 5 || step === 6) && (
          <div>
            <div className="flex items-center gap-6 mb-6">
              <h2 className="text-2xl font-bold">
                {step === 4 && "Throughput"}
                {step === 5 && "Retention"}
                {step === 6 && "Upskilling"}
              </h2>
              <div className="flex gap-3">
                {(["low", "avg", "high"] as const).map((lvl) => (
                  <div
                    key={lvl}
                    onClick={() => handleEstimateChange(lvl)}
                    className={`px-3 py-1.5 rounded-lg border cursor-pointer ${
                      estimateLevel === lvl ? "border-azure-400 bg-[#14181d]" : "border-gray-700 bg-[#101317]"
                    }`}
                  >
                    <div className="font-semibold capitalize">
                      {lvl === "low" && <>Low <span className="text-xs text-gray-400">(Conservative)</span></>}
                      {lvl === "avg" && <>Average</>}
                      {lvl === "high" && <>High <span className="text-xs text-gray-400">(Aggressive)</span></>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {step === 4 && (
              <div className="grid md:grid-cols-2 gap-4">
                <div><label>Time reclaimed %</label>
                  <input type="number" value={throughputPct} onChange={(e)=>setThroughputPct(+e.target.value)} className="inp" /></div>
                <div><label>Handoffs reduced %</label>
                  <input type="number" value={handoffPct} onChange={(e)=>setHandoffPct(+e.target.value)} className="inp" /></div>
              </div>
            )}
            {step === 5 && (
              <div className="grid md:grid-cols-2 gap-4">
                <div><label>Attrition avoided %</label>
                  <input type="number" value={retentionLiftPct} onChange={(e)=>setRetentionLiftPct(+e.target.value)} className="inp" /></div>
                <div><label>Baseline attrition %</label>
                  <input type="number" value={baselineAttritionPct} onChange={(e)=>setBaselineAttritionPct(+e.target.value)} className="inp" /></div>
              </div>
            )}
            {step === 6 && (
              <div className="grid md:grid-cols-2 gap-4">
                <div><label>Coverage target %</label>
                  <input type="number" value={upskillCoveragePct} onChange={(e)=>setUpskillCoveragePct(+e.target.value)} className="inp" /></div>
                <div><label>Hours / week per person</label>
                  <input type="number" value={upskillHoursPerWeek} onChange={(e)=>setUpskillHoursPerWeek(+e.target.value)} className="inp" /></div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-ghost" onClick={back}>← Back</button>
              <button className="btn" onClick={() => goToNextSelectedConfig(step)}>Continue →</button>
            </div>
          </div>
        )}

        {/* Final results stay the same for brevity */}
      </div>
    </div>
  );
}
