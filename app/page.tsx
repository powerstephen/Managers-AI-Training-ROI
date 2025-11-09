@tailwind base;
@tailwind components;
@tailwind utilities;

/* Theme */
:root{
  --bg-page:#0b0b0b;        /* deep black */
  --panel:#141414;          /* card / panel */
  --panel-2:#1a1a1a;        /* inner cards */
  --text:#f5f6f9;
  --text-dim:#aeb3c0;
  --brand:#04e1f9;          /* vivid azure */
  --track:#2a2a2a;
  --border:#222428;
  --border-strong:#2b2f36;
  --chip-off:#262a31;
  --bg-chip:#0a6d78;        /* darker brand for active pills */
}

/* Utilities */
.shadow-soft{ box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
.border-top-row{ border-top:1px solid var(--border); }

/* Layout blocks */
.panel{
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:16px;
  padding:16px;
}
.card{
  background:var(--panel-2);
  border:1px solid var(--border);
  border-radius:14px;
  padding:14px;
}
.title{
  font-size:22px;
  font-weight:800;
  margin-bottom:12px;
}
.muted{ color:var(--text-dim); }

/* Hero */
.hero-img{
  display:block;
  width:100%;
  height:auto;
  border-radius:16px;
}

/* Inputs */
.inp{
  width:100%;
  border:1px solid var(--border);
  background:#0f0f0f;
  color:#fff;
  font-weight:700;
  border-radius:10px;
  padding:10px 12px;
}
.lbl{
  font-size:12px;
  color:var(--text-dim);
  margin-bottom:6px;
  display:block;
}
.hint{
  font-size:12px;
  color:var(--text-dim);
  margin-top:8px;
}

/* Buttons */
.btn{
  background:var(--brand);
  color:#001014;
  font-weight:800;
  border-radius:999px;
  padding:10px 16px;
}
.btn:disabled{ opacity:0.35; cursor:not-allowed; }
.btn-ghost{
  background:transparent;
  color:var(--text);
  border:1px solid var(--border);
  border-radius:999px;
  padding:10px 16px;
}

/* Currency pills */
.pill{
  background:#1f232a;
  color:#fff;
  padding:6px 10px;
  border-radius:999px;
  font-weight:700;
  font-size:12px;
  border:1px solid var(--border);
}
.pill--active{
  background:var(--brand);
  color:#001014;
}

/* Step chips / labels */
.step-chip{
  width:28px; height:28px;
  display:inline-flex; align-items:center; justify-content:center;
  border-radius:50%;
  font-weight:800;
  font-size:12px;
  border:1px solid var(--border);
}
.step-chip--on{ background:var(--brand); color:#001014; }
.step-chip--off{ background:var(--chip-off); color:#8f98a8; }
.step-label{ font-weight:700; }

/* Priority tiles */
.priority{
  background:var(--panel-2);
  border:1px solid var(--border);
  border-radius:14px;
  padding:14px;
}
.priority--active{
  outline:2px solid var(--brand);
}

/* KPI cards */
.kpi{
  background:var(--panel-2);
  border:1px solid var(--border);
  border-radius:16px;
  padding:14px;
}
.kpi__label{ font-size:12px; color:var(--text-dim); }
.kpi__value{ font-size:22px; font-weight:900; }
.kpi--accent{ box-shadow: inset 0 0 0 1px rgba(4,225,249,0.15); }

/* Range: slim with fill-only-left color */
.range-slim{
  -webkit-appearance:none;
  height:8px;
  border-radius:999px;
  background:var(--track);
  outline:none;
}
.range-slim::-webkit-slider-thumb{
  -webkit-appearance:none;
  width:18px; height:18px;
  border-radius:50%;
  background:#fff;
  border:2px solid var(--brand);
  cursor:pointer;
  margin-top:-5px;
}
.range-slim::-moz-range-thumb{
  width:18px; height:18px;
  border-radius:50%;
  background:#fff;
  border:2px solid var(--brand);
  cursor:pointer;
}

/* Preset row (Low / Average / Aggressive) */
.preset-pill{
  display:flex; align-items:center; gap:10px;
  background:#1b1b1b;
  border:1px solid var(--border);
  border-radius:12px;
  padding:10px 12px;
}
.preset-pill--active{
  background:#0e0e0e;
  box-shadow: inset 0 0 0 2px var(--brand);
}
.preset-radio{
  width:18px; height:18px;
  border-radius:50%;
  border:2px solid var(--brand);
  display:flex; align-items:center; justify-content:center;
}
.dot{ width:8px; height:8px; border-radius:50%; background:transparent; }
.dot--on{ background:var(--brand); }
