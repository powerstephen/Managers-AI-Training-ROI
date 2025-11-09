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

type WizardStep =
  | "team"
  | "adoption"
  | "priorities"
  | "throughput"
  | "retention"
  | "upskilling"
  | "results";

const ALL_STEPS = [
  { id: 1, key: "team", label: "Team" },
  { id: 2, key: "adoption", label: "AI Adoption" },
  { id: 3, key: "priorities", label: "Team Priorities" },
  { id: 4, key: "throughput", label: "Throughput" },
  { id: 5, key: "retention", label: "Retention" },
  { id: 6, key: "upskilling", label: "Upskilling" },
  { id: 7, key: "results", label: "Results" },
];

/* ---------- Helpers ---------- */
const AZURE = "#00D7FF";
const maturityToHours = (lvl: number) =>
  [5, 4.5, 4, 3.5, 3, 2.6, 2.2, 1.8, 1.4, 1][lvl - 1] || 1;

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

/* ---------- UI helpers ---------- */
function Pill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="rounded-[20px] px-5 py-4 text-center"
      style={{
        background: "rgba(0,0,0,0.85)",
        boxShadow: `0 0 0 2px ${AZURE}`,
      }}
    >
      <div className="text-sm opacity-80">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

function RoiTile({ value }: { value: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[20px] p-4 h-full"
      style={{
        background: "rgba(0,0,0,0.85)",
        boxShadow: `0 0 0 2px ${AZURE}`,
      }}
    >
      <div className="text-lg font-semibold" style={{ color: AZURE }}>
        Annual ROI
      </div>
      <div
        className="text-5xl font-extrabold mt-2"
        style={{ color: AZURE }}
      >
        {value.toFixed(1)}×
      </div>
    </div>
  );
}

