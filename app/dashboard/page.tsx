"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/browser";

type RecoveryEngineResult = {
  state: string;
  stateLabel: string;
  stateReason: string;
  runwayMonths: number | null;
  pipelineHealth: {
    status: "HEALTHY" | "FRAGILE" | "THIN";
    headline: string;
    summary: string;
    depth: number;
    conversion: number | null;
    progression: number | null;
    balance:
      | "BALANCED"
      | "APPLICATION_HEAVY"
      | "INTERVIEW_HEAVY"
      | "OFFER_HEAVY";
    signals: string[];
  };
  momentum: {
    status: "ACCELERATING" | "STEADY" | "STALLING" | "REVERSING";
    headline: string;
    summary: string;
    direction: "FORWARD" | "FLAT" | "BACKWARD";
    recentAdvances: number;
    recentSetbacks: number;
    recentClosures: number;
    signals: string[];
  };
  outcome: {
    status: "POSITIVE" | "MIXED" | "NEGATIVE" | "NONE";
    headline: string;
    summary: string;
    evidence: string[];
    recommendation: string;
  };
  recalibration: {
    needed: boolean;
    headline: string;
    summary: string;
    reason: string;
    nextFocus:
      | "FINANCIAL"
      | "APPLICATIONS"
      | "NETWORKING"
      | "INTERVIEWS"
      | "DIRECTION";
  };
  actionEffect: {
    status: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "UNKNOWN";
    headline: string;
    summary: string;
    evidence: string[];
    recommendation: string;
  };
  actionRecalibration: {
    actionTitle: string | null;
    decision: "REPEAT" | "MODIFY" | "RETIRE" | "HOLD";
    reason: string;
    evidence: string[];
  };
  actionMemory: {
    actionTitle: string | null;
    instances: number;
    positive: number;
    negative: number;
    neutral: number;
    unknown: number;
    positiveRate: number | null;
    negativeRate: number | null;
    confidence: "LOW" | "MEDIUM" | "HIGH";
    recommendation: "REPEAT" | "MODIFY" | "RETIRE" | "HOLD";
    evidence: string[];
  };
  situation: {
    headline: string;
    summary: string;
    risk: string | null;
  };
  change: {
    headline: string;
    summary: string;
    implication: string;
  } | null;
  bottleneck: {
    headline: string;
    summary: string;
    focus: string;
  };
  readiness: {
    ready: boolean;
    headline: string;
    summary: string;
    blockers: string[];
    nextState: string;
  };
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
  recentProgression: {
    type: "application" | "interview";
    company: string;
    role: string;
    previousStage: string;
    newStage: string;
  } | null;
  pipelineSignal: string;
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

  const [lastCompletedRecoveryAction, setLastCompletedRecoveryAction] =
    useState<string | null>(null);

  const [recoveryActionError, setRecoveryActionError] =
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
    setRecoveryActionError(null);

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
        setRecoveryActionError(
          "LayoffOS could not save that completion. Try again.",
        );
        return;
      }

      setLastCompletedRecoveryAction(action.title);

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
            <div className="rounded-3xl border border-[#deded8] bg-white p-5 sm:p-7 md:p-9">

              {/* ENGINE HEADER */}
              <div className="flex flex-col gap-5 border-b border-[#deded8] pb-7 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                    Recovery engine
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-bold tracking-tight text-[#111]">
                      {recoveryEngine.stateLabel}
                    </h2>

                    <span className="rounded-full bg-[#f1f1ec] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#66665f]">
                      {recoveryEngine.state.replaceAll("_", " ")}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#66665f]">
                    {recoveryEngine.stateReason}
                  </p>
                </div>

                <div className="w-full shrink-0 rounded-2xl bg-[#f7f7f4] px-5 py-4 sm:w-[170px]">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                    Runway
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#111]">
                    {recoveryEngine.runwayMonths === null
                      ? "—"
                      : `${recoveryEngine.runwayMonths.toFixed(1)} mo`}
                  </p>
                </div>
              </div>

              {/* CURRENT SITUATION */}
              <div className="mt-7 rounded-2xl border border-[#deded8] bg-[#f7f7f4] p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                  Current situation
                </p>

                <h3 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight text-[#111]">
                  {recoveryEngine.situation.headline}
                </h3>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#66665f]">
                  {recoveryEngine.situation.summary}
                </p>

                {recoveryEngine.change && (
                  <div className="mt-6 grid gap-5 border-t border-[#deded8] pt-5 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                        What changed
                      </p>

                      <p className="mt-2 text-sm font-semibold leading-5 text-[#22221f]">
                        {recoveryEngine.change.headline}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#66665f]">
                        {recoveryEngine.change.summary}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                        Why it matters
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#66665f]">
                        {recoveryEngine.change.implication}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 border-t border-[#deded8] pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                    What's blocking recovery
                  </p>

                  <p className="mt-2 text-base font-bold leading-6 text-[#22221f]">
                    {recoveryEngine.bottleneck.headline}
                  </p>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#66665f]">
                    {recoveryEngine.bottleneck.summary}
                  </p>

                  <p className="mt-3 text-xs font-semibold leading-5 text-[#888880]">
                    Focus: {recoveryEngine.bottleneck.focus}
                  </p>
                </div>
              </div>

              {/* RECOVERY SIGNALS */}
              <div className="mt-7">
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                    Recovery signals
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[#66665f]">
                    The signals LayoffOS is using to determine what matters next.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  {/* READINESS */}
                  <div className="rounded-2xl border border-[#deded8] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                        Transition readiness
                      </p>

                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#55554f]">
                        {recoveryEngine.readiness.ready ? "Ready" : "Not ready"}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold tracking-tight text-[#111]">
                      {recoveryEngine.readiness.headline}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#66665f]">
                      {recoveryEngine.readiness.summary}
                    </p>

                    {recoveryEngine.readiness.blockers.length > 0 && (
                      <ul className="mt-4 space-y-1">
                        {recoveryEngine.readiness.blockers.map((blocker) => (
                          <li
                            key={blocker}
                            className="text-xs leading-5 text-[#66665f]"
                          >
                            • {blocker}
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="mt-4 text-xs font-semibold text-[#888880]">
                      Next state:{" "}
                      {recoveryEngine.readiness.nextState.replaceAll("_", " ")}
                    </p>
                  </div>

                  {/* PIPELINE */}
                  <div className="rounded-2xl border border-[#deded8] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                        Pipeline health
                      </p>

                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#55554f]">
                        {recoveryEngine.pipelineHealth.status}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold tracking-tight text-[#111]">
                      {recoveryEngine.pipelineHealth.headline}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#66665f]">
                      {recoveryEngine.pipelineHealth.summary}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#888880]">
                          Depth
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#111]">
                          {recoveryEngine.pipelineHealth.depth}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#888880]">
                          Conversion
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#111]">
                          {recoveryEngine.pipelineHealth.conversion === null
                            ? "—"
                            : `${recoveryEngine.pipelineHealth.conversion}%`}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#888880]">
                          Progression
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#111]">
                          {recoveryEngine.pipelineHealth.progression === null
                            ? "—"
                            : `${recoveryEngine.pipelineHealth.progression}%`}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#888880]">
                          Balance
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#111]">
                          {recoveryEngine.pipelineHealth.balance.replaceAll(
                            "_",
                            " "
                          )}
                        </p>
                      </div>
                    </div>

                    {recoveryEngine.pipelineHealth.signals.length > 0 && (
                      <ul className="mt-4 space-y-1 border-t border-[#deded8] pt-4">
                        {recoveryEngine.pipelineHealth.signals.map((signal) => (
                          <li
                            key={signal}
                            className="text-xs leading-5 text-[#66665f]"
                          >
                            • {signal}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* MOMENTUM */}
                  <div className="rounded-2xl border border-[#deded8] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                        Recovery momentum
                      </p>

                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#55554f]">
                        {recoveryEngine.momentum.status}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold tracking-tight text-[#111]">
                      {recoveryEngine.momentum.headline}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#66665f]">
                      {recoveryEngine.momentum.summary}
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880]">
                          Advances
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#111]">
                          {recoveryEngine.momentum.recentAdvances}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880]">
                          Setbacks
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#111]">
                          {recoveryEngine.momentum.recentSetbacks}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880]">
                          Closures
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#111]">
                          {recoveryEngine.momentum.recentClosures}
                        </p>
                      </div>
                    </div>

                    {recoveryEngine.momentum.signals.length > 0 && (
                      <ul className="mt-4 space-y-1 border-t border-[#deded8] pt-4">
                        {recoveryEngine.momentum.signals.map((signal) => (
                          <li
                            key={signal}
                            className="text-xs leading-5 text-[#66665f]"
                          >
                            • {signal}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* OUTCOME */}
                  <div className="rounded-2xl border border-[#deded8] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                        Recovery outcome
                      </p>

                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#55554f]">
                        {recoveryEngine.outcome.status}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold tracking-tight text-[#111]">
                      {recoveryEngine.outcome.headline}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#66665f]">
                      {recoveryEngine.outcome.summary}
                    </p>

                    {recoveryEngine.outcome.evidence.length > 0 && (
                      <ul className="mt-4 space-y-1">
                        {recoveryEngine.outcome.evidence.map((item) => (
                          <li
                            key={item}
                            className="text-xs leading-5 text-[#66665f]"
                          >
                            • {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="mt-4 text-sm font-semibold leading-5 text-[#44443f]">
                      {recoveryEngine.outcome.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION INTELLIGENCE */}
              <div className="mt-7 rounded-2xl border border-[#deded8] bg-[#fafaf7] p-5 sm:p-6">
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                    Action intelligence
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[#66665f]">
                    What LayoffOS learned from the actions you have completed.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                  {/* EFFECT */}
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#888880]">
                        Action effect
                      </p>

                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#55554f]">
                        {recoveryEngine.actionEffect.status}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold leading-5 text-[#111]">
                      {recoveryEngine.actionEffect.headline}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#66665f]">
                      {recoveryEngine.actionEffect.summary}
                    </p>

                    {recoveryEngine.actionEffect.evidence.length > 0 && (
                      <ul className="mt-4 space-y-1">
                        {recoveryEngine.actionEffect.evidence.map((item) => (
                          <li
                            key={item}
                            className="text-xs leading-5 text-[#66665f]"
                          >
                            • {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="mt-4 text-xs font-semibold leading-5 text-[#55554f]">
                      {recoveryEngine.actionEffect.recommendation}
                    </p>
                  </div>

                  {/* RECALIBRATION */}
                  <div className="border-t border-[#deded8] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#888880]">
                        Action recalibration
                      </p>

                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#55554f]">
                        {recoveryEngine.actionRecalibration.decision}
                      </span>
                    </div>

                    {recoveryEngine.actionRecalibration.actionTitle && (
                      <h3 className="mt-3 text-base font-bold leading-5 text-[#111]">
                        {recoveryEngine.actionRecalibration.actionTitle}
                      </h3>
                    )}

                    <p className="mt-2 text-sm leading-6 text-[#66665f]">
                      {recoveryEngine.actionRecalibration.reason}
                    </p>

                    {recoveryEngine.actionRecalibration.evidence.length > 0 && (
                      <ul className="mt-4 space-y-1">
                        {recoveryEngine.actionRecalibration.evidence.map(
                          (item) => (
                            <li
                              key={item}
                              className="text-xs leading-5 text-[#66665f]"
                            >
                              • {item}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>

                  {/* MEMORY */}
                  <div className="border-t border-[#deded8] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#888880]">
                        Action memory
                      </p>

                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#55554f]">
                        {recoveryEngine.actionMemory.confidence}
                      </span>
                    </div>

                    {recoveryEngine.actionMemory.actionTitle && (
                      <h3 className="mt-3 text-base font-bold leading-5 text-[#111]">
                        {recoveryEngine.actionMemory.actionTitle}
                      </h3>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880]">
                          Instances
                        </p>
                        <p className="mt-1 text-base font-bold text-[#111]">
                          {recoveryEngine.actionMemory.instances}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880]">
                          Positive
                        </p>
                        <p className="mt-1 text-base font-bold text-[#111]">
                          {recoveryEngine.actionMemory.positive}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880]">
                          Negative
                        </p>
                        <p className="mt-1 text-base font-bold text-[#111]">
                          {recoveryEngine.actionMemory.negative}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880]">
                          Unknown
                        </p>
                        <p className="mt-1 text-base font-bold text-[#111]">
                          {recoveryEngine.actionMemory.unknown}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#deded8] pt-4">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#888880]">
                        Historical recommendation
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#111]">
                        {recoveryEngine.actionMemory.recommendation}
                      </p>

                      {recoveryEngine.actionMemory.positiveRate !== null && (
                        <p className="mt-1 text-xs text-[#66665f]">
                          Positive rate:{" "}
                          {Math.round(
                            recoveryEngine.actionMemory.positiveRate * 100
                          )}
                          %
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RECALIBRATION */}
              <div className="mt-7 rounded-2xl border border-[#deded8] p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                      Recovery recalibration
                    </p>

                    <h3 className="mt-2 text-xl font-bold tracking-tight text-[#111]">
                      {recoveryEngine.recalibration.headline}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#66665f]">
                      {recoveryEngine.recalibration.summary}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-[#55554f]">
                    {recoveryEngine.recalibration.needed
                      ? "Needed"
                      : "Not needed"}
                  </span>
                </div>

                <div className="mt-5 grid gap-5 border-t border-[#deded8] pt-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#888880]">
                      Reason
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#66665f]">
                      {recoveryEngine.recalibration.reason}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#888880]">
                      Next focus
                    </p>

                    <p className="mt-2 text-sm font-bold text-[#111]">
                      {recoveryEngine.recalibration.nextFocus.replaceAll(
                        "_",
                        " "
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* RISK / PRIORITIES / TRANSITION */}
              <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">

                {recoveryEngine.situation.risk && (
                  <div className="rounded-2xl border border-[#deded8] p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                      Risk
                    </p>

                    <p className="mt-3 text-sm font-semibold leading-6 text-[#44443f]">
                      {recoveryEngine.situation.risk}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-[#deded8] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                    Priorities
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {recoveryEngine.priorities.map((priority) => (
                      <span
                        key={priority}
                        className="rounded-full bg-[#f1f1ec] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#55554f]"
                      >
                        {priority.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#deded8] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                    Transition
                  </p>

                  <p className="mt-3 text-base font-bold text-[#111]">
                    {recoveryEngine.transition.label}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#66665f]">
                    {recoveryEngine.transition.reason}
                  </p>

                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#888880]">
                    Next state:{" "}
                    {recoveryEngine.transition.nextState.replaceAll("_", " ")}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#deded8] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
                    Pipeline signal
                  </p>

                  <p className="mt-3 text-base font-bold text-[#111]">
                    {recoveryEngine.pipelineSignal.replaceAll("_", " ")}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#66665f]">
                    {recoveryEngine.pipelineSignal === "OFFER_STAGE"
                      ? "An offer-stage opportunity is driving the current recovery state."
                      : recoveryEngine.pipelineSignal === "SETBACK"
                        ? "Recent pipeline movement indicates a setback."
                        : recoveryEngine.pipelineSignal === "BUILDING"
                          ? "The recovery pipeline is being rebuilt."
                          : recoveryEngine.pipelineSignal === "ACTIVE"
                            ? "Active recovery activity is underway."
                            : "No dominant pipeline signal is currently detected."}
                  </p>
                </div>
              </div>

              {/* RECENT PROGRESSION */}
              {recoveryEngine.recentProgression && (
                <div className="mt-7 rounded-2xl border border-[#deded8] bg-[#fafaf7] p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                    Recent progression
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880]">
                        Company
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#111]">
                        {recoveryEngine.recentProgression.company}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880]">
                        Role
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#111]">
                        {recoveryEngine.recentProgression.role}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888880]">
                        Movement
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#111]">
                        {recoveryEngine.recentProgression.previousStage} →{" "}
                        {recoveryEngine.recentProgression.newStage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* EXECUTION */}
              <div className="mt-7 rounded-2xl border border-[#111] bg-[#111] p-5 text-white sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b8b8b0]">
                      Recovery execution
                    </p>

                    <h3 className="mt-2 text-2xl font-bold tracking-tight">
                      Do the next useful thing.
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#c7c7c0]">
                      Complete one action, then let LayoffOS recalculate what
                      matters next.
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl bg-white/10 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#b8b8b0]">
                      Ready now
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {recoveryEngine.actions.length} actions
                    </p>
                  </div>
                </div>

                {lastCompletedRecoveryAction && (
                  <div className="mt-5 rounded-xl bg-white/10 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#b8b8b0]">
                      Just completed
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {lastCompletedRecoveryAction}
                    </p>

                    {recoveryEngine.actions.length > 0 && (
                      <p className="mt-1 text-xs leading-5 text-[#c7c7c0]">
                        Your next recommendation is ready below.
                      </p>
                    )}
                  </div>
                )}

                {recoveryActionError && (
                  <div className="mt-5 rounded-xl bg-white/10 px-4 py-3">
                    <p className="text-xs font-semibold leading-5 text-[#deded8]">
                      {recoveryActionError}
                    </p>
                  </div>
                )}

                <div className="mt-6 border-t border-white/15 pt-6">
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b8b8b0]">
                      Recommended next actions
                    </p>
                  </div>

                  {recoveryEngine.actions.length === 0 ? (
                    <p className="text-sm leading-6 text-[#c7c7c0]">
                      No additional recovery actions are currently queued.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {recoveryEngine.actions.slice(0, 3).map((action) => {
                        const actionKey = `${action.title}-${action.href}`;
                        const isCompleting =
                          completingRecoveryAction === actionKey;

                        return (
                          <div
                            key={actionKey}
                            className="rounded-2xl border border-white/15 bg-white/[0.04] p-4"
                          >
                            <Link
                              href={action.href}
                              className="block"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#b8b8b0]">
                                    {action.priority}
                                  </p>

                                  <h4 className="mt-2 text-base font-bold leading-5">
                                    {action.title}
                                  </h4>

                                  <p className="mt-2 text-sm leading-6 text-[#c7c7c0]">
                                    {action.reason}
                                  </p>

                                  {action.evidence && (
                                    <p className="mt-2 text-xs leading-5 text-[#a9a9a2]">
                                      Evidence: {action.evidence}
                                    </p>
                                  )}
                                </div>

                                <span className="shrink-0 text-lg text-[#b8b8b0]">
                                  →
                                </span>
                              </div>
                            </Link>

                            <button
                              type="button"
                              onClick={() => completeRecoveryAction(action)}
                              disabled={isCompleting}
                              className="mt-4 w-full rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-[#111] transition hover:bg-[#eeeeea] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isCompleting
                                ? "Marking complete..."
                                : "Mark complete"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                className="group rounded-2xl border border-[#deded8] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#bdbdb5]"
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
      className="rounded-2xl border border-[#deded8] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#bdbdb5]"
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
      className="group rounded-2xl border border-[#deded8] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#bdbdb5]"
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
