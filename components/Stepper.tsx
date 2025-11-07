"use client";

type StepMeta = { id: number; label: string };

export function Stepper({
  current,
  steps,
}: {
  current: number;
  steps: StepMeta[];
}) {
  return (
    <div className="container-narrow mt-4">
      <div className="stepper">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`pill ${current === s.id ? "active" : ""}`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-[13px] font-semibold leading-none text-gray-800">
              {s.id}
            </span>
            <span className="text-[14px] font-medium">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
