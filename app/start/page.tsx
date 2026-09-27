"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: "timing",
    title: "When were you laid off?",
    subtitle: "This helps us understand where you are in the recovery process.",
    options: [
      ["week", "This week"],
      ["month", "1–4 weeks ago"],
      ["three-months", "1–3 months ago"],
      ["longer", "More than 3 months ago"],
    ],
  },
  {
    id: "runway",
    title: "How much financial runway do you have?",
    subtitle: "Give us rough numbers. You can change them later.",
    financial: true,
  },
  {
    id: "goal",
    title: "What are you looking for?",
    subtitle: "Choose what matters most right now.",
    options: [
      ["full-time", "A full-time job"],
      ["contract", "Contract work"],
      ["freelance", "Freelancing"],
      ["startup", "Building something"],
      ["anything", "Open to anything"],
    ],
  },
  {
    id: "stage",
    title: "Where are you in your job search?",
    subtitle: "No judgment. We start from wherever you are.",
    options: [
      ["not-started", "I haven't started yet"],
      ["applying", "I'm actively applying"],
      ["interviews", "I'm getting interviews"],
      ["finals", "I'm in final rounds"],
      ["offers", "I'm waiting on offers"],
    ],
  },
  {
    id: "focus",
    title: "What needs the most attention?",
    subtitle: "We'll use this to shape your first-week plan.",
    options: [
      ["money", "Financial survival"],
      ["applications", "Finding and applying to jobs"],
      ["networking", "Networking and referrals"],
      ["interviews", "Interview preparation"],
      ["direction", "Figuring out what's next"],
      ["everything", "Honestly... everything"],
    ],
  },
];

export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savings, setSavings] = useState("");
  const [expenses, setExpenses] = useState("");
  const [severance, setSeverance] = useState("");
  const [otherIncome, setOtherIncome] = useState("");

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const selectOption = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: value,
    }));
  };

  const next = () => {
    if (current.financial) {
      setAnswers((prev) => ({
        ...prev,
        runway: JSON.stringify({
          savings: Number(savings) || 0,
          expenses: Number(expenses) || 0,
          severance: Number(severance) || 0,
          otherIncome: Number(otherIncome) || 0,
        }),
      }));
    }

    if (step === steps.length - 1) {
      const finalAnswers = {
        ...answers,
        timing: answers.timing || "",
        goal: answers.goal || "",
        stage: answers.stage || "",
        focus: answers.focus || "",
        runway: JSON.stringify({
          savings: Number(savings) || 0,
          expenses: Number(expenses) || 0,
          severance: Number(severance) || 0,
          otherIncome: Number(otherIncome) || 0,
        }),
      };

      localStorage.setItem(
        "layoffos-recovery",
        JSON.stringify(finalAnswers)
      );

      router.push("/dashboard");
      return;
    }

    setStep((currentStep) => currentStep + 1);
  };

  const back = () => {
    if (step > 0) {
      setStep((currentStep) => currentStep - 1);
    } else {
      router.push("/");
    }
  };

  const canContinue = current.financial
    ? Number(expenses) > 0
    : Boolean(answers[current.id]);

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6">
        <header className="flex h-20 items-center justify-between border-b border-[#deded7]">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#111] text-sm text-white">
              L
            </span>
            LayoffOS
          </button>

          <span className="text-sm text-[#777770]">
            Step {step + 1} of {steps.length}
          </span>
        </header>

        <div className="mt-8 h-1 overflow-hidden rounded-full bg-[#e3e3dd]">
          <div
            className="h-full rounded-full bg-[#111] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <section className="flex flex-1 items-center justify-center py-16">
          <div className="w-full max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#777770]">
              YOUR RECOVERY
            </p>

            <h1 className="text-4xl font-bold tracking-[-0.05em] md:text-6xl">
              {current.title}
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-[#6b6b65]">
              {current.subtitle}
            </p>

            {current.financial ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <MoneyInput
                  label="Savings"
                  value={savings}
                  onChange={setSavings}
                />
                <MoneyInput
                  label="Monthly expenses"
                  value={expenses}
                  onChange={setExpenses}
                />
                <MoneyInput
                  label="Severance"
                  value={severance}
                  onChange={setSeverance}
                />
                <MoneyInput
                  label="Other monthly income"
                  value={otherIncome}
                  onChange={setOtherIncome}
                />
              </div>
            ) : (
              <div className="mt-10 grid gap-3">
                {current.options?.map(([value, label]) => {
                  const selected = answers[current.id] === value;

                  return (
                    <button
                      key={value}
                      onClick={() => selectOption(value)}
                      className={`flex items-center justify-between rounded-xl border p-5 text-left transition ${
                        selected
                          ? "border-[#111] bg-[#111] text-white"
                          : "border-[#deded7] bg-white hover:border-[#999]"
                      }`}
                    >
                      <span className="font-medium">{label}</span>

                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full border text-xs ${
                          selected
                            ? "border-white bg-white text-[#111]"
                            : "border-[#ccc]"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={back}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-[#666]"
              >
                ← Back
              </button>

              <button
                onClick={next}
                disabled={!canContinue}
                className={`rounded-lg px-6 py-3 text-sm font-semibold transition ${
                  canContinue
                    ? "bg-[#111] text-white hover:bg-[#292929]"
                    : "cursor-not-allowed bg-[#ddd] text-[#999]"
                }`}
              >
                {step === steps.length - 1
                  ? "Build my recovery plan →"
                  : "Continue →"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-xl border border-[#deded7] bg-white p-5">
      <span className="block text-sm font-semibold">{label}</span>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-[#777770]">₹</span>

        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-2xl font-semibold outline-none"
        />
      </div>
    </label>
  );
}
