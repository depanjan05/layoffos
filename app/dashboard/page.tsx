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
  const [runwayData, setRunwayData] = useState<RunwayData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [completed72, setCompleted72] = useState<string[]>([]);
  const [completedPlan, setCompletedPlan] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
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

      setApplications(parseArray<Application>(APPLICATIONS_KEY));
      setCompanies(parseArray<Company>(COMPANIES_KEY));
      setInterviews(parseArray<Interview>(INTERVIEWS_KEY));
      setCompletedTasks(parseArray<string>(TASKS_KEY));
      setCompleted72(parseArray<string>(HOURS_KEY));
      setCompletedPlan(parseArray<string>(PLAN_KEY));
    } catch {
      // Keep defaults if localStorage contains malformed data.
    } finally {
      setHydrated(true);
    }
  }, []);

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
    (completed72.length / 18) * 100
  );

  const weeklyProgress = Math.round(
    (completedPlan.length / 12) * 100
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
        description: `${completed72.length}/18 immediate recovery actions complete.`,
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
        description: `${completedPlan.length}/12 weekly actions complete.`,
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
              metric={`${completed72.length}/18 done`}
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
