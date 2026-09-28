"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/browser";

type Task = {
  id: string;
  phase: "0–24 HOURS" | "24–48 HOURS" | "48–72 HOURS";
  title: string;
  description: string;
  action: string;
};

const STORAGE_KEY = "layoffos-72-hours";

const tasks: Task[] = [
  {
    id: "documents",
    phase: "0–24 HOURS",
    title: "Save every layoff document",
    description:
      "Keep your termination letter, severance details, final payslip, benefits information, and any HR communication in one place.",
    action: "Create a folder and save everything.",
  },
  {
    id: "final-pay",
    phase: "0–24 HOURS",
    title: "Confirm your final payment",
    description:
      "Know what you are owed and when it is expected to arrive.",
    action:
      "Write down final salary, unused leave, severance, bonuses, and payment dates.",
  },
  {
    id: "benefits",
    phase: "0–24 HOURS",
    title: "Check your benefits",
    description:
      "Find out what happens to health insurance, retirement benefits, reimbursements, and other employment-linked benefits.",
    action: "Contact HR or check your benefits portal.",
  },
  {
    id: "cash",
    phase: "0–24 HOURS",
    title: "Know your cash position",
    description:
      "Get a clear picture of the money immediately available to you.",
    action: "Open Financial Runway and enter your current numbers.",
  },
  {
    id: "spending",
    phase: "0–24 HOURS",
    title: "Stop unnecessary spending",
    description:
      "Until you understand your runway, avoid adding new financial commitments.",
    action:
      "Pause subscriptions, discretionary purchases, and non-essential expenses.",
  },
  {
    id: "support",
    phase: "0–24 HOURS",
    title: "Tell the people who matter",
    description:
      "You do not need to announce the layoff publicly. Start with the people who can actually support you.",
    action: "Tell 2–3 trusted people what happened.",
  },
  {
    id: "resume",
    phase: "24–48 HOURS",
    title: "Get your resume into shape",
    description:
      "You do not need a perfect resume. You need a usable version that clearly communicates what you have done.",
    action: "Create one strong master resume.",
  },
  {
    id: "linkedin",
    phase: "24–48 HOURS",
    title: "Update LinkedIn",
    description:
      "Make your current positioning clear so recruiters, hiring managers, and your network understand what you are looking for.",
    action:
      "Update headline, About section, experience, and Open to Work settings if appropriate.",
  },
  {
    id: "roles",
    phase: "24–48 HOURS",
    title: "Define your target roles",
    description:
      "Avoid applying randomly. Decide which roles are actually worth your time.",
    action: "Write down 3–5 target job titles.",
  },
  {
    id: "companies",
    phase: "24–48 HOURS",
    title: "Build your first target-company list",
    description:
      "Start with companies where your experience has a credible reason to matter.",
    action: "Add your first 10 companies to Target Companies OS.",
  },
  {
    id: "network-list",
    phase: "24–48 HOURS",
    title: "List people who can help",
    description:
      "Former colleagues, managers, clients, recruiters, founders, and professional contacts can become part of your recovery network.",
    action: "Write down your first 20 useful contacts.",
  },
  {
    id: "job-search",
    phase: "24–48 HOURS",
    title: "Set up your job-search system",
    description:
      "Do not rely on memory or browser tabs to remember applications.",
    action: "Open Job Search OS and create your first entries.",
  },
  {
    id: "applications",
    phase: "48–72 HOURS",
    title: "Submit your first applications",
    description:
      "Start with roles that genuinely match your background rather than trying to maximize application volume immediately.",
    action: "Submit your first 3–5 targeted applications.",
  },
  {
    id: "referrals",
    phase: "48–72 HOURS",
    title: "Ask for your first referrals",
    description:
      "A specific referral request is usually more useful than a generic announcement that you are job hunting.",
    action: "Reach out to 3 people with a clear ask.",
  },
  {
    id: "recruiters",
    phase: "48–72 HOURS",
    title: "Contact relevant recruiters",
    description:
      "Identify recruiters who actually work on the roles you want.",
    action: "Send 3–5 targeted recruiter messages.",
  },
  {
    id: "networking",
    phase: "48–72 HOURS",
    title: "Start conversations",
    description:
      "The objective is not to ask everyone for a job. Start relevant professional conversations.",
    action: "Open Networking OS and record your first conversations.",
  },
  {
    id: "weekly-target",
    phase: "48–72 HOURS",
    title: "Set your weekly operating targets",
    description:
      "A job search becomes easier to manage when you measure controllable activity rather than obsessing over outcomes.",
    action:
      "Set weekly targets for applications, outreach, conversations, and interviews.",
  },
  {
    id: "next-week",
    phase: "48–72 HOURS",
    title: "Plan the next 7 days",
    description:
      "The first 72 hours are about getting control. The next week is about building momentum.",
    action:
      "Block time for applications, networking, interviews, and recovery.",
  },
];

