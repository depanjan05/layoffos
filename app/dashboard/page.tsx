"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/browser";

type RecoveryEngineResult = {
  state: string;
  stateLabel: string;
  stateReason: string;
  runwayMonths: number | null;
  priorities: string[];
  actions: {
    title: string;
    reason: string;
    href: string;
    priority: string;
    evidence?: string;
  }[];
  transition: {
    nextState: string;
    label: string;
    reason: string;
  };
};

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

type Application = {
  id: string;
  company: string;
  role: string;
  stage: string;
  nextAction: string;
};

type Company = {
  id: string;
  company: string;
  priority: string;
  status: string;
  nextAction: string;
};

type Interview = {
  id: string;
  company: string;
  role: string;
  stage: string;
  interviewDate: string;
  followUpDate: string;
  nextAction: string;
};

type RunwayData = {
  savings: number;
  severance: number;
  monthlyExpenses: number;
  monthlyDebt: number;
  otherIncome: number;
  benefits: number;
  upcomingExpenses: number;
};

const RECOVERY_KEY = "layoffos-recovery";
const RUNWAY_KEY = "layoffos-runway";
const APPLICATIONS_KEY = "layoffos-applications";
const COMPANIES_KEY = "layoffos-companies";
const INTERVIEWS_KEY = "layoffos-interviews";
const TASKS_KEY = "layoffos-completed-tasks";
const HOURS_KEY = "layoffos-72-hours";
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

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function parseArray<T>(key: string): T[] {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function getRunway(
  recovery: RecoveryData,
  runwayData: RunwayData | null
) {
  if (runwayData) {
    const availableCash =
      runwayData.savings +
      runwayData.severance -
      runwayData.upcomingExpenses;

    const monthlyInflow =
      runwayData.otherIncome +
      runwayData.benefits;

    const monthlyOutflow =
      runwayData.monthlyExpenses +
      runwayData.monthlyDebt;

    const monthlyBurn = Math.max(
      0,
      monthlyOutflow - monthlyInflow
    );

    if (monthlyBurn <= 0) return Infinity;

    return Math.max(0, availableCash) / monthlyBurn;
  }

  const available = recovery.savings + recovery.severance;

  const monthlyBurn = Math.max(
    0,
    recovery.monthlyExpenses - recovery.otherIncome
  );

  if (monthlyBurn <= 0) return Infinity;

  return available / monthlyBurn;
}

function formatRunway(value: number) {
  if (!Number.isFinite(value)) return "∞";

  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 1,
  });
}

function isPast(dateValue: string) {
  if (!dateValue) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(`${dateValue}T00:00:00`);

  return date < today;
}

function isUpcoming(dateValue: string) {
  if (!dateValue) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(`${dateValue}T00:00:00`);

  return date >= today;
}

