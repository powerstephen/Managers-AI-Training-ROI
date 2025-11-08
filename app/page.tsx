"use client";

import { useMemo, useState } from "react";

/* Types & constants */
type Currency = "EUR" | "USD" | "GBP" | "AUD";
const CURRENCY_SYMBOL: Record<Currency, string> = { EUR:"€", USD:"$", GBP:"£", AUD:"A$" };

type Dept = "Company-wide" | "Marketing" | "Sales" | "Customer Support" | "Operations" | "Engineering" | "HR";
type PriorityKey = "throughput" | "quality" | "onboarding" | "retention" | "upskilling" | "costAvoidance";

/** Visible labels + blurbs + defaults */
const PRIORITY_META: Record<PriorityKey, {label:string; blurb:string; defaultOn?:boolean}> = {
  throughput:{ label:"Throughput", blurb:"Ship faster; reduce cycle time and waiting time.", defaultOn:true },
  quality:{ label:"Quality", blurb:"Fewer reworks; better first-pass yield." },
  onboarding:{ label:"Onboarding", blurb:"Ramp new hires faster with AI assist." },
  retention:{ label:"Retention", blurb:"Reduce regretted attrition via better tooling.", defaultOn:true },
  upskilling:{ label:"Upskilling", blurb:"Grow competency coverage; unlock compounding gains.", defaultOn:true },
  costAvoidance:{ label:"Cost avoidance", blurb:"Avoid outside spend/overtime via automation." },
};

