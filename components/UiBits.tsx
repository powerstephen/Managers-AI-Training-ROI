"use client";

export function SectionCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="container-narrow mt-5">
      <div className="card p-5">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>;
}

export function Actions({
  back,
  next,
  onBack,
  onNext,
  nextDisabled,
}: {
  back?: string;
  next?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="container-narrow my-6 flex items-center justify-between">
      <button onClick={onBack} className="btn btn-ghost" type="button">
        ← {back ?? "Back"}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="btn btn-primary disabled:opacity-50"
        type="button"
      >
        {next ?? "Continue →"}
      </button>
    </div>
  );
}

export function CurrencySwitch({
  value,
  onChange,
}: {
  value: "EUR" | "USD" | "GBP" | "AUD";
  onChange: (v: "EUR" | "USD" | "GBP" | "AUD") => void;
}) {
  const items: ("EUR" | "USD" | "GBP" | "AUD")[] = ["EUR", "USD", "GBP", "AUD"];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`btn ${value === c ? "btn-primary" : "btn-ghost"}`}
          aria-pressed={value === c}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export function formatMoney(amount: number, cur: "EUR" | "USD" | "GBP" | "AUD") {
  const symbol = cur === "EUR" ? "€" : cur === "USD" ? "$" : cur === "GBP" ? "£" : "A$";
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}