export default function DashboardPage() {
  const [recovery, setRecovery] = useState<RecoveryData>(defaultRecovery);
  const [recoveryEngine, setRecoveryEngine] =
    useState<RecoveryEngineResult | null>(null);
  const [completingRecoveryAction, setCompletingRecoveryAction] =
    useState<string | null>(null);
  const [runwayData, setRunwayData] = useState<RunwayData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [completed72, setCompleted72] = useState<string[]>([]);
  const [completedPlan, setCompletedPlan] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const savedRecovery = localStorage.getItem(RECOVERY_KEY);

        if (savedRecovery) {
          setRecovery({
            ...defaultRecovery,
            ...JSON.parse(savedRecovery),
          });
        }

        const savedRunway = localStorage.getItem(RUNWAY_KEY);

        if (savedRunway) {
          const parsedRunway = JSON.parse(savedRunway);

          setRunwayData({
            savings: Number(parsedRunway.savings) || 0,
            severance: Number(parsedRunway.severance) || 0,
            monthlyExpenses: Number(parsedRunway.monthlyExpenses) || 0,
            monthlyDebt: Number(parsedRunway.monthlyDebt) || 0,
            otherIncome: Number(parsedRunway.otherIncome) || 0,
            benefits: Number(parsedRunway.benefits) || 0,
            upcomingExpenses: Number(parsedRunway.upcomingExpenses) || 0,
          });
        }

        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) {
          setApplications(parseArray<Application>(APPLICATIONS_KEY));
          setCompanies(parseArray<Company>(COMPANIES_KEY));
          setInterviews(parseArray<Interview>(INTERVIEWS_KEY));
          setCompletedTasks(parseArray<string>(TASKS_KEY));
          setCompleted72(
            Array.from(new Set(parseArray<string>(HOURS_KEY)))
          );
          setCompletedPlan(
            Array.from(new Set(parseArray<string>(PLAN_KEY)))
          );
          return;
        }

        const [
          profileResult,
          financialResult,
          applicationsResult,
          companiesResult,
          interviewsResult,
          tasks72Result,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "recovery_timing,target_work_type,career_stage,primary_focus"
            )
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("financial_profiles")
            .select(
              "savings,severance,monthly_expenses,monthly_debt,other_income,benefits,upcoming_expenses"
            )
            .eq("user_id", user.id)
            .maybeSingle(),

          supabase
            .from("applications")
            .select("id,company,role,stage,next_action")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("companies")
            .select("id,name,priority,status,next_action")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("interviews")
            .select(
              "id,company,role,stage,interview_date,follow_up_date,next_action"
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("recovery_tasks")
            .select("title,completed")
            .eq("user_id", user.id)
            .eq("category", "first-72-hours"),
        ]);

        if (cancelled) return;

        const profile = profileResult.data;
        const financial = financialResult.data;

        if (profile) {
          setRecovery((current) => ({
            ...current,
            laidOffWhen: profile.recovery_timing ?? current.laidOffWhen,
            goal: profile.target_work_type ?? current.goal,
            stage: profile.career_stage ?? current.stage,
            focus: profile.primary_focus ?? current.focus,
          }));
        }

        if (financial) {
          setRunwayData({
            savings: Number(financial.savings) || 0,
            severance: Number(financial.severance) || 0,
            monthlyExpenses: Number(financial.monthly_expenses) || 0,
            monthlyDebt: Number(financial.monthly_debt) || 0,
            otherIncome: Number(financial.other_income) || 0,
            benefits: Number(financial.benefits) || 0,
            upcomingExpenses: Number(financial.upcoming_expenses) || 0,
          });
        }

        if (!applicationsResult.error) {
          setApplications(
            (applicationsResult.data ?? []).map((item) => ({
              id: item.id,
              company: item.company,
              role: item.role,
              stage: item.stage,
              nextAction: item.next_action ?? "",
            }))
          );
        }

        if (!companiesResult.error) {
          setCompanies(
            (companiesResult.data ?? []).map((item) => ({
              id: item.id,
              company: item.name,
              priority: item.priority,
              status: item.status,
              nextAction: item.next_action ?? "",
            }))
          );
        }

        if (!interviewsResult.error) {
          setInterviews(
            (interviewsResult.data ?? []).map((item) => ({
              id: item.id,
              company: item.company,
              role: item.role,
              stage: item.stage,
              interviewDate: item.interview_date ?? "",
              followUpDate: item.follow_up_date ?? "",
              nextAction: item.next_action ?? "",
            }))
          );
        }

        if (!tasks72Result.error) {
          const completed = Array.from(
            new Set(
              (tasks72Result.data ?? [])
                .filter((task) => task.completed)
                .map((task) => task.title)
            )
          );

          setCompleted72(completed);
          localStorage.setItem(HOURS_KEY, JSON.stringify(completed));
        }

        /*
         * Weekly plan is the source of truth for weekly progress.
         * Do not infer this from the generic localStorage completion array.
         */
        const getWeekStart = () => {
          const date = new Date();
          const day = date.getDay();
          const diff = day === 0 ? -6 : 1 - day;

          date.setDate(date.getDate() + diff);
          date.setHours(0, 0, 0, 0);

          return date.toISOString().slice(0, 10);
        };

        const weekStart = getWeekStart();

        const { data: weeklyPlan, error: weeklyPlanError } =
          await supabase
            .from("weekly_plans")
            .select("id")
            .eq("user_id", user.id)
            .eq("week_start", weekStart)
            .maybeSingle();

        if (!weeklyPlanError && weeklyPlan) {
          const { data: weeklyTasks, error: weeklyTasksError } =
            await supabase
              .from("weekly_plan_tasks")
              .select("title,completed")
              .eq("weekly_plan_id", weeklyPlan.id);

          if (!weeklyTasksError) {
            const completed = Array.from(
              new Set(
                (weeklyTasks ?? [])
                  .filter((task) => task.completed)
                  .map((task) => task.title)
              )
            );

            setCompletedPlan(completed);
            localStorage.setItem(
              PLAN_KEY,
              JSON.stringify(completed)
            );
          }
        } else {
          setCompletedPlan(
            Array.from(new Set(parseArray<string>(PLAN_KEY)))
          );
        }
      } catch (error) {
        console.error("Dashboard Supabase load failed:", error);

        setApplications(parseArray<Application>(APPLICATIONS_KEY));
        setCompanies(parseArray<Company>(COMPANIES_KEY));
        setInterviews(parseArray<Interview>(INTERVIEWS_KEY));
        setCompletedTasks(parseArray<string>(TASKS_KEY));
        setCompleted72(
          Array.from(new Set(parseArray<string>(HOURS_KEY)))
        );
        setCompletedPlan(
          Array.from(new Set(parseArray<string>(PLAN_KEY)))
        );
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRecoveryEngine() {
      try {
        const response = await fetch("/api/recovery-engine");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!cancelled && data) {
          setRecoveryEngine(data);
        }
      } catch {
        // Keep the dashboard usable if the engine is unavailable.
      }
    }

    loadRecoveryEngine();

    return () => {
      cancelled = true;
    };
  }, []);

  async function completeRecoveryAction(
    action: RecoveryEngineResult["actions"][number]
  ) {
    const actionKey = `${action.title}-${action.href}`;

    if (completingRecoveryAction) {
      return;
    }

    setCompletingRecoveryAction(actionKey);

    try {
      const response = await fetch("/api/recovery-engine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: action.title,
          href: action.href,
          state: recoveryEngine?.state ?? "",
        }),
      });

      if (!response.ok) {
        return;
      }

      setRecoveryEngine((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          actions: current.actions.filter(
            (item) =>
              item.title !== action.title ||
              item.href !== action.href
          ),
        };
      });

      const refreshResponse = await fetch("/api/recovery-engine");

      if (refreshResponse.ok) {
        const refreshed = await refreshResponse.json();
        setRecoveryEngine(refreshed);
      }
    } finally {
      setCompletingRecoveryAction(null);
    }
  }

  const runway = useMemo(
    () => getRunway(recovery, runwayData),
    [recovery, runwayData]
  );

  const applicationStats = useMemo(() => {
    const active = applications.filter(
      (item) =>
        item.stage !== "Rejected" &&
        item.stage !== "Withdrawn" &&
        item.stage !== "Offer"
    );

    const interviewsCount = applications.filter(
      (item) =>
        item.stage === "Interview" ||
        item.stage === "Final" ||
        item.stage === "Offer"
    ).length;

    const finals = applications.filter(
      (item) => item.stage === "Final"
    ).length;

    const offers = applications.filter(
      (item) => item.stage === "Offer"
    ).length;

    return {
      total: applications.length,
      active: active.length,
      interviews: interviewsCount,
      finals,
      offers,
    };
  }, [applications]);

  const interviewStats = useMemo(() => {
    const active = interviews.filter(
      (item) =>
        item.stage !== "Rejected" &&
        item.stage !== "Withdrawn" &&
        item.stage !== "Accepted"
    ).length;

    const finals = interviews.filter(
      (item) => item.stage === "Final"
    ).length;

    const offers = interviews.filter(
      (item) =>
        item.stage === "Offer" || item.stage === "Accepted"
    ).length;

    const followUps = interviews.filter(
      (item) =>
        item.followUpDate &&
        isPast(item.followUpDate) &&
        item.stage !== "Rejected" &&
        item.stage !== "Withdrawn" &&
        item.stage !== "Accepted"
    ).length;

    return {
      active,
      finals,
      offers,
      followUps,
    };
  }, [interviews]);

  const companyStats = useMemo(() => {
    return {
      total: companies.length,
      high: companies.filter((item) => item.priority === "High").length,
      active: companies.filter(
        (item) =>
          item.status !== "Closed" &&
          item.status !== "Applied"
      ).length,
      interviewing: companies.filter(
        (item) => item.status === "Interviewing"
      ).length,
    };
  }, [companies]);

  const first72Progress = Math.round(
    (new Set(completed72).size / 18) * 100
  );

  const weeklyProgress = Math.round(
    (new Set(completedPlan).size / 12) * 100
  );

  const dashboardTasks = useMemo(() => {
    const items: {
      id: string;
      title: string;
      description: string;
      href: string;
      priority: "HIGH" | "MEDIUM";
    }[] = [];

    if (completed72.length < 18) {
      items.push({
        id: "72-hours",
        title: "Finish your First 72 Hours checklist",
        description: `${new Set(completed72).size}/18 immediate recovery actions complete.`,
        href: "/first-72-hours",
        priority: "HIGH",
      });
    }

    if (interviewStats.followUps > 0) {
      items.push({
        id: "follow-ups",
        title: `Follow up on ${interviewStats.followUps} interview${
          interviewStats.followUps === 1 ? "" : "s"
        }`,
        description: "You have follow-ups whose dates have passed.",
        href: "/interviews",
        priority: "HIGH",
      });
    }

    const targetCompanies = companies.filter(
      (item) =>
        item.status !== "Closed" &&
        item.status !== "Applied"
    );

    if (targetCompanies.length > 0) {
      items.push({
        id: "companies",
        title: "Work your target-company list",
        description: `${targetCompanies.length} active companies are in your pipeline.`,
        href: "/companies",
        priority: "MEDIUM",
      });
    } else {
      items.push({
        id: "companies",
        title: "Build your target-company list",
        description: "Add companies worth pursuing this week.",
        href: "/companies",
        priority: "MEDIUM",
      });
    }

    if (applications.length === 0) {
      items.push({
        id: "applications",
        title: "Add your first applications",
        description: "Start building a measurable job-search pipeline.",
        href: "/job-search",
        priority: "HIGH",
      });
    } else {
      items.push({
        id: "applications",
        title: "Keep your application pipeline moving",
        description: `${applications.length} applications currently tracked.`,
        href: "/job-search",
        priority: "MEDIUM",
      });
    }

    if (completedPlan.length < 12) {
      items.push({
        id: "plan",
        title: "Execute this week's recovery plan",
        description: `${new Set(completedPlan).size}/12 weekly actions complete.`,
        href: "/plan",
        priority: "MEDIUM",
      });
    }

    return items.slice(0, 5);
  }, [
    completed72.length,
    interviewStats.followUps,
    companies,
    applications.length,
    completedPlan.length,
  ]);

  const nextInterview = useMemo(() => {
    return [...interviews]
      .filter(
        (item) =>
          isUpcoming(item.interviewDate) &&
          item.stage !== "Rejected" &&
          item.stage !== "Withdrawn" &&
          item.stage !== "Accepted"
      )
      .sort(
        (a, b) =>
          new Date(`${a.interviewDate}T00:00:00`).getTime() -
          new Date(`${b.interviewDate}T00:00:00`).getTime()
      )[0];
  }, [interviews]);

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <p className="text-sm text-[#77776f]">Loading your recovery OS...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <header className="mb-12 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            LayoffOS
          </Link>

          <Link
            href="/start"
            className="rounded-full border border-[#d8d8d2] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-[#f0f0ec]"
          >
            Recovery profile
          </Link>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#77776f]">
            Recovery Command Center
          </p>

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-5xl font-bold tracking-[-0.045em] md:text-6xl">
                Here&apos;s where
                <br />
                you stand.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#72726b]">
                Your runway, pipeline, interviews, target companies, and
                immediate actions — pulled together in one place.
              </p>
            </div>

            <Link
              href="/plan"
              className="rounded-xl bg-[#111] px-6 py-3.5 text-center text-sm font-bold text-white hover:opacity-90"
            >
              Open this week&apos;s plan →
            </Link>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <SummaryCard
            label="Financial runway"
            value={`${formatRunway(runway)} mo`}
            href="/runway"
          />

          <SummaryCard
            label="Applications"
            value={applicationStats.total}
            href="/job-search"
          />

          <SummaryCard
            label="Active interviews"
            value={interviewStats.active}
            href="/interviews"
          />

          <SummaryCard
            label="Target companies"
            value={companyStats.total}
            href="/companies"
          />
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl bg-[#111] p-7 text-white md:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#999]">
              Current position
            </p>

            <div className="mt-5 flex flex-col justify-between gap-8 md:flex-row">
              <div>
                <p className="text-6xl font-bold tracking-[-0.06em]">
                  {formatRunway(runway)}
                </p>

                <p className="mt-2 text-[#aaa]">
                  months of estimated financial runway
                </p>
              </div>

              <div className="md:max-w-xs md:text-right">
                <p className="text-sm font-semibold text-white">
                  {recovery.stage || "Recovery profile not completed"}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#aaa]">
                  {recovery.focus
                    ? `Main focus: ${recovery.focus}`
                    : "Complete your recovery profile to personalize this dashboard."}
                </p>
              </div>
            </div>

            <div className="mt-8 h-px bg-[#333]" />

            <div className="mt-7 grid gap-6 sm:grid-cols-3">
              <DarkStat
                label="Applications"
                value={applicationStats.total}
              />
              <DarkStat
                label="Finals"
                value={Math.max(
                  applicationStats.finals,
                  interviewStats.finals
                )}
              />
              <DarkStat
                label="Offers"
                value={Math.max(
                  applicationStats.offers,
                  interviewStats.offers
                )}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[#deded8] bg-white p-7 md:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
              Momentum
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Your recovery engine
            </h2>

            <ProgressRow
              label="First 72 Hours"
              value={first72Progress}
              href="/first-72-hours"
            />

            <ProgressRow
              label="Weekly plan"
              value={weeklyProgress}
              href="/plan"
            />

            <div className="mt-7 rounded-2xl bg-[#f5f5f1] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#999990]">
                Next interview
              </p>

              {nextInterview ? (
                <>
                  <p className="mt-2 text-lg font-bold">
                    {nextInterview.company}
                  </p>
                  <p className="mt-1 text-sm text-[#77776f]">
                    {nextInterview.role}
                  </p>
                  <p className="mt-3 text-sm font-semibold">
                    {new Date(
                      `${nextInterview.interviewDate}T00:00:00`
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[#77776f]">
                  No upcoming interview tracked yet.
                </p>
              )}

              <Link
                href="/interviews"
                className="mt-4 inline-block text-sm font-bold underline underline-offset-4"
              >
                Open Interviews OS →
              </Link>
            </div>
          </div>
        </section>

        {recoveryEngine && (
          <section className="mb-10">
            <div className="rounded-3xl border border-[#deded8] bg-white p-7 md:p-9">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                <div className="max-w-3xl">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                    Recovery engine
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                      {recoveryEngine.stateLabel}
                    </h2>

                    <span className="rounded-full bg-[#f1f1ec] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#66665f]">
                      {recoveryEngine.state.replaceAll("_", " ")}
                    </span>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[#66665f]">
                    {recoveryEngine.stateReason}
                  </p>
                </div>

                <div className="min-w-[150px] rounded-2xl bg-[#f7f7f4] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                    Runway
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {recoveryEngine.runwayMonths === null
                      ? "—"
                      : `${recoveryEngine.runwayMonths.toFixed(1)} mo`}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                    Current priorities
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {recoveryEngine.priorities.map((priority) => (
                      <span
                        key={priority}
                        className="rounded-full border border-[#deded8] px-3 py-2 text-sm text-[#33332f]"
                      >
                        {priority}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#deded8] bg-[#fafaf7] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                        Next transition
                      </p>

                      <h3 className="mt-2 font-semibold text-[#111]">
                        {recoveryEngine.transition.label}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-[#66665f]">
                        {recoveryEngine.transition.reason}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-[#deded8] px-3 py-1 text-xs font-semibold text-[#55554f]">
                      {recoveryEngine.transition.nextState.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                    Recommended next actions
                  </p>

                  <div className="mt-4 space-y-3">
                    {recoveryEngine.actions.slice(0, 3).map((action) => {
                      const actionKey = `${action.title}-${action.href}`;
                      const isCompleting =
                        completingRecoveryAction === actionKey;

                      return (
                        <div
                          key={actionKey}
                          className="rounded-2xl border border-[#deded8] p-4 transition hover:border-[#bdbdb5] hover:bg-[#fafaf7]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <Link
                              href={action.href}
                              className="min-w-0 flex-1"
                            >
                              <h3 className="font-semibold text-[#111]">
                                {action.title}
                              </h3>

                              <p className="mt-1 text-sm leading-5 text-[#66665f]">
                                {action.reason}
                              </p>

                              {action.evidence && (
                                <p className="mt-2 text-xs font-medium text-[#888880]">
                                  Evidence: {action.evidence}
                                </p>
                              )}
                            </Link>

                            <span className="shrink-0 text-lg text-[#77776f]">
                              →
                            </span>
                          </div>

                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => completeRecoveryAction(action)}
                              disabled={isCompleting}
                              className="rounded-xl border border-[#d4d4ce] px-3 py-2 text-xs font-semibold text-[#111] transition hover:bg-[#f4f4ef] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isCompleting
                                ? "Marking complete..."
                                : "Mark complete"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                What to do next
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Your next actions.
              </h2>
            </div>

            <Link
              href="/plan"
              className="hidden text-sm font-bold underline underline-offset-4 md:block"
            >
              Full weekly plan →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {dashboardTasks.map((task) => (
              <Link
                key={task.id}
                href={task.href}
                className="group rounded-2xl border border-[#deded8] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#bdbdb5]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] ${
                        task.priority === "HIGH"
                          ? "bg-[#111] text-white"
                          : "bg-[#eeeeea] text-[#66665f]"
                      }`}
                    >
                      {task.priority}
                    </span>

                    <h3 className="mt-4 text-lg font-bold">
                      {task.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#77776f]">
                      {task.description}
                    </p>
                  </div>

                  <span className="text-xl transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
              Your operating system
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Everything in one place.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ToolCard
              href="/runway"
              title="Financial Runway"
              description="Know how long your current cash position can support you."
              metric={`${formatRunway(runway)} months`}
            />

            <ToolCard
              href="/job-search"
              title="Job Search OS"
              description="Track applications from first submission to offer."
              metric={`${applicationStats.total} applications`}
            />

            <ToolCard
              href="/networking"
              title="Networking OS"
              description="Turn your professional network into a structured pipeline."
              metric="Open"
            />

            <ToolCard
              href="/companies"
              title="Target Companies"
              description="Build and work a focused list of companies worth pursuing."
              metric={`${companyStats.total} companies`}
            />

            <ToolCard
              href="/interviews"
              title="Interviews & Offers"
              description="Track conversations, finals, follow-ups, and offers."
              metric={`${interviewStats.active} active`}
            />

            <ToolCard
              href="/first-72-hours"
              title="First 72 Hours"
              description="Handle the immediate aftermath without trying to solve everything at once."
              metric={`${new Set(completed72).size}/18 done`}
            />
          </div>
        </section>

        <footer className="py-12 text-center text-sm text-[#999990]">
          LayoffOS · A practical recovery system for your next move.
        </footer>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[#deded8] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#bdbdb5]"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>

      <p className="mt-3 text-sm font-semibold text-[#77776f]">
        Open →
      </p>
    </Link>
  );
}

function DarkStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#888]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="mt-7 block">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-[#77776f]">{value}%</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8e8e3]">
        <div
          className="h-full rounded-full bg-[#111] transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </Link>
  );
}

function ToolCard({
  href,
  title,
  description,
  metric,
}: {
  href: string;
  title: string;
  description: string;
  metric: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#deded8] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#bdbdb5]"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-bold">{title}</h3>

        <span className="text-lg transition group-hover:translate-x-1">
          →
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-[#77776f]">
        {description}
      </p>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#999990]">
        {metric}
      </p>
    </Link>
  );
}
