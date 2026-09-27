"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type RecoveryData = {
  laidOffWhen: string;
  savings: number;
  monthlyExpenses: number;
  severance: number;
  otherIncome: number;
  goal: string;
  stage: string;
  focus: string;
};

type Task = {
  id: string;
  day: string;
  category: string;
  title: string;
  description: string;
  href: string;
};

const RECOVERY_KEY = "layoffos-recovery";
const PLAN_KEY = "layoffos-weekly-plan";

const defaultRecovery: RecoveryData = {
  laidOffWhen: "",
  savings: 0,
  monthlyExpenses: 0,
  severance: 0,
  otherIncome: 0,
  goal: "",
  stage: "",
  focus: "",
};

const baseTasks: Task[] = [
  {
    id: "plan-1",
    day: "MON",
    category: "DIRECTION",
    title: "Review your recovery position",
    description:
      "Look at your runway, current pipeline, and the roles you are actually targeting.",
    href: "/dashboard",
  },
  {
    id: "plan-2",
    day: "MON",
    category: "JOB SEARCH",
    title: "Choose your priority roles",
    description:
      "Pick the roles that deserve your attention this week instead of applying everywhere.",
    href: "/job-search",
  },
  {
    id: "plan-3",
    day: "TUE",
    category: "APPLICATIONS",
    title: "Submit 3 targeted applications",
    description:
      "Focus on roles where your experience gives you a credible reason to be considered.",
    href: "/job-search",
  },
  {
    id: "plan-4",
    day: "TUE",
    category: "COMPANIES",
    title: "Research 3 target companies",
    description:
      "Understand the company, hiring signal, relevant roles, and people you could contact.",
    href: "/companies",
  },
  {
    id: "plan-5",
    day: "WED",
    category: "NETWORKING",
    title: "Reach out to 3 people",
    description:
      "Start with former colleagues, managers, clients, recruiters, or relevant professionals.",
    href: "/networking",
  },
  {
    id: "plan-6",
    day: "WED",
    category: "APPLICATIONS",
    title: "Submit 3 more applications",
    description:
      "Keep your pipeline moving without turning the search into volume for volume's sake.",
    href: "/job-search",
  },
  {
    id: "plan-7",
    day: "THU",
    category: "FOLLOW-UP",
    title: "Review pending follow-ups",
    description:
      "Check recruiters, applications, interviews, and conversations that need a response.",
    href: "/interviews",
  },
  {
    id: "plan-8",
    day: "THU",
    category: "NETWORKING",
    title: "Start 2 new conversations",
    description:
      "Create new professional conversations rather than waiting for applications to produce results.",
    href: "/networking",
  },
  {
    id: "plan-9",
    day: "FRI",
    category: "APPLICATIONS",
    title: "Submit 3 targeted applications",
    description:
      "Close the week with another focused application block.",
    href: "/job-search",
  },
  {
    id: "plan-10",
    day: "FRI",
    category: "REVIEW",
    title: "Review your pipeline",
    description:
      "Look at applications, interviews, networking activity, and companies. Identify what needs attention next.",
    href: "/dashboard",
  },
  {
    id: "plan-11",
    day: "SAT",
    category: "SYSTEM",
    title: "Update your target companies",
    description:
      "Add promising companies and remove targets that no longer make sense.",
    href: "/companies",
  },
  {
    id: "plan-12",
    day: "SUN",
    category: "PLANNING",
    title: "Set next week's targets",
    description:
      "Decide what you will actually execute next week based on the pipeline you have built.",
    href: "/dashboard",
  },
];