/* ---------- Component ---------- */
export default function Page() {
  const [stepKey, setStepKey] = useState<WizardStep>("team");
  const go = (k: WizardStep) => setStepKey(k);
  const back = () => {
    const f = currentFlow();
    const i = f.indexOf(stepKey);
    if (i > 0) setStepKey(f[i - 1]);
  };
  const reset = () => window.location.reload();

  /* team data */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);

  const seatUSD = headcount >= 1000 ? 299 : headcount >= 100 ? 349 : 399;
  const symbol = CURRENCY_SYMBOL[currency];
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const programCost = useMemo(() => headcount * seatUSD, [headcount, seatUSD]);

  const [adoption, setAdoption] = useState(5);
  const maturityHoursPerPerson = useMemo(() => maturityToHours(adoption), [adoption]);
  const maturityHoursTeam = Math.round(maturityHoursPerPerson * headcount);
  const numberTrained = Math.round(headcount * (adoption / 10));

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

  /* Priority settings */
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);
  const [throughputAgg, setThroughputAgg] = useState<"low" | "avg" | "high">("avg");
  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);
  const [retentionAgg, setRetentionAgg] = useState<"low" | "avg" | "high">("avg");
  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(1.5);
  const [upskillingAgg, setUpskillingAgg] = useState<"low" | "avg" | "high">("avg");

  const applyAgg = (k: PriorityKey, l: "low" | "avg" | "high") => {
    if (k === "throughput") {
      setThroughputAgg(l);
      if (l === "low") { setThroughputPct(4); setHandoffPct(3); }
      if (l === "avg") { setThroughputPct(8); setHandoffPct(6); }
      if (l === "high") { setThroughputPct(12); setHandoffPct(10); }
    }
    if (k === "retention") {
      setRetentionAgg(l);
      if (l === "low") { setRetentionLiftPct(1); setBaselineAttritionPct(10); }
      if (l === "avg") { setRetentionLiftPct(2); setBaselineAttritionPct(12); }
      if (l === "high") { setRetentionLiftPct(3); setBaselineAttritionPct(15); }
    }
    if (k === "upskilling") {
      setUpskillingAgg(l);
      if (l === "low") { setUpskillCoveragePct(40); setUpskillHoursPerWeek(1); }
      if (l === "avg") { setUpskillCoveragePct(60); setUpskillHoursPerWeek(1.5); }
      if (l === "high") { setUpskillCoveragePct(80); setUpskillHoursPerWeek(2); }
    }
  };

  /* Core math */
  const baseWeeklyHours = maturityHoursPerPerson * headcount;
  const weeklyHours = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(baseWeeklyHours * ((throughputPct + handoffPct * 0.5) / 100))
        : 0,
      quality: selected.includes("quality") ? Math.round(baseWeeklyHours * 0.2) : 0,
      onboarding: selected.includes("onboarding") ? Math.round(8 * headcount) : 0,
      retention: selected.includes("retention")
        ? Math.round(((headcount * (baselineAttritionPct / 100)) * (retentionLiftPct / 100) * 120) / 52)
        : 0,
      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct / 100) * headcount * upskillHoursPerWeek)
        : 0,
      costAvoidance: 0,
    };
    return v;
  }, [selected, baseWeeklyHours, throughputPct, handoffPct, headcount, retentionLiftPct, baselineAttritionPct, upskillCoveragePct, upskillHoursPerWeek]);

  const weeklyTotal = Object.values(weeklyHours).reduce((a, b) => a + b, 0);
  const monthlyValue = weeklyTotal * hourlyCost * 4;
  const annualValue = monthlyValue * 12;
  const annualROI = programCost ? annualValue / programCost : 0;
  const paybackMonths = monthlyValue ? programCost / monthlyValue : Infinity;

  /* Flow helpers */
  const currentFlow = (): WizardStep[] => {
    const steps: WizardStep[] = ["team", "adoption", "priorities"];
    const chosen: WizardStep[] = ["throughput", "retention", "upskilling"].filter(
      (k) => selected.includes(k as PriorityKey)
    ) as WizardStep[];
    return [...steps, ...chosen, "results"];
  };
  const CONTINUE = () => {
    if (stepKey === "priorities" && selected.length < 3) return;
    const f = currentFlow();
    const i = f.indexOf(stepKey);
    if (i < f.length - 1) setStepKey(f[i + 1]);
  };

  const nextChosenConfig = (cur: "throughput" | "retention" | "upskilling"): WizardStep | null => {
    const order: WizardStep[] = ["throughput", "retention", "upskilling"];
    const idx = order.indexOf(cur);
    for (let i = idx + 1; i < order.length; i++) {
      if (selected.includes(order[i] as PriorityKey)) return order[i];
    }
    return null;
  };

  const stepIndex = ALL_STEPS.find((s) => s.key === stepKey)?.id ?? 1;
  const visibleProgress = ((stepIndex - 1) / (ALL_STEPS.length - 1)) * 100;

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text)" }}>
      <style jsx>{`
        .progress-rail {
          width: 100%;
          height: 10px;
          border-radius: 9999px;
          background: #0c0f14;
          box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.7);
        }
        .progress-fill {
          height: 10px;
          border-radius: 9999px;
          background: ${AZURE};
          box-shadow: 0 0 10px ${AZURE}, 0 0 4px ${AZURE} inset;
        }
        input.range-slim::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          margin-top: -4px; /* aligns thumb with track */
          border-radius: 50%;
          background: ${AZURE};
          border: 2px solid #000;
          box-shadow: 0 0 10px ${AZURE};
        }
        .agg-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 18px;
        }
        .agg-box {
          padding: 10px 14px;
          border-radius: 20px;
          background: #1a1a1a;
          border: 1px solid #333;
          text-align: center;
          width: 110px;
        }
        .agg-box--on {
          background: ${AZURE};
          color: #000;
          font-weight: 600;
        }
      `}</style>

      {/* Header */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img src="/hero.png" alt="AI at Work — Brainster" className="hero-img shadow-soft" />
      </div>

      {/* Progress */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="panel">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              {ALL_STEPS.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className={`step-chip ${stepIndex >= s.id ? "step-chip--on" : "step-chip--off"}`}>{s.id}</span>
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

      {/* Body */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4 pb-16">
        <div className="panel">
          {/* (Team, Adoption, Priorities, Configs same as before)... */}
          {/* STEP: Results */}
          {stepKey === "results" && (
            <div>
              <h2 className="title">Results</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="row-span-2 aspect-square">
                  <RoiTile value={annualROI} />
                </div>
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  <Pill label="Total Value" value={`${symbol}${Math.round(annualValue).toLocaleString()}`} />
                  <Pill label="Total Hours Saved" value={(weeklyTotal * 52).toLocaleString()} />
                  <Pill label="Payback Period" value={`${paybackMonths.toFixed(1)} months`} />
                  <Pill label="No. Trained" value={numberTrained.toLocaleString()} />
                  <Pill label="Cost per Seat" value={`${symbol}${seatUSD}`} />
                  <Pill label="Program Cost" value={`${symbol}${(seatUSD * headcount).toLocaleString()}`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
