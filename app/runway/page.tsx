"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "layoffos-runway";

type RunwayData = {
  savings: number;
  severance: number;
  monthlyExpenses: number;
  monthlyDebt: number;
  otherIncome: number;
  benefits: number;
  upcomingExpenses: number;
};

const defaultData: RunwayData = {
  savings: 0,
  severance: 0,
  monthlyExpenses: 0,
  monthlyDebt: 0,
  otherIncome: 0,
  benefits: 0,
  upcomingExpenses: 0,
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, value));
}

function numberValue(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function RunwayPage() {
  const [data, setData] = useState<RunwayData>(defaultData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed && typeof parsed === "object") {
          setData({
            ...defaultData,
            ...parsed,
          });
        }
      }
    } catch {
      console.error("Could not load runway data");
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const calculations = useMemo(() => {
    const availableCash =
      data.savings +
      data.severance -
      data.upcomingExpenses;

    const monthlyInflow =
      data.otherIncome +
      data.benefits;

    const monthlyOutflow =
      data.monthlyExpenses +
      data.monthlyDebt;

    const monthlyBurn = Math.max(
      0,
      monthlyOutflow - monthlyInflow
    );

    const runway =
      monthlyBurn > 0
        ? Math.max(0, availableCash) / monthlyBurn
        : Infinity;

    const minimumIncome =
      Math.max(0, monthlyOutflow - data.savings / 12);

    const runwayMonths = Number.isFinite(runway)
      ? runway
      : 99;

    const runwayDate = new Date();

    runwayDate.setMonth(
      runwayDate.getMonth() + Math.floor(runwayMonths)
    );

    const status =
      runwayMonths < 2
        ? "urgent"
        : runwayMonths < 4
          ? "tight"
          : runwayMonths < 8
            ? "stable"
            : "breathing";

    return {
      availableCash,
      monthlyInflow,
      monthlyOutflow,
      monthlyBurn,
      runway,
      runwayMonths,
      runwayDate,
      minimumIncome,
      status,
    };
  }, [data]);

  function updateField(
    field: keyof RunwayData,
    value: string
  ) {
    setData((current) => ({
      ...current,
      [field]: numberValue(value),
    }));
  }

  const runwayDisplay =
    calculations.monthlyBurn === 0
      ? "∞"
      : calculations.runway >= 99
        ? "99+"
        : calculations.runway.toFixed(1);

  const statusCopy = {
    urgent: {
      label: "Protect cash now",
      text:
        "Your runway is short. Run a survival track alongside your job search and prioritize near-term income.",
    },
    tight: {
      label: "Runway needs attention",
      text:
        "You have some breathing room, but your search should include opportunities that can generate income quickly.",
    },
    stable: {
      label: "You have some breathing room",
      text:
        "You can be selective, but keep monitoring your burn and maintain a consistent search rhythm.",
    },
    breathing: {
      label: "You have breathing room",
      text:
        "Your runway gives you more flexibility to focus on fit, leverage and the right next opportunity.",
    },
  }[calculations.status];

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <header className="flex h-20 items-center justify-between border-b border-[#deded7]">
          <Link
            href="/"
            className="flex items-center gap-3 font-bold"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#111] text-sm text-white">
              L
            </span>
            <span>LayoffOS</span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-[#ccc] bg-white px-4 py-2 text-sm font-semibold"
          >
            ← Dashboard
          </Link>
        </header>

        <section className="py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#777770]">
              FINANCIAL RUNWAY OS
            </p>

            <h1 className="mt-4 text-5xl font-bold tracking-[-0.06em] md:text-7xl">
              Know how long you can breathe.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6b6b65]">
              Understand your available cash, monthly burn and the
              point at which your job search needs to change.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            <MetricCard
              label="AVAILABLE CASH"
              value={money(calculations.availableCash)}
            />

            <MetricCard
              label="MONTHLY BURN"
              value={money(calculations.monthlyBurn)}
            />

            <MetricCard
              label="RUNWAY"
              value={`${runwayDisplay} months`}
            />

            <MetricCard
              label="MIN. MONTHLY INCOME"
              value={money(calculations.minimumIncome)}
            />
          </div>

          <section className="mt-6 rounded-2xl bg-[#111] p-7 text-white md:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#aaa]">
                  YOUR CURRENT POSITION
                </p>

                <div className="mt-5 flex items-end gap-3">
                  <span className="text-7xl font-bold tracking-[-0.07em]">
                    {runwayDisplay}
                  </span>

                  <span className="mb-2 text-lg text-[#aaa]">
                    months
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-bold">
                  {statusCopy!.label}
                </h2>

                <p className="mt-3 max-w-xl text-base leading-7 text-[#bdbdb7]">
                  {statusCopy!.text}
                </p>
              </div>

              <div className="rounded-2xl bg-[#202020] p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#999]">
                  ESTIMATED RUNWAY END
                </p>

                <p className="mt-3 text-2xl font-bold">
                  {calculations.monthlyBurn === 0
                    ? "No burn calculated"
                    : calculations.runwayDate.toLocaleDateString(
                        "en-IN",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#999]">
                  Based on your current expenses, income and
                  one-time costs.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-[#deded7] bg-white p-7 md:p-9">
              <p className="text-xs font-bold uppercase tracking-widest text-[#777770]">
                YOUR NUMBERS
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Tell LayoffOS what you're working with.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#777770]">
                You can change these numbers anytime. Your runway
                recalculates automatically.
              </p>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <MoneyField
                  label="Current savings"
                  value={data.savings}
                  onChange={(value) =>
                    updateField("savings", value)
                  }
                  placeholder="600000"
                />

                <MoneyField
                  label="Severance"
                  value={data.severance}
                  onChange={(value) =>
                    updateField("severance", value)
                  }
                  placeholder="150000"
                />

                <MoneyField
                  label="Monthly essential expenses"
                  value={data.monthlyExpenses}
                  onChange={(value) =>
                    updateField("monthlyExpenses", value)
                  }
                  placeholder="50000"
                />

                <MoneyField
                  label="Monthly debt payments"
                  value={data.monthlyDebt}
                  onChange={(value) =>
                    updateField("monthlyDebt", value)
                  }
                  placeholder="20000"
                />

                <MoneyField
                  label="Other monthly income"
                  value={data.otherIncome}
                  onChange={(value) =>
                    updateField("otherIncome", value)
                  }
                  placeholder="0"
                />

                <MoneyField
                  label="Monthly benefits / support"
                  value={data.benefits}
                  onChange={(value) =>
                    updateField("benefits", value)
                  }
                  placeholder="0"
                />

                <MoneyField
                  label="Upcoming one-time expenses"
                  value={data.upcomingExpenses}
                  onChange={(value) =>
                    updateField("upcomingExpenses", value)
                  }
                  placeholder="25000"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#deded7] bg-white p-7 md:p-9">
              <p className="text-xs font-bold uppercase tracking-widest text-[#777770]">
                THE MATH
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                What your numbers mean
              </h2>

              <div className="mt-7 space-y-5">
                <MathRow
                  label="Cash available"
                  value={money(calculations.availableCash)}
                />

                <MathRow
                  label="Monthly outflow"
                  value={money(calculations.monthlyOutflow)}
                />

                <MathRow
                  label="Monthly inflow"
                  value={money(calculations.monthlyInflow)}
                />

                <MathRow
                  label="Net monthly burn"
                  value={money(calculations.monthlyBurn)}
                />

                <div className="border-t border-[#deded7] pt-5">
                  <p className="text-xs uppercase tracking-widest text-[#999]">
                    Minimum income target
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {money(calculations.minimumIncome)}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#777770]">
                    Approximate monthly income needed to cover your
                    current outflow.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <ScenarioCard
              title="Cut ₹10K / month"
              description="See what happens if you reduce your monthly burn."
              value={scenarioRunway(data, 10000)}
            />

            <ScenarioCard
              title="Cut ₹20K / month"
              description="A more aggressive survival scenario."
              value={scenarioRunway(data, 20000)}
            />

            <ScenarioCard
              title="Add ₹20K income"
              description="See how a freelance or contract income stream changes runway."
              value={scenarioIncomeRunway(data, 20000)}
            />
          </section>

          <section className="mt-8 rounded-2xl border border-[#deded7] bg-white p-7 md:p-9">
            <p className="text-xs font-bold uppercase tracking-widest text-[#777770]">
              NEXT MOVE
            </p>

            <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Your runway should change your search strategy.
                </h2>

                <p className="mt-3 max-w-2xl text-base leading-7 text-[#777770]">
                  Use your runway as a decision signal. As it gets
                  shorter, shift from optimization toward income
                  protection and speed.
                </p>
              </div>

              <Link
                href="/job-search"
                className="shrink-0 rounded-lg bg-[#111] px-6 py-3 text-sm font-semibold !text-white"
              >
                Open Job Search →
              </Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#deded7] bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-[#999]">
        {label}
      </p>

      <p className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
        {value}
      </p>
    </div>
  );
}

function MoneyField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-[#777770]">
        {label}
      </label>

      <div className="mt-2 flex items-center rounded-xl border border-[#deded7] bg-white px-4">
        <span className="text-sm text-[#999]">₹</span>

        <input
          type="number"
          min="0"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-2 py-3 outline-none"
        />
      </div>
    </div>
  );
}

function MathRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#eee] pb-4">
      <span className="text-sm text-[#777770]">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>
    </div>
  );
}

function ScenarioCard({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#deded7] bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-[#777770]">
        SCENARIO
      </p>

      <h3 className="mt-3 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#777770]">
        {description}
      </p>

      <p className="mt-6 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs uppercase tracking-widest text-[#999]">
        estimated runway
      </p>
    </div>
  );
}

function scenarioRunway(
  data: RunwayData,
  monthlySavings: number
) {
  const available =
    data.savings +
    data.severance -
    data.upcomingExpenses;

  const burn =
    data.monthlyExpenses +
    data.monthlyDebt -
    data.otherIncome -
    data.benefits -
    monthlySavings;

  if (burn <= 0) return "∞ months";

  return `${Math.max(0, available / burn).toFixed(1)} months`;
}

function scenarioIncomeRunway(
  data: RunwayData,
  additionalIncome: number
) {
  const available =
    data.savings +
    data.severance -
    data.upcomingExpenses;

  const burn =
    data.monthlyExpenses +
    data.monthlyDebt -
    data.otherIncome -
    data.benefits -
    additionalIncome;

  if (burn <= 0) return "∞ months";

  return `${Math.max(0, available / burn).toFixed(1)} months`;
}