export default function PlanPage() {
  const [recovery, setRecovery] = useState(defaultRecovery);
  const [completed, setCompleted] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedRecovery = localStorage.getItem(RECOVERY_KEY);
      const savedPlan = localStorage.getItem(PLAN_KEY);

      if (savedRecovery) {
        setRecovery({
          ...defaultRecovery,
          ...JSON.parse(savedRecovery),
        });
      }

      if (savedPlan) {
        setCompleted(JSON.parse(savedPlan));
      }
    } catch {
      setRecovery(defaultRecovery);
      setCompleted([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(PLAN_KEY, JSON.stringify(completed));
  }, [completed, hydrated]);

  const personalizedTasks = useMemo(() => {
    const tasks = [...baseTasks];

    const runway =
      recovery.monthlyExpenses > 0
        ? (recovery.savings + recovery.severance) /
          Math.max(
            1,
            recovery.monthlyExpenses - recovery.otherIncome
          )
        : Infinity;

    if (runway < 3) {
      tasks[0] = {
        id: "plan-1",
        day: "MON",
        category: "FINANCIAL",
        title: "Review your financial runway",
        description:
          "Your current numbers suggest a short runway. Know exactly what you can spend and what income needs to arrive next.",
        href: "/runway",
      };

      tasks[5] = {
        id: "plan-6",
        day: "WED",
        category: "INCOME",
        title: "Create an immediate income pipeline",
        description:
          "Identify freelance, contract, consulting, or other realistic income opportunities that can reduce pressure on your runway.",
        href: "/networking",
      };
    }

    if (
      recovery.stage.toLowerCase().includes("interview") ||
      recovery.stage.toLowerCase().includes("final")
    ) {
      tasks[6] = {
        id: "plan-7",
        day: "THU",
        category: "INTERVIEWS",
        title: "Prepare your active interviews",
        description:
          "Review every active interview, identify the next action, and prepare specifically for the conversations ahead.",
        href: "/interviews",
      };

      tasks[8] = {
        id: "plan-9",
        day: "FRI",
        category: "INTERVIEWS",
        title: "Close every interview loop",
        description:
          "Send follow-ups, record feedback, and make sure no active opportunity is sitting without a next action.",
        href: "/interviews",
      };
    }

    if (
      recovery.goal.toLowerCase().includes("freelance") ||
      recovery.goal.toLowerCase().includes("contract") ||
      recovery.goal.toLowerCase().includes("startup")
    ) {
      tasks[2] = {
        id: "plan-3",
        day: "TUE",
        category: "PIPELINE",
        title: "Build your opportunity pipeline",
        description:
          "Identify people and companies that could become clients, contracts, partnerships, or startup opportunities.",
        href: "/companies",
      };

      tasks[5] = {
        id: "plan-6",
        day: "WED",
        category: "OUTREACH",
        title: "Send 5 targeted outreach messages",
        description:
          "Start relevant conversations around the work you want to do next.",
        href: "/networking",
      };
    }

    if (
      recovery.focus.toLowerCase().includes("financial") ||
      recovery.focus.toLowerCase().includes("survival")
    ) {
      tasks[8] = {
        id: "plan-9",
        day: "FRI",
        category: "RUNWAY",
        title: "Review your spending and income",
        description:
          "Compare actual spending with your runway assumptions and identify one change that improves your position.",
        href: "/runway",
      };
    }

    return tasks;
  }, [recovery]);

  const completion = Math.round(
    (completed.filter((id) =>
      personalizedTasks.some((task) => task.id === id)
    ).length /
      personalizedTasks.length) *
      100
  );

  const days = useMemo(
    () => ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    []
  );

  function toggle(id: string) {
    setCompleted((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function reset() {
    setCompleted([]);
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm text-[#77776f]">
            Building your recovery plan...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <header className="mb-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            LayoffOS
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-[#d8d8d2] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-[#f0f0ec]"
          >
            Dashboard
          </Link>
        </header>

        <section className="mb-12">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#77776f]">
            Personalized Recovery Plan
          </p>

          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-5xl font-bold leading-[1.03] tracking-[-0.045em] md:text-7xl">
                Know what to do
                <br />
                this week.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#72726b]">
                LayoffOS adapts this plan to your runway, goal, search stage,
                and current recovery priorities.
              </p>
            </div>

            <div className="shrink-0 rounded-3xl border border-[#deded8] bg-white p-6 lg:w-64">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#888880]">
                Weekly progress
              </p>

              <p className="mt-3 text-4xl font-bold">{completion}%</p>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e8e8e3]">
                <div
                  className="h-full rounded-full bg-[#111] transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-[#77776f]">
                {completed.filter((id) =>
                  personalizedTasks.some((task) => task.id === id)
                ).length}{" "}
                of {personalizedTasks.length} actions complete
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-3">
          <ContextCard
            label="Current stage"
            value={recovery.stage || "Not set"}
          />

          <ContextCard
            label="Primary goal"
            value={recovery.goal || "Not set"}
          />

          <ContextCard
            label="Main focus"
            value={recovery.focus || "Not set"}
          />
        </section>

        <section className="space-y-5">
          {days.map((day) => {
            const dayTasks = personalizedTasks.filter(
              (task) => task.day === day
            );

            const done = dayTasks.filter((task) =>
              completed.includes(task.id)
            ).length;

            return (
              <div
                key={day}
                className="rounded-3xl border border-[#deded8] bg-white p-6 md:p-8"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-[#888880]">
                      {day}
                    </p>

                    <h2 className="mt-1 text-2xl font-bold tracking-tight">
                      {day === "MON" && "Set the direction"}
                      {day === "TUE" && "Build the pipeline"}
                      {day === "WED" && "Create conversations"}
                      {day === "THU" && "Keep the loop moving"}
                      {day === "FRI" && "Close the week"}
                      {day === "SAT" && "Maintain the system"}
                      {day === "SUN" && "Reset and plan"}
                    </h2>
                  </div>

                  <span className="text-sm font-semibold text-[#888880]">
                    {done}/{dayTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {dayTasks.map((task) => {
                    const isDone = completed.includes(task.id);

                    return (
                      <div
                        key={task.id}
                        className={`rounded-2xl border p-5 transition ${
                          isDone
                            ? "border-[#d4d4ce] bg-[#f3f3ef]"
                            : "border-[#e4e4df] bg-white"
                        }`}
                      >
                        <div className="flex gap-4">
                          <button
                            onClick={() => toggle(task.id)}
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                              isDone
                                ? "border-[#111] bg-[#111] text-white"
                                : "border-[#c9c9c2] text-transparent"
                            }`}
                          >
                            ✓
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col justify-between gap-2 md:flex-row">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#999990]">
                                  {task.category}
                                </span>

                                <h3
                                  className={`mt-1 text-lg font-bold ${
                                    isDone
                                      ? "text-[#77776f] line-through"
                                      : "text-[#111]"
                                  }`}
                                >
                                  {task.title}
                                </h3>
                              </div>

                              <Link
                                href={task.href}
                                className="text-sm font-bold text-[#111] underline underline-offset-4"
                              >
                                Open →
                              </Link>
                            </div>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#77776f]">
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-10 rounded-3xl border border-[#deded8] bg-white p-7 md:p-9">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                Your plan
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Built around your situation.
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-[#77776f]">
                Change your recovery profile whenever your situation changes.
                Your weekly priorities will adapt with it.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/start"
                className="rounded-xl border border-[#d8d8d2] px-5 py-3 text-sm font-bold hover:bg-[#f5f5f1]"
              >
                Update profile
              </Link>

              <button
                onClick={reset}
                className="rounded-xl border border-[#d8d8d2] px-5 py-3 text-sm font-bold hover:bg-[#f5f5f1]"
              >
                Reset week
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl bg-[#111] p-8 text-white md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#999]">
            Keep moving
          </p>

          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Your plan is the bridge between knowing and doing.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-[#b8b8b8]">
            Runway tells you how much time you have. Your pipeline tells you
            what is happening. This plan tells you what to execute next.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#111] hover:bg-[#e8e8e5]"
            >
              Dashboard →
            </Link>

            <Link
              href="/interviews"
              className="rounded-xl border border-[#444] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d1d1d]"
            >
              Interviews & Offers
            </Link>

            <Link
              href="/data"
              className="rounded-xl border border-[#444] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d1d1d]"
            >
              Data & Backup
            </Link>
          </div>
        </section>

        <footer className="py-12 text-center text-sm text-[#999990]">
          LayoffOS · A practical recovery system for your next move.
        </footer>
      </div>
    </main>
  );
}

function ContextCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#deded8] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
        {label}
      </p>

      <p className="mt-3 text-base font-bold leading-6">{value}</p>
    </div>
  );
}
