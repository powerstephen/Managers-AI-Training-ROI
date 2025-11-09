"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Tailwind assumptions:
 * - Dark background (e.g., className="bg-black text-white").
 * - You can tune the azure color below to match your brand.
 */
const AZURE = "#00D7FF";

/** Utility: currency + number formatters */
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    isFinite(n) ? n : 0
  );
const fmtNumber = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(isFinite(n) ? n : 0);
const fmtOneDecimal = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(isFinite(n) ? n : 0);

/**
 * Replace this with your real backend.
 * Expected response: { costPerSeat: number }
 * The Program Cost = costPerSeat * numberTrained (computed client-side).
 */
async function fetchCosts(): Promise<{ costPerSeat: number }> {
  try {
    const res = await fetch("/api/costs", { cache: "no-store" });
    if (!res.ok) throw new Error("Non-200");
    return (await res.json()) as { costPerSeat: number };
  } catch {
    // Fallback if API not wired yet — change/remove as soon as your API is live.
    return { costPerSeat: 399 }; // stub default
  }
}

/** A pill-style metric card with glowing azure border */
function MetricPill({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-[28px] px-6 py-5 shadow-xl"
      style={{
        background: "rgba(0,0,0,0.85)",
        boxShadow: `0 6px 0 rgba(0,0,0,0.5), 0 0 0 2px ${AZURE}`,
      }}
    >
      <div className="text-sm opacity-80">{label}</div>
      <div className="text-xl font-semibold leading-tight mt-1">{value}</div>
      {/* subtle drop "plate" */}
      <div
        className="absolute -bottom-2 left-2 right-2 h-2 rounded-[20px] opacity-30"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.7))" }}
      />
    </div>
  );
}

/** Big Annual ROI tile */
function RoiTile({ roiMultiple }: { roiMultiple: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[28px] w-full h-full min-h-[220px] p-6"
      style={{
        boxShadow: `0 0 0 3px ${AZURE}`,
        background: "rgba(0,0,0,0.85)",
      }}
    >
      <div className="text-lg font-semibold" style={{ color: AZURE }}>
        Annual ROI
      </div>
      <div className="text-6xl md:text-7xl font-extrabold mt-2" style={{ color: AZURE }}>
        {fmtOneDecimal(roiMultiple)}<span className="text-5xl align-top">×</span>
      </div>
    </div>
  );
}

/** Azure-filled slider with glow up to current value */
function AzureSlider({
  value,
  setValue,
  min = 0,
  max = 100,
  step = 1,
  label,
}: {
  value: number;
  setValue: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm opacity-80">{label}</label>
        <div className="text-sm font-medium" style={{ color: AZURE }}>
          {Math.round(pct)}%
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-3 rounded-full appearance-none outline-none"
        style={{
          background: `linear-gradient(to right, ${AZURE} ${pct}%, #121212 ${pct}%)`,
          boxShadow: `inset 0 0 6px rgba(0,0,0,0.7)`,
        }}
      />
      {/* custom thumb */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: ${AZURE};
          box-shadow: 0 0 12px ${AZURE};
          border: 2px solid black;
          cursor: pointer;
          margin-top: -8px;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: ${AZURE};
          border: 2px solid black;
          box-shadow: 0 0 12px ${AZURE};
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default function Page() {
  // === Inputs that remain in the questionnaire ===
  const [totalEmployees, setTotalEmployees] = useState<number>(150);
  const [averageSalary, setAverageSalary] = useState<number>(80000);
  const [adoptionPct, setAdoptionPct] = useState<number>(40); // AI Adoption slider

  // === Costs from backend ===
  const [costPerSeat, setCostPerSeat] = useState<number>(399); // default until API returns
  useEffect(() => {
    fetchCosts().then((d) => setCostPerSeat(d.costPerSeat));
  }, []);

  // === Assumptions (adjust freely or move to backend) ===
  const HOURS_SAVED_PER_WEEK = 2.5; // per trained employee
  const PRODUCTIVE_WEEKS = 48; // working weeks
  const HOURS_PER_WEEK = 40; // for hourly salary calc

  // === Derived ===
  const numberTrained = useMemo(
    () => Math.round((totalEmployees * adoptionPct) / 100),
    [totalEmployees, adoptionPct]
  );

  const hourlySalary = useMemo(
    () => (averageSalary > 0 ? averageSalary / (52 * HOURS_PER_WEEK) : 0),
    [averageSalary]
  );

  const totalHoursSaved = useMemo(
    () => numberTrained * HOURS_SAVED_PER_WEEK * PRODUCTIVE_WEEKS,
    [numberTrained]
  );

  const totalValue = useMemo(
    () => totalHoursSaved * hourlySalary,
    [totalHoursSaved, hourlySalary]
  );

  const programCost = useMemo(
    () => numberTrained * costPerSeat,
    [numberTrained, costPerSeat]
  );

  const monthlyValue = useMemo(() => totalValue / 12, [totalValue]);

  const paybackMonths = useMemo(
    () => (monthlyValue > 0 ? programCost / monthlyValue : Infinity),
    [programCost, monthlyValue]
  );

  const roiMultiple = useMemo(
    () => (programCost > 0 ? totalValue / programCost : 0),
    [totalValue, programCost]
  );

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">HR Digitisation — Business Case Builder</h1>

        {/* ===== Questionnaire (Program Cost Assumptions removed) ===== */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)" }}>
            <label className="block text-sm mb-1 opacity-80">Total Employees</label>
            <input
              type="number"
              className="w-full bg-[#0e0e0f] border border-neutral-800 rounded-lg px-3 py-2"
              value={totalEmployees}
              min={1}
              onChange={(e) => setTotalEmployees(Number(e.target.value))}
            />
          </div>

          <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)" }}>
            <label className="block text-sm mb-1 opacity-80">Average Salary</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="w-full bg-[#0e0e0f] border border-neutral-800 rounded-lg px-3 py-2"
                value={averageSalary}
                min={0}
                onChange={(e) => setAverageSalary(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)" }}>
            <AzureSlider
              value={adoptionPct}
              setValue={setAdoptionPct}
              label="AI Adoption (trained % of employees)"
            />
          </div>
        </div>

        {/* ===== Results Header (replaces the old four boxes) ===== */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch mb-10">
          {/* Left: Big ROI Tile */}
          <div className="md:col-span-1">
            <RoiTile roiMultiple={roiMultiple} />
          </div>

          {/* Right: Two rows of metric pills */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <MetricPill label="Total Value" value={fmtCurrency(totalValue)} />
            <MetricPill label="Total Hours Saved" value={fmtNumber(totalHoursSaved)} />
            <MetricPill label="Payback Period" value={`${fmtOneDecimal(paybackMonths)} months`} />
            <MetricPill label="No. Trained" value={fmtNumber(numberTrained)} />
            <MetricPill label="Cost Per Seat" value={fmtCurrency(costPerSeat)} />
            <MetricPill label="Program Cost" value={fmtCurrency(programCost)} />
          </div>
        </div>

        {/* ===== Optional details section ===== */}
        <div className="rounded-xl p-5 space-y-2" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="text-sm opacity-80">Assumptions (editable in code or backend)</div>
          <ul className="text-sm leading-6 opacity-90">
            <li>Hours saved per trained employee per week: <span className="font-mono">{HOURS_SAVED_PER_WEEK}</span></li>
            <li>Productive weeks per year: <span className="font-mono">{PRODUCTIVE_WEEKS}</span></li>
            <li>Derived hourly salary = Average Salary / (52 × {HOURS_PER_WEEK})</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