/** Hours saved just from adoption level (per person, per week) */
const maturityToHours = (lvl:number)=> {
  const map=[5,4.5,4,3.5,3,2.6,2.2,1.8,1.4,1];
  return map[Math.min(10,Math.max(1,lvl))-1];
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

/** Presets for the “Low / Average / Aggressive” triad per configurable priority */
type Level = "low" | "avg" | "high";

const THROUGHPUT_PRESET: Record<Level,{time:number; handoffs:number}> = {
  low:{ time:5, handoffs:3 },
  avg:{ time:8, handoffs:6 },
  high:{ time:12, handoffs:10 },
};

const RETENTION_PRESET: Record<Level,{lift:number; baseline:number}> = {
  low:{ lift:1, baseline:10 },
  avg:{ lift:2, baseline:12 },
  high:{ lift:4, baseline:14 },
};

const UPSKILL_PRESET: Record<Level,{coverage:number; hours:number}> = {
  low:{ coverage:40, hours:0.3 },
  avg:{ coverage:60, hours:0.5 },
  high:{ coverage:80, hours:0.7 },
};

export default function Page(){
  /* ======================== NAV / FLOW ======================== */
  // We use a dynamic sequence so priorities only appear after selection.
  type StepKey = "team"|"adoption"|"priorities"|"throughput"|"retention"|"upskilling"|"results";

  const [stepIdx,setStepIdx] = useState(0);
  const goto = (i:number)=> setStepIdx(Math.max(0, Math.min(sequence.length-1, i)));
  const next = ()=> goto(stepIdx+1);
  const back = ()=> goto(stepIdx-1);
  const reset = ()=> window.location.reload();

  /* ======================== STEP 1: TEAM ====================== */
  const [dept,setDept]=useState<Dept>("Company-wide");
  const [headcount,setHeadcount]=useState(150);
  const [currency,setCurrency]=useState<Currency>("EUR");
  const [avgSalary,setAvgSalary]=useState(52000);
  const [trainingPerEmployee,setTrainingPerEmployee]=useState(850);
  const [programMonths,setProgramMonths]=useState(3);

  /* ==================== STEP 2: ADOPTION ====================== */
  const [maturity,setMaturity]=useState(5);

  /* ==================== STEP 3: PRIORITIES ==================== */
  const allKeys:PriorityKey[]=["throughput","quality","onboarding","retention","upskilling","costAvoidance"];
  const [selected,setSelected]=useState<PriorityKey[]>(
    allKeys.filter(k=>PRIORITY_META[k].defaultOn) // preselect 3 nicely
  );

  // Only these three get config steps. Others are value-only.
  const CONFIGURABLE: PriorityKey[] = ["throughput","retention","upskilling"];

  // Dynamic step sequence: base → selected configurables → results
  const configurableChosen = CONFIGURABLE.filter(k=>selected.includes(k));
  const sequence: StepKey[] = ["team","adoption","priorities", ...configurableChosen as StepKey[], "results"];
  const current = sequence[stepIdx];

  /* ===================== LEVEL TRIADS (presets) ================ */
  const [thLevel,setThLevel]=useState<Level>("avg");
  const [rtLevel,setRtLevel]=useState<Level>("avg");
  const [upLevel,setUpLevel]=useState<Level>("avg");

  /* =================== STEP 4–6: CONFIG INPUTS ================= */
  // Throughput
  const [throughputPct,setThroughputPct]=useState(THROUGHPUT_PRESET.avg.time);
  const [handoffPct,setHandoffPct]=useState(THROUGHPUT_PRESET.avg.handoffs);
  // Retention
  const [retentionLiftPct,setRetentionLiftPct]=useState(RETENTION_PRESET.avg.lift);
  const [baselineAttritionPct,setBaselineAttritionPct]=useState(RETENTION_PRESET.avg.baseline);
  // Upskilling
  const [upskillCoveragePct,setUpskillCoveragePct]=useState(UPSKILL_PRESET.avg.coverage);
  const [upskillHoursPerWeek,setUpskillHoursPerWeek]=useState(UPSKILL_PRESET.avg.hours);

  // Apply triad presets when user clicks a level
  const applyThroughputLevel = (lvl:Level)=>{
    setThLevel(lvl);
    setThroughputPct(THROUGHPUT_PRESET[lvl].time);
    setHandoffPct(THROUGHPUT_PRESET[lvl].handoffs);
  };
  const applyRetentionLevel = (lvl:Level)=>{
    setRtLevel(lvl);
    setRetentionLiftPct(RETENTION_PRESET[lvl].lift);
    setBaselineAttritionPct(RETENTION_PRESET[lvl].baseline);
  };
  const applyUpskillLevel = (lvl:Level)=>{
    setUpLevel(lvl);
    setUpskillCoveragePct(UPSKILL_PRESET[lvl].coverage);
    setUpskillHoursPerWeek(UPSKILL_PRESET[lvl].hours);
  };

  /* ======================= CALCULATIONS ======================== */
  const hourlyCost = useMemo(()=> avgSalary/52/40, [avgSalary]);
  const maturityHoursPerPerson = useMemo(()=> maturityToHours(maturity), [maturity]);
  const baseWeeklyTeamHours = useMemo(()=> maturityHoursPerPerson*headcount, [maturityHoursPerPerson, headcount]);

  // Weekly hours by lever (some are coarse placeholders—fine to adjust later)
  const weeklyHours = useMemo(()=>{
    const v:Record<PriorityKey,number>={
      throughput: selected.includes("throughput")
        ? Math.round(baseWeeklyTeamHours*((throughputPct+handoffPct*0.5)/100))
        : 0,

      quality: selected.includes("quality")
        ? Math.round(baseWeeklyTeamHours*0.12) // 12% quality waste trimmed (tempered)
        : 0,

      onboarding: selected.includes("onboarding")
        ? Math.round(headcount * 0.2 /* new hires/yr ~20% */ * 4 /* wks saved */ * 10 /* hrs/wk assisted */ / 52)
        : 0,

      retention: selected.includes("retention")
        ? Math.round(((headcount*(baselineAttritionPct/100))*(retentionLiftPct/100)*80 /* hrs per vacancy */)/52)
        : 0,

      upskilling: selected.includes("upskilling")
        ? Math.round((upskillCoveragePct/100)*headcount*upskillHoursPerWeek)
        : 0,

      costAvoidance: selected.includes("costAvoidance")
        ? Math.round(baseWeeklyTeamHours*0.06) // 6% avoided external/OT
        : 0,
    };
    return v;
  },[
    selected, baseWeeklyTeamHours,
    throughputPct, handoffPct,
    headcount, retentionLiftPct, baselineAttritionPct,
    upskillCoveragePct, upskillHoursPerWeek
  ]);

  const weeklyTotal   = useMemo(()=> Object.values(weeklyHours).reduce((a,b)=>a+b,0), [weeklyHours]);
  const monthlyValue  = useMemo(()=> weeklyTotal*hourlyCost*4, [weeklyTotal,hourlyCost]);
  const programCost   = useMemo(()=> headcount*trainingPerEmployee, [headcount,trainingPerEmployee]);
  const annualValue   = useMemo(()=> monthlyValue*12, [monthlyValue]);
  const annualROI     = useMemo(()=> programCost===0?0:annualValue/programCost, [annualValue,programCost]);
  const paybackMonths = useMemo(()=> monthlyValue===0?Infinity:programCost/monthlyValue, [programCost,monthlyValue]);
  const symbol = CURRENCY_SYMBOL[currency];

  /* ============== helpers to skip unselected config steps ====== */
  const goNextSmart = ()=>{
    // If current is a config step for a lever that is not selected, skip forward
    const ahead = sequence.slice(stepIdx+1);
    const nextIdx = stepIdx+1 + ahead.findIndex((k)=>true);
    goto(Math.min(sequence.length-1, Math.max(stepIdx+1, nextIdx)));
  };

  /* ============================== UI =========================== */
  const Progress = () => (
    <div className="panel">
      <div className="progress">
        {sequence.map((key, i)=>(
          <div key={i} className="progress-item">
            <span className={`step-chip ${i<=stepIdx?"step-chip--on":"step-chip--off"}`}>{i+1}</span>
            <span className="step-label">
              {key==="team"&&"Team"}
              {key==="adoption"&&"AI Adoption"}
              {key==="priorities"&&"Team Priorities"}
              {key==="throughput"&&PRIORITY_META.throughput.label}
              {key==="retention"&&PRIORITY_META.retention.label}
              {key==="upskilling"&&PRIORITY_META.upskilling.label}
              {key==="results"&&"Results"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const Triad = ({
    value, onChange,
    lowLabel="Low", lowSub="(Conservative)",
    midLabel="Average", midSub="(Base case)",
    highLabel="Aggressive", highSub="(Upside)",
  }:{
    value:Level; onChange:(l:Level)=>void;
    lowLabel?:string; lowSub?:string; midLabel?:string; midSub?:string; highLabel?:string; highSub?:string;
  })=>(
    <div className="triad">
      {(["low","avg","high"] as Level[]).map(l=>(
        <button
          type="button"
          key={l}
          onClick={()=>onChange(l)}
          className={`triad-option ${value===l?"on":""}`}
        >
          <span className={`triad-circle ${value===l?"on":""}`} />
          <span className="triad-text">
            <span className="triad-label">
              {l==="low"?lowLabel:l==="avg"?midLabel:highLabel}
            </span>
            <span className="triad-sub">
              {l==="low"?lowSub:l==="avg"?midSub:highSub}
            </span>
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen" style={{background:"var(--bg-page)",color:"var(--text)"}}>
      {/* HERO (same width as content) */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <img src="/hero.png" alt="AI at Work — Brainster" className="hero-img shadow-soft"/>
      </div>

      {/* PROGRESS – stretches across */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        <Progress/>
      </div>

      {/* MAIN */}
      <div className="w-full max-w-6xl mx-auto px-4 mt-4 pb-16">
        <div className="panel">

          {/* STEP: TEAM */}
          {current==="team" && (
            <div>
              <h2 className="title">Team</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="card">
                  <label className="lbl">Department</label>
                  <select className="inp" value={dept} onChange={e=>setDept(e.target.value as Dept)}>
                    {["Company-wide","Marketing","Sales","Customer Support","Operations","Engineering","HR"].map(d=>(
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <p className="hint">Choose a function or “Company-wide”.</p>
                </div>

                <div className="card">
                  <label className="lbl">Employees in scope</label>
                  <input className="inp" type="number" value={headcount} onChange={e=>setHeadcount(parseInt(e.target.value||"0",10))}/>
                </div>

                <div className="card">
                  <label className="lbl">Currency</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["EUR","USD","GBP","AUD"] as Currency[]).map(c=>(
                      <button key={c} onClick={()=>setCurrency(c)} className={`pill ${currency===c?"pill--active":""}`}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold mt-8 mb-2">Program cost assumptions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="card">
                  <label className="lbl">Average annual salary ({CURRENCY_SYMBOL[currency]})</label>
                  <input className="inp" type="number" value={avgSalary} onChange={e=>setAvgSalary(parseInt(e.target.value||"0",10))}/>
                </div>
                <div className="card">
                  <label className="lbl">Training per employee ({CURRENCY_SYMBOL[currency]})</label>
                  <input className="inp" type="number" value={trainingPerEmployee} onChange={e=>setTrainingPerEmployee(parseInt(e.target.value||"0",10))}/>
                </div>
                <div className="card">
                  <label className="lbl">Program duration (months)</label>
                  <input className="inp" type="number" value={programMonths} onChange={e=>setProgramMonths(parseInt(e.target.value||"0",10))}/>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP: ADOPTION */}
          {current==="adoption" && (
            <div>
              <h2 className="title">AI Adoption</h2>
              <p className="muted text-sm mb-3">
                Benchmark where you are now to set realistic targets and track uplift over time.
              </p>
              <div className="grid md:grid-cols-[1fr_360px] gap-6">
                <div className="card">
                  <label className="lbl mb-2">Where are you today? (1–10)</label>
                  <input type="range" min={1} max={10} value={maturity} onChange={e=>setMaturity(parseInt(e.target.value,10))} className="w-full range-slim"/>
                  <div className="flex justify-between mt-2 font-semibold" style={{color:"var(--text-dim)",fontSize:"15px"}}>
                    {Array.from({length:10}).map((_,i)=><span key={i}>{i+1}</span>)}
                  </div>
                  <div className="mt-4 text-[15px]">
                    <span className="font-bold">Selected: {maturity} — </span>{maturityExplainer[maturity-1]}
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
                      <div className="text-3xl font-extrabold">{Math.round(maturityToHours(maturity)*headcount).toLocaleString()}</div>
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

          {/* STEP: PRIORITIES (selection only) */}
          {current==="priorities" && (
            <div>
              <h2 className="title">Team Priorities</h2>
              <p className="muted text-sm mb-4">Choose up to three areas to focus your ROI model.</p>
              <div className="grid md:grid-cols-3 gap-3">
                {allKeys.map(k=>{
                  const active=selected.includes(k);
                  const disabled=!active&&selected.length>=3;
                  return(
                    <div key={k} className={`priority ${active?"priority--active":""} ${disabled?"opacity-40 cursor-not-allowed":""}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{PRIORITY_META[k].label}</span>
                        <button onClick={()=>{
                          if(active) setSelected(selected.filter(x=>x!==k));
                          else if(!disabled) setSelected([...selected,k]);
                        }} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${active?"bg-[var(--bg-chip)] text-white":"bg-[#22252c] text-white"}`}>
                          {active?"Selected":"Select"}
                        </button>
                      </div>
                      <div className="text-sm muted mt-1">{PRIORITY_META[k].blurb}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={()=>{
                  // If next step would be a non-chosen config, auto-skip by recomputing sequence
                  const future = ["throughput","retention","upskilling"].filter(k=>selected.includes(k));
                  // go to first chosen config step if any, else jump to results
                  if(future.length===0) {
                    // results is last
                    goto(sequence.length-1);
                  } else {
                    goto(3); // index of the first configurable step in sequence
                  }
                }}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP: THROUGHPUT CONFIG (only if chosen) */}
          {current==="throughput" && selected.includes("throughput") && (
            <div>
              <h2 className="title">Throughput</h2>
              <p className="muted text-sm mb-4">Quick edit of assumptions for throughput impact.</p>

              <Triad value={thLevel} onChange={applyThroughputLevel} />

              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div className="card">
                  <label className="lbl">Time reclaimed %</label>
                  <input className="inp" type="number" min={0} max={30} value={throughputPct} onChange={e=>setThroughputPct(parseInt(e.target.value||"0",10))}/>
                </div>
                <div className="card">
                  <label className="lbl">Handoffs reduced %</label>
                  <input className="inp" type="number" min={0} max={30} value={handoffPct} onChange={e=>setHandoffPct(parseInt(e.target.value||"0",10))}/>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP: RETENTION CONFIG (only if chosen) */}
          {current==="retention" && selected.includes("retention") && (
            <div>
              <h2 className="title">Retention</h2>

              <Triad value={rtLevel} onChange={applyRetentionLevel} />

              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div className="card">
                  <label className="lbl">Attrition avoided %</label>
                  <input className="inp" type="number" min={0} max={30} value={retentionLiftPct} onChange={e=>setRetentionLiftPct(parseInt(e.target.value||"0",10))}/>
                </div>
                <div className="card">
                  <label className="lbl">Baseline attrition %</label>
                  <input className="inp" type="number" min={0} max={40} value={baselineAttritionPct} onChange={e=>setBaselineAttritionPct(parseInt(e.target.value||"0",10))}/>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP: UPSKILLING CONFIG (only if chosen) */}
          {current==="upskilling" && selected.includes("upskilling") && (
            <div>
              <h2 className="title">Upskilling</h2>

              <Triad value={upLevel} onChange={applyUpskillLevel} />

              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div className="card">
                  <label className="lbl">Coverage target %</label>
                  <input className="inp" type="number" min={0} max={100} value={upskillCoveragePct} onChange={e=>setUpskillCoveragePct(parseInt(e.target.value||"0",10))}/>
                </div>
                <div className="card">
                  <label className="lbl">Hours / week per person</label>
                  <input className="inp" type="number" min={0} step={0.1} value={upskillHoursPerWeek} onChange={e=>setUpskillHoursPerWeek(parseFloat(e.target.value||"0"))}/>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-ghost" onClick={back}>← Back</button>
                <button className="btn" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP: RESULTS */}
          {current==="results" && (
            <div>
              <h2 className="title">Results</h2>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="kpi kpi--accent">
                  <div className="kpi__label">Total annual value</div>
                  <div className="kpi__value">{symbol}{Math.round(annualValue).toLocaleString()}</div>
                </div>
                <div className="kpi kpi--accent">
                  <div className="kpi__label">Annual ROI</div>
                  <div className="kpi__value">{annualROI.toFixed(1)}×</div>
                </div>
                <div className="kpi kpi--accent">
                  <div className="kpi__label">Payback</div>
                  <div className="kpi__value">{isFinite(paybackMonths)?`${paybackMonths.toFixed(1)} mo`:"—"}</div>
                </div>
                <div className="kpi kpi--accent">
                  <div className="kpi__label">Total hours saved (est.)</div>
                  <div className="kpi__value">{(weeklyTotal*52).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl overflow-hidden border" style={{borderColor:"var(--border)"}}>
                <div className="grid grid-cols-[1fr_180px_200px] py-3 px-4 text-xs font-semibold" style={{color:"var(--text-dim)",background:"#101317"}}>
                  <div>PRIORITY</div><div className="text-right">HOURS SAVED</div><div className="text-right">ANNUAL VALUE</div>
                </div>
                {allKeys.filter(k=>selected.includes(k)).map(k=>{
                  const hours=Math.round(weeklyHours[k]*52);
                  const value=hours*hourlyCost;
                  return(
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
                <div className="grid grid-cols-[1fr_180px_200px] items-center py-4 px-4 border-t" style={{borderColor:"var(--border-strong)",background:"#0f1216"}}>
                  <div className="font-extrabold">Total</div>
                  <div className="text-right font-extrabold">{(weeklyTotal*52).toLocaleString()} h</div>
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
    </div>
  );
}
