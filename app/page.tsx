"use client";

import { useMemo, useState } from "react";

/* ─────────── Types / constants ─────────── */
type Currency = "EUR" | "USD" | "GBP" | "AUD";
const CURRENCY_SYMBOL: Record<Currency, string> = { EUR: "€", USD: "$", GBP: "£", AUD: "A$" };

type Dept =
  | "Company-wide" | "Marketing" | "Sales" | "Customer Support" | "Operations" | "Engineering" | "HR";

type PriorityKey = "throughput" | "quality" | "onboarding" | "retention" | "upskilling" | "costAvoidance";

const PRIORITY_META: Record<PriorityKey, { label: string; blurb: string; defaultOn?: boolean }> = {
  throughput:   { label: "Throughput",      blurb: "Ship faster; reduce cycle time and waiting time.", defaultOn: true },
  quality:      { label: "Quality",         blurb: "Fewer reworks; better first-pass yield.",          defaultOn: true },
  onboarding:   { label: "Onboarding",      blurb: "Ramp new hires faster with AI assist.",            defaultOn: true },
  retention:    { label: "Retention",       blurb: "Reduce regretted attrition via better tooling." },
  upskilling:   { label: "Upskilling",      blurb: "Grow competency coverage; unlock compounding gains." },
  costAvoidance:{ label: "Cost avoidance",  blurb: "Avoid outside spend/overtime via automation." },
};

