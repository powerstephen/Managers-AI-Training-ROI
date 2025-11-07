"use client";

import BrandHero from "@/components/BrandHero";
import { Stepper } from "@/components/Stepper";
import { Actions, CurrencySwitch, Field, Row, SectionCard, formatMoney } from "@/components/UiBits";
import { useMemo, useState } from "react";

type Currency = "EUR" | "USD" | "GBP" | "AUD";
type Dept =
  | "Company-wide"
  | "Marketing"
  | "Sales"
  | "Customer Support"
  | "Operations"
  | "Engineering"
  | "HR";

type Priority = "throughput" | "retention" | "upskilling";

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "AI Maturity" },
  { id: 3, label: "Pick top 3 priorities" },
  { id: 4, label: "Configure: Throughput" },
  { id: 5, label: "Configure: Retention" },
  { id: 6, label: "Configure: Upskilling" },
  { id: 7, label: "Results" },
];

export default function Page() {
  // wizard state
  const [step, setStep] = useState<number>(1);

  // basics
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState<number>(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState<number>(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [durationMonths, setDurationMonths] = useState<number>(3);

  // maturity (1–10)
  const [maturity, setMaturity] = useState<number>(4);

  // priorities (fixed 3 as per screenshot flow)
  const [priorities] = useState<Priority[]>(["throughput", "retention", "upskilling"]);

  // configure: throughput
  const [hoursPerEmployeePerWeek, setHoursPerEmployeePerWeek] = useState<number>(2.0);

  // configure: retention
  const [annualTurnoverRate, setAnnualTurnoverRate] = useState<number>(18); // %
  const [improvementPct, setImprovementPct] = useState<number>(10); // reduce churn by X%

  // configure: upskilling
  const [coverageTargetPct, setCoverageTargetPct] = useState<number>(60); // % of team
  const [weeklyHoursPerCompetent, setWeeklyHoursPerCompetent] = useState<number>(1.0);

  // derived
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]); // crude
  const maturityHoursAdjust = useMemo(() => {
    // simple scale: at 1 => 1h/day (~5/w), at 10 => ~1h/w (already optimized)
    const min = 1; // h/week at maturity 10
    const max = 5; // h/week at maturity 1
    const t = (10 - maturity) / 9; // 1 -> 1, 10 -> 0
    return min + (max - min) * t; // hours/week baseline suggestion
  }, [maturity]);

  // calculations
  const res = useMemo(() => {
    // Throughput: employee weekly hours * headcount * 52 * hourly cost
    const tpHoursYear = hoursPerEmployeePerWeek * headcount * 52;
    const tpValue = tpHoursYear * hourlyCost;

    // Retention: avoided replacements = headcount * turnover% * improvement% * replacementCost
    const replacementCost = avgSalary * 0.5; // conservative 50% salary replacement cost
    const avoided = headcount * (annualTurnoverRate / 100) * (improvementPct / 100);
    const retValue = avoided * replacementCost;

    // Upskilling: coverage% * headcount * weekly hours per competent * 52 * hourly cost
    const upskilled = (coverageTargetPct / 100) * headcount;
    const upHoursYear = upskilled * weeklyHoursPerCompetent * 52;
    const upValue = upHoursYear * hourlyCost;

    const totalHours = Math.round(tpHoursYear + upHoursYear);
    const totalValue = tpValue + retValue + upValue;

    const programCost = headcount * trainingPerEmployee;
    const paybackMonths = Math.max(0.1, (programCost / (totalValue / 12)));
    const annualRoiMultiple = totalValue / programCost;

    return {
      kpis: {
        totalValue,
        annualRoiMultiple,
        paybackMonths,
        totalHours,
      },
      table: [
        {
          key: "throughput",
          title: "Throughput",
          note: "~faster cycles from workflow redesign + prompt templates",
          hours: Math.round(tpHoursYear),
          value: tpValue,
        },
        {
          key: "retention",
          title: "Retention",
          note: "Avoided replacement costs from lower regretted churn",
          hours: undefined,
          value: retValue,
        },
        {
          key: "upskilling",
          title: "Upskilling",
          note: `${coverageTargetPct}% competency coverage, ~${weeklyHoursPerCompetent}h/week per competent`,
          hours: Math.round(upHoursYear),
          value: upValue,
        },
      ],
      programCost,
      maturitySuggestHours: maturityHoursAdjust,
    };
  }, [
    hoursPerEmployeePerWeek,
    headcount,
    hourlyCost,
    avgSalary,
    annualTurnoverRate,
    improvementPct,
    coverageTargetPct,
    weeklyHoursPerCompetent,
    trainingPerEmployee,
    maturityHoursAdjust,
  ]);

  return (
    <>
      {/* Hero */}
      <BrandHero />

      {/* Stepper */}
      <Stepper steps={STEPS} current={step} />

      {/* STEP 1 – Basics */}
      {step === 1 && (
        <>
          <SectionCard title="Team">
            <Row>
              <Field label="Department">
                <select className="select" value={dept} onChange={(e) => setDept(e.target.value as Dept)}>
                  {["Company-wide","Marketing","Sales","Customer Support","Operations","Engineering","HR"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Employees in scope">
                <input
                  className="input"
                  type="number"
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  min={1}
                />
              </Field>
              <Field label="Currency">
                <CurrencySwitch value={currency} onChange={setCurrency} />
              </Field>
            </Row>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={`Average annual salary (${currency === "AUD" ? "A$" : currency === "EUR" ? "€" : currency === "USD" ? "$" : "£"})`}>
                <input className="input" type="number" value={avgSalary} onChange={(e) => setAvgSalary(Number(e.target.value))} />
              </Field>
              <Field label={`Training per employee (${currency === "AUD" ? "A$" : currency === "EUR" ? "€" : currency === "USD" ? "$" : "£"})`}>
                <input className="input" type="number" value={trainingPerEmployee} onChange={(e) => setTrainingPerEmployee(Number(e.target.value))} />
              </Field>
              <Field label="Program duration (months)">
                <input className="input" type="number" value={durationMonths} onChange={(e) => setDurationMonths(Number(e.target.value))} min={1} />
              </Field>
            </div>
          </SectionCard>

          <Actions next="Continue →" onNext={() => setStep(2)} back="Back" onBack={() => {}} />
        </>
      )}

      {/* STEP 2 – AI Maturity */}
      {step === 2 && (
        <>
          <SectionCard title="AI Maturity">
            <div className="mb-6">
              <div className="label">Where are you today? (1 = early, 10 = embedded)</div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={maturity}
                onChange={(e) => setMaturity(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-2 flex justify-between text-xs text-gray-600">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-700">
                  Suggested baseline productivity gain: <strong>{res.maturitySuggestHours.toFixed(1)} h/week per employee</strong>
                  {" "}at maturity level {maturity}.
                </div>
              </div>
            </div>
          </SectionCard>
          <Actions back="Back" onBack={() => setStep(1)} next="Continue →" onNext={() => setStep(3)} />
        </>
      )}

      {/* STEP 3 – Priorities (fixed three as per your screenshots) */}
      {step === 3 && (
        <>
          <SectionCard title="Pick top 3 priorities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "throughput", label: "Throughput", note: "Ship faster; reduce cycle time" },
                { key: "retention", label: "Retention", note: "Reduce regretted attrition" },
                { key: "upskilling", label: "Upskilling", note: "Raise AI competency coverage" },
              ].map((p) => (
                <div key={p.key} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="font-semibold">{p.label}</div>
                  <div className="text-sm text-gray-600">{p.note}</div>
                </div>
              ))}
            </div>
          </SectionCard>
          <Actions back="Back" onBack={() => setStep(2)} next="Continue →" onNext={() => setStep(4)} />
        </>
      )}

      {/* STEP 4 – Configure Throughput */}
      {step === 4 && (
        <>
          <SectionCard title="Configure: Throughput">
            <Row>
              <Field label="Hours saved per employee per week (target)">
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  value={hoursPerEmployeePerWeek}
                  onChange={(e) => setHoursPerEmployeePerWeek(Number(e.target.value))}
                />
              </Field>
              <div />
              <div />
            </Row>
          </SectionCard>
          <Actions back="Back" onBack={() => setStep(3)} next="Continue →" onNext={() => setStep(5)} />
        </>
      )}

      {/* STEP 5 – Configure Retention */}
      {step === 5 && (
        <>
          <SectionCard title="Configure: Retention">
            <Row>
              <Field label="Current annual employee turnover (%)">
                <input
                  className="input"
                  type="number"
                  value={annualTurnoverRate}
                  onChange={(e) => setAnnualTurnoverRate(Number(e.target.value))}
                />
              </Field>
              <Field label="Expected improvement (relative reduction in churn, %)">
                <input
                  className="input"
                  type="number"
                  value={improvementPct}
                  onChange={(e) => setImprovementPct(Number(e.target.value))}
                />
              </Field>
              <div />
            </Row>
          </SectionCard>
          <Actions back="Back" onBack={() => setStep(4)} next="Continue →" onNext={() => setStep(6)} />
        </>
      )}

      {/* STEP 6 – Configure Upskilling */}
      {step === 6 && (
        <>
          <SectionCard title="Configure: Upskilling">
            <Row>
              <Field label="Competency coverage target (%)">
                <input
                  className="input"
                  type="number"
                  value={coverageTargetPct}
                  onChange={(e) => setCoverageTargetPct(Number(e.target.value))}
                />
              </Field>
              <Field label="Weekly hours saved per competent employee">
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  value={weeklyHoursPerCompetent}
                  onChange={(e) => setWeeklyHoursPerCompetent(Number(e.target.value))}
                />
              </Field>
              <div />
            </Row>
          </SectionCard>
          <Actions back="Back" onBack={() => setStep(5)} next="Continue →" onNext={() => setStep(7)} />
        </>
      )}

      {/* STEP 7 – Results */}
      {step === 7 && (
        <>
          <SectionCard title="Results">
            {/* KPI tiles */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="kpi">
                <div className="label">Total annual value</div>
                <div className="value">{formatMoney(res.kpis.totalValue, currency)}</div>
              </div>
              <div className="kpi">
                <div className="label">Annual ROI</div>
                <div className="value">{res.kpis.annualRoiMultiple.toFixed(1)}×</div>
              </div>
              <div className="kpi">
                <div className="label">Payback</div>
                <div className="value">{res.kpis.paybackMonths.toFixed(1)} mo</div>
              </div>
              <div className="kpi">
                <div className="label">Total hours saved (est.)</div>
                <div className="value">{res.kpis.totalHours.toLocaleString()}</div>
              </div>
            </div>

            {/* Table */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-soft border-b border-gray-200 table-head">
                <div className="col-span-5">Priority</div>
                <div className="col-span-3">Hours saved</div>
                <div className="col-span-4 text-right">Annual value</div>
              </div>

              {res.table.map((r) => (
                <div key={r.key} className="row px-4">
                  <div className="col-title">
                    <div>{r.title}</div>
                    <div className="text-gray-600 text-sm">{r.note}</div>
                  </div>
                  <div className="col-hours">{typeof r.hours === "number" ? `${r.hours.toLocaleString()} h` : "—"}</div>
                  <div className="col-value">{formatMoney(r.value, currency)}</div>
                </div>
              ))}

              <div className="row px-4 font-semibold">
                <div className="col-title">Total</div>
                <div className="col-hours">{`${res.kpis.totalHours.toLocaleString()} h`}</div>
                <div className="col-value">{formatMoney(res.kpis.totalValue, currency)}</div>
              </div>
            </div>

            {/* Next steps */}
            <div className="mt-6 rounded-2xl border border-gray-200 p-4 bg-white">
              <div className="font-semibold mb-2">Next steps</div>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Map top 3 workflows → ship prompt templates & QA/guardrails within 2 weeks.</li>
                <li>Launch “AI Champions” cohort; set quarterly ROI reviews; track usage to correlate with retention.</li>
                <li>Set competency coverage target to 60% and measure weekly AI-in-task usage.</li>
              </ul>
            </div>
          </SectionCard>

          <Actions back="Back" onBack={() => setStep(6)} next="Start over" onNext={() => setStep(1)} />
        </>
      )}
    </>
  );
}