const phaseInfo = {
  "0–24 HOURS": {
    title: "Stabilize",
    subtitle:
      "Protect your money, documents, benefits, and immediate options.",
  },
  "24–48 HOURS": {
    title: "Get organized",
    subtitle:
      "Turn the uncertainty into a structured job-search system.",
  },
  "48–72 HOURS": {
    title: "Start the engine",
    subtitle:
      "Begin targeted applications, outreach, and conversations.",
  },
};

export default function First72HoursPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function loadProgress() {
      let localCompleted: string[] = [];

      try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
          localCompleted = JSON.parse(saved);
          setCompleted(localCompleted);
        }
      } catch {
        localCompleted = [];
        setCompleted([]);
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setHydrated(true);
        return;
      }

      const { data, error } = await supabase
        .from("recovery_tasks")
        .select("title, completed")
        .eq("user_id", user.id)
        .eq("category", "first-72-hours");

      if (!error && data && data.length > 0) {
        const completedIds = Array.from(
          new Set(
            data
              .filter((row) => row.completed)
              .map((row) => row.title)
              .filter((title) => tasks.some((task) => task.id === title))
          )
        );

        if (completedIds.length > 0) {
          setCompleted(completedIds);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
        } else if (data.length > 0) {
          setCompleted([]);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
      } else if (localCompleted.length > 0) {
        const rows = localCompleted
          .filter((id) => tasks.some((task) => task.id === id))
          .map((id) => {
            const task = tasks.find((item) => item.id === id)!;

            return {
              user_id: user.id,
              category: "first-72-hours",
              title: task.id,
              description: task.description,
              priority: "high",
              completed: true,
              completed_at: new Date().toISOString(),
            };
          });

        if (rows.length > 0) {
          await supabase.from("recovery_tasks").upsert(rows, {
            onConflict: "id",
          });
        }
      }

      setHydrated(true);
    }

    loadProgress();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed, hydrated]);

  const completedCount = completed.length;
  const totalCount = tasks.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  const phases = useMemo(
    () => ["0–24 HOURS", "24–48 HOURS", "48–72 HOURS"] as const,
    []
  );

  async function toggleTask(id: string) {
    const isCurrentlyComplete = completed.includes(id);

    const nextCompleted = isCurrentlyComplete
      ? completed.filter((item) => item !== id)
      : [...completed, id];

    setCompleted(nextCompleted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCompleted));

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    if (isCurrentlyComplete) {
      await supabase
        .from("recovery_tasks")
        .update({
          completed: false,
          completed_at: null,
        })
        .eq("user_id", user.id)
        .eq("category", "first-72-hours")
        .eq("title", task.id);

      return;
    }

    await supabase
      .from("recovery_tasks")
      .upsert(
        {
          user_id: user.id,
          category: "first-72-hours",
          title: task.id,
          description: task.description,
          priority: "high",
          completed: true,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,category,title",
        }
      );
  }

  async function resetProgress() {
    setCompleted([]);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    await supabase
      .from("recovery_tasks")
      .update({
        completed: false,
        completed_at: null,
      })
      .eq("user_id", user.id)
      .eq("category", "first-72-hours");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
        <header className="mb-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            LayoffOS
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-[#d8d8d2] bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-[#f0f0ec]"
          >
            Dashboard
          </Link>
        </header>

        <section className="mb-12 max-w-4xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#77776f]">
            First 72 Hours
          </p>

          <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] md:text-7xl">
            Don&apos;t figure out
            <br />
            everything at once.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#72726b]">
            The first few days after a layoff are about getting control.
            Stabilize your finances, protect your options, organize your
            search, and then start moving.
          </p>
        </section>

        <section className="mb-12 rounded-3xl border border-[#deded8] bg-white p-7 md:p-9">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                Your progress
              </p>

              <div className="mt-3 flex items-end gap-3">
                <span className="text-5xl font-bold tracking-tight">
                  {completedCount}
                </span>
                <span className="pb-1 text-lg text-[#888880]">
                  / {totalCount} actions complete
                </span>
              </div>
            </div>

            <div className="md:text-right">
              <p className="text-3xl font-bold">{progress}%</p>
              <button
                onClick={resetProgress}
                className="mt-1 text-sm font-medium text-[#77776f] underline underline-offset-4 hover:text-[#111]"
              >
                Reset progress
              </button>
            </div>
          </div>

          <div className="mt-7 h-3 overflow-hidden rounded-full bg-[#e9e9e4]">
            <div
              className="h-full rounded-full bg-[#111] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <div className="space-y-8">
          {phases.map((phase) => {
            const phaseTasks = tasks.filter((task) => task.phase === phase);
            const phaseCompleted = phaseTasks.filter((task) =>
              completed.includes(task.id)
            ).length;

            return (
              <section
                key={phase}
                className="rounded-3xl border border-[#deded8] bg-white p-7 md:p-9"
              >
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-[#888880]">
                      {phase}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold tracking-tight">
                      {phaseInfo[phase].title}
                    </h2>

                    <p className="mt-2 max-w-xl text-[#77776f]">
                      {phaseInfo[phase].subtitle}
                    </p>
                  </div>

                  <div className="text-sm font-semibold text-[#77776f]">
                    {phaseCompleted}/{phaseTasks.length} complete
                  </div>
                </div>

                <div className="space-y-3">
                  {phaseTasks.map((task) => {
                    const isComplete = completed.includes(task.id);

                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`group w-full rounded-2xl border p-5 text-left transition ${
                          isComplete
                            ? "border-[#cfcfc8] bg-[#f3f3ef]"
                            : "border-[#e3e3dd] bg-white hover:border-[#bdbdb5] hover:bg-[#fafaf8]"
                        }`}
                      >
                        <div className="flex gap-4">
                          <div
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition ${
                              isComplete
                                ? "border-[#111] bg-[#111] text-white"
                                : "border-[#c8c8c1] bg-white text-transparent"
                            }`}
                          >
                            ✓
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col justify-between gap-2 md:flex-row">
                              <h3
                                className={`text-lg font-bold ${
                                  isComplete
                                    ? "text-[#77776f] line-through"
                                    : "text-[#111]"
                                }`}
                              >
                                {task.title}
                              </h3>

                              <span className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-[#999990]">
                                Action
                              </span>
                            </div>

                            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#77776f]">
                              {task.description}
                            </p>

                            <p
                              className={`mt-3 text-sm font-semibold ${
                                isComplete
                                  ? "text-[#77776f]"
                                  : "text-[#111]"
                              }`}
                            >
                              → {task.action}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-10 rounded-3xl bg-[#111] p-8 text-white md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#999]">
            After 72 hours
          </p>

          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            The goal isn&apos;t to stay busy. It&apos;s to build momentum.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-[#b8b8b8]">
            Once the immediate chaos is under control, LayoffOS becomes your
            operating system for the search: applications, networking, target
            companies, and financial runway.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/job-search"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#111] transition hover:bg-[#e8e8e5]"
            >
              Open Job Search OS →
            </Link>

            <Link
              href="/networking"
              className="rounded-xl border border-[#444] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1d1d1d]"
            >
              Open Networking OS
            </Link>

            <Link
              href="/runway"
              className="rounded-xl border border-[#444] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1d1d1d]"
            >
              Check Financial Runway
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