const maturityToHours = (level: number) => {
  const map = [5, 4.5, 4, 3.5, 3, 2.6, 2.2, 1.8, 1.4, 1];
  const idx = Math.min(10, Math.max(1, level)) - 1;
  return map[idx];
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

/* ─────────── Component ─────────── */
export default function Page() {
  const [step, setStep] = useState(1);
  const next = () => setStep((s) => Math.min(7, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const reset = () => window.location.reload();

  /* Step 1 */
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState(850);
  const [programMonths, setProgramMonths] = useState(3);

  /* Step 2 */
  const [maturity, setMaturity] = useState(5);

  /* Step 3 */
  const keys: PriorityKey[] = ["throughput", "quality", "onboarding", "retention", "upskilling", "costAvoidance"];
  const [selected, setSelected] = useState<PriorityKey[]>(keys.filter((k) => PRIORITY_META[k].defaultOn));

  /* Step 4–6 config */
  const [throughputPct, setThroughputPct] = useState(8);
  const [handoffPct, setHandoffPct] = useState(6);

  const [retentionLiftPct, setRetentionLiftPct] = useState(2);
  const [baselineAttritionPct, setBaselineAttritionPct] = useState(12);

  const [upskillCoveragePct, setUpskillCoveragePct] = useState(60);
  const [upskillHoursPerWeek, setUpskillHoursPerWeek] = useState(0.5);

  /* Calcs */
  const hourlyCost = useMemo(() => avgSalary / 52 / 40, [avgSalary]);
  const maturityHoursPerPerson = useMemo(() => maturityToHours(maturity), [maturity]);
  const maturityHoursTeam = useMemo(() => Math.round(maturityHoursPerPerson * headcount), [maturityHoursPerPerson, headcount]);
  const baseWeeklyTeamHours = useMemo(() => maturityHoursPerPerson * headcount, [maturityHoursPerPerson, headcount]);

  const weeklyHours = useMemo(() => {
    const v: Record<PriorityKey, number> = {
      throughput: selected.includes("throughput")
        ? Math.round(baseWeeklyTeamHours * ((throughputPct + handoffPct * 0.5) / 100))
        : 0,
      quality: selected.includes("quality") ? Math.round(baseWeeklyTeamHours * 0.2) : 0,
      onboarding: selected.includes("onboarding") ? Math.round((Math.max(0, Math.min(52, 2)) * 40) * (headcount * 0.2)) : 0,
      retention: selected.includes("retention")
        ? Math.round(((headcount * (baselineAttritionPct / 100)) * (retentionLiftPct / 100) * 120) / 52)
        : 0,
      upskilling: selected.includes("upskilling") ? Math.round((upskillCoveragePct / 100) * headcount * upskillHoursPerWeek) : 0,
      costAvoidance: selected.includes("costAvoidance") ? Math.round(baseWeeklyTeamHours * 0.1) : 0,
    };
    return v;
  }, [selected, baseWeeklyTeamHours, throughputPct, handoffPct, headcount, retentionLiftPct, baselineAttritionPct, upskillCoveragePct, upskillHoursPerWeek]);

  const weeklyTotal = useMemo(() => Object.values(weeklyHours).reduce((a, b) => a + b, 0), [weeklyHours]);
  const monthlyValue = useMemo(() => weeklyTotal * hourlyCost * 4, [weeklyTotal, hourlyCost]);
  const programCost = useMemo(() => headcount * trainingPerEmployee, [headcount, trainingPerEmployee]);
  const annualValue = useMemo(() => monthlyValue * 12, [monthlyValue]);
  const annualROI = useMemo(() => (programCost === 0 ? 0 : annualValue / programCost), [annualValue, programCost]);
  const paybackMonths = useMemo(() => (monthlyValue === 0 ? Infinity : programCost / monthlyValue), [programCost, monthlyValue]);

  const symbol = CURRENCY_SYMBOL[currency];

  const steps = [
    { id: 1, label: "Basics" },
    { id: 2, label: "AI Maturity" },
    { id: 3, label: "Pick top 3 priorities" },
    { id: 4, label: "Throughput" },
    { id: 5, label: "Retention" },
    { id: 6, label: "Upskilling" },
    { id: 7, label: "Results" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text)" }}>
      {/* HERO (shorter, contained) */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img
          src="/hero.png"
          alt="AI at Work — Brainster"
          className="w-full h-auto max-h-[180px] object-contain rounded-2xl shadow-soft"
        />
      </div>

      {/* Progress */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <div className="panel flex gap-4 flex-wrap">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className={`step-chip ${step >= s.id ? "step-chip--on" : "step-chip--off"}`}>{s.id}</span>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4 pb-16">
        <div className="panel">
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 className="title">Team</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="lbl">Department</label>
                  <select className="inp" value={dept} onChange={(e) => setDept(e.target.value as Dept)}>
                    {["Company-wide","Marketing","Sales","Customer Support","Operations","Engineering","HR"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <p className="hint">Choose a function or “Company-wide”.</p>
                </div>

                <div>
                  <label className="lbl">Employees in scope</label>
                  <input className="inp" type="number" value={headcount} onChange={(e) => setHeadcount(parseInt(e.target.value || "0", 10))}/>
                </div>

                <div>
                  <label className="lbl">Currency</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["EUR","USD","GBP","AUD"] as Currency[]).map((c) => (
                      <button key={c} onClick={() => setCurrency(c)} className={`pill ${currency === c ? "pill--active" : ""}`}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold mt-8 mb-2" style={{color:"var(--text)"}}>Program cost assumptions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="lbl">Average annual salary ({symbol})</label>
                  <input className="inp" type="number" value={avgSalary} onChange={(e) => setAvgSalary(parseInt(e.target.value || "0", 10))}/>
                </div>
                <div>
                  <label className="lbl">Training per employee ({symbol})</label>
                  <input className="inp" type="number" value={trainingPerEmployee} onChange={(e) => setTrainingPerEmployee(parseInt(e.target.value || "0", 10))}/>
                </div>
                <div>
                  <label className="lbl">Program duration (months)</label>
                  <input className="inp" type="number" value={programMonths} onChange={(e) => setProgramMonths(parseInt(e.target.value || "0", 10))}/>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 2 – dark style like your screenshot */}
          {step === 2 && (
            <div>
              <h2 className="title">AI Maturity</h2>

              <div className="grid md:grid-cols-[1fr_360px] gap-6">
                <div className="card">
                  <label className="lbl mb-2">Where are you today? (1–10)</label>
                  <input
                    type="range" min={1} max={10} value={maturity}
                    onChange={(e) => setMaturity(parseInt(e.target.value, 10))}
                    className="w-full range-slim"
                  />
                  <div className="flex justify-between mt-2 font-semibold" style={{color:"var(--text-dim)", fontSize:"15px"}}>
                    {Array.from({ length: 10 }).map((_, i) => <span key={i}>{i+1}</span>)}
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
                      <div className="text-3xl font-extrabold">{maturityHoursPerPerson.toFixed(1)}</div>
                    </div>
                    <div className="card">
                      <div className="text-xs muted">Team / week</div>
                      <div className="text-3xl font-extrabold">{maturityHoursTeam.toLocaleString()}</div>
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

          {/* STEP 3 – priorities (selection only) */}
          {step === 3 && (
            <div>
              <h2 className="title">Pick top 3 priorities</h2>
              <p className="muted text-sm mb-4">Choose up to three areas to focus your ROI model.</p>

              <div className="grid md:grid-cols-3 gap-3">
                {keys.map((k) => {
                  const active = selected.includes(k);
                  const disabled = !active && selected.length >= 3;
                  return (
                    <div key={k} className={`priority ${active ? "priority--active" : ""} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{PRIORITY_META[k].label}</span>
                        <button
                          onClick={() => {
                            if (active) setSelected(selected.filter((x) => x !== k));
                            else if (!disabled) setSelected([...selected, k]);
                          }}
                          className={`tag ${active ? "" : "tag--ghost"}`}
                        >
                          {active ? "Selected" : "Select"}
                        </button>
                      </div>
                      <div className="text-sm muted mt-1">{PRIORITY_META[k].blurb}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next} disabled={selected.length === 0}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <h2 className="title">Throughput</h2>
              <p className="muted text-sm mb-4">Quick edit of assumptions for throughput impact.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Time reclaimed %</label>
                  <input className="inp" type="number" min={0} max={30} value={throughputPct}
                    onChange={(e) => setThroughputPct(parseInt(e.target.value || "0", 10))}/>
                </div>
                <div>
                  <label className="lbl">Handoffs reduced %</label>
                  <input className="inp" type="number" min={0} max={30} value={handoffPct}
                    onChange={(e) => setHandoffPct(parseInt(e.target.value || "0", 10))}/>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div>
              <h2 className="title">Retention</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Attrition avoided %</label>
                  <input className="inp" type="number" min={0} max={30} value={retentionLiftPct}
                    onChange={(e) => setRetentionLiftPct(parseInt(e.target.value || "0", 10))}/>
                </div>
                <div>
                  <label className="lbl">Baseline attrition %</label>
                  <input className="inp" type="number" min={0} max={40} value={baselineAttritionPct}
                    onChange={(e) => setBaselineAttritionPct(parseInt(e.target.value || "0", 10))}/>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <div>
              <h2 className="title">Upskilling</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="lbl">Coverage target %</label>
                  <input className="inp" type="number" min={0} max={100} value={upskillCoveragePct}
                    onChange={(e) => setUpskillCoveragePct(parseInt(e.target.value || "0", 10))}/>
                </div>
                <div>
                  <label className="lbl">Hours / week per person</label>
                  <input className="inp" type="number" min={0} step={0.1} value={upskillHoursPerWeek}
                    onChange={(e) => setUpskillHoursPerWeek(parseFloat(e.target.value || "0"))}/>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 7 */}
          {step === 7 && (
            <div>
              <h2 className="title">Results</h2>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="kpi"><div className="kpi__label">Total annual value</div><div className="kpi__value">{symbol}{Math.round(annualValue).toLocaleString()}</div></div>
                <div className="kpi"><div className="kpi__label">Annual ROI</div><div className="kpi__value">{annualROI.toFixed(1)}×</div></div>
                <div className="kpi"><div className="kpi__label">Payback</div><div className="kpi__value">{isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : "—"}</div></div>
                <div className="kpi"><div className="kpi__label">Total hours saved (est.)</div><div className="kpi__value">{(weeklyTotal * 52).toLocaleString()}</div></div>
              </div>

              <div className="mt-6 rounded-2xl overflow-hidden border" style={{borderColor:"var(--border)"}}>
                <div className="grid grid-cols-[1fr_180px_200px] py-3 px-4 text-xs font-semibold" style={{color:"var(--text-dim)", background:"#101317"}}>
                  <div>PRIORITY</div><div className="text-right">HOURS SAVED</div><div className="text-right">ANNUAL VALUE</div>
                </div>
                {keys.filter((k) => selected.includes(k)).map((k) => {
                  const hours = Math.round(weeklyHours[k] * 52);
                  const value = hours * hourlyCost;
                  return (
                    <div key={k} className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t" style={{borderColor:"var(--border)"}}>
                      <div>
                        <div className="font-bold">{PRIORITY_META[k].label}</div>
                        <div className="text-sm muted">{PRIORITY_META[k].blurb}</div>
                      </div>
                      <div className="text-right font-semibold">{hours.toLocaleString()} h</div>
                      <div className="text-right font-semibold">{symbol}{Math.round(value).toLocaleString()}</div>
                    </div>
                  );
                })}
                <div className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t" style={{borderColor:"var(--border-strong)", background:"#0f1216"}}>
                  <div className="font-extrabold">Total</div>
                  <div className="text-right font-extrabold">{(weeklyTotal * 52).toLocaleString()} h</div>
                  <div className="text-right font-extrabold">{symbol}{Math.round(annualValue).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn-subtle" onClick={reset}>Start over</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
