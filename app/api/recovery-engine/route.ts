import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { calculateRecovery } from "@/lib/recovery-engine";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const [
    profileResult,
    financialResult,
    applicationsResult,
    interviewsResult,
    companiesResult,
    networkingResult,
    completedActionsResult,
    progressionEventsResult,
    applicationActionEventsResult,
    weeklyPlanTaskEventsResult,
    recoveryCycleEventsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "recovery_timing, employment_status, career_stage, target_work_type, primary_focus"
      )
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("financial_profiles")
      .select(
        "savings, severance, monthly_expenses, monthly_debt, other_income, benefits, upcoming_expenses"
      )
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("applications")
      .select("stage, company, role")
      .eq("user_id", user.id),

    supabase
      .from("interviews")
      .select(
        "stage, company, role, interview_date, follow_up_date, next_action"
      )
      .eq("user_id", user.id),

    supabase
      .from("companies")
      .select("status, priority")
      .eq("user_id", user.id),

    supabase
      .from("network_contacts")
      .select(
        "name, company, role, status, last_contacted, next_action, linked_application_id"
      )
      .eq("user_id", user.id),

    supabase
      .from("events")
      .select("event_type, entity_type, metadata")
      .eq("user_id", user.id)
      .eq("event_type", "recovery_action_completed")
      .eq("entity_type", "recovery_action"),

    supabase
      .from("events")
      .select("event_type, entity_type, metadata, created_at")
      .eq("user_id", user.id)
      .in("entity_type", [
        "application_progression",
        "interview_progression",
      ])
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("events")
      .select("event_type, entity_type, metadata, created_at")
      .eq("user_id", user.id)
      .eq("event_type", "application_action_completed")
      .eq("entity_type", "application_action")
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("events")
      .select("event_type, entity_type, metadata, created_at")
      .eq("user_id", user.id)
      .eq("event_type", "weekly_plan_task_completed")
      .eq("entity_type", "weekly_plan_task")
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("events")
      .select("event_type, entity_type, metadata, created_at")
      .eq("user_id", user.id)
      .eq("event_type", "recovery_cycle_recorded")
      .eq("entity_type", "recovery_cycle")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const previousRecoveryCycleState = (() => {
    const event = recoveryCycleEventsResult.data?.[0];

    const metadata =
      event?.metadata &&
      typeof event.metadata === "object" &&
      !Array.isArray(event.metadata)
        ? (event.metadata as {
            status?: unknown;
            reason?: unknown;
            source?: unknown;
          })
        : null;

    if (
      metadata?.status !== "CONTINUE" &&
      metadata?.status !== "REASSESS" &&
      metadata?.status !== "RESET"
    ) {
      return null;
    }

    if (typeof metadata.reason !== "string" || !metadata.reason.trim()) {
      return null;
    }

    if (
      metadata.source !== "HOLD" &&
      metadata.source !== "REASSESS" &&
      metadata.source !== "PERSISTENCE_RESET"
    ) {
      return null;
    }

    return {
      status: metadata.status as "CONTINUE" | "REASSESS" | "RESET",
      reason: metadata.reason,
      source: metadata.source as
        | "HOLD"
        | "REASSESS"
        | "PERSISTENCE_RESET",
    };
  })();

  const result = calculateRecovery({
    recoveryTiming: profileResult.data?.recovery_timing,
    employmentStatus: profileResult.data?.employment_status,
    careerStage: profileResult.data?.career_stage,
    targetWorkType: profileResult.data?.target_work_type,
    primaryFocus: profileResult.data?.primary_focus,
    previousRecoveryCycleState,

    savings: financialResult.data?.savings ?? 0,
    severance: financialResult.data?.severance ?? 0,
    monthlyExpenses: financialResult.data?.monthly_expenses ?? 0,
    monthlyDebt: financialResult.data?.monthly_debt ?? 0,
    otherIncome: financialResult.data?.other_income ?? 0,
    benefits: financialResult.data?.benefits ?? 0,
    upcomingExpenses: financialResult.data?.upcoming_expenses ?? 0,

    applications: (applicationsResult.data ?? []).map((item) => ({
      stage: item.stage,
      company: item.company,
      role: item.role,
    })),

    interviews: (interviewsResult.data ?? []).map((item) => ({
      stage: item.stage,
      company: item.company,
      role: item.role,
      interviewDate: item.interview_date,
      followUpDate: item.follow_up_date,
      nextAction: item.next_action,
    })),

    companies: (companiesResult.data ?? []).map((item) => ({
      status: item.status,
      priority: item.priority,
    })),

    networkContacts: (networkingResult.data ?? []).map((item) => ({
      name: item.name,
      company: item.company,
      role: item.role,
      status: item.status,
      lastContacted: item.last_contacted,
      nextAction: item.next_action,
      linkedApplicationId: item.linked_application_id,
    })),

    completedActions: (completedActionsResult.data ?? [])
      .map((event) => {
        const metadata =
          event.metadata &&
          typeof event.metadata === "object" &&
          !Array.isArray(event.metadata)
            ? (event.metadata as {
                title?: string;
                href?: string;
                completed_at?: string;
              })
            : {};

        return {
          title: metadata.title ?? null,
          href: metadata.href ?? null,
          completedAt: metadata.completed_at ?? null,
        };
      })
      .filter((action) => action.title && action.href),

    applicationActionEvents: (applicationActionEventsResult.data ?? [])
      .map((event) => {
        const metadata =
          event.metadata &&
          typeof event.metadata === "object" &&
          !Array.isArray(event.metadata)
            ? (event.metadata as {
                applicationId?: string;
                company?: string;
                role?: string;
                action?: string;
                dueDate?: string | null;
                completedAt?: string;
              })
            : {};

        return {
          applicationId: metadata.applicationId ?? null,
          company: metadata.company ?? null,
          role: metadata.role ?? null,
          action: metadata.action ?? null,
          dueDate: metadata.dueDate ?? null,
          completedAt:
            metadata.completedAt ??
            event.created_at ??
            null,
        };
      }),

    weeklyPlanTaskEvents: (weeklyPlanTaskEventsResult.data ?? [])
      .map((event) => {
        const metadata =
          event.metadata &&
          typeof event.metadata === "object" &&
          !Array.isArray(event.metadata)
            ? (event.metadata as {
                weeklyPlanId?: string;
                taskId?: string;
                title?: string;
                category?: string;
                href?: string;
                completedAt?: string;
              })
            : {};

        return {
          weeklyPlanId: metadata.weeklyPlanId ?? null,
          taskId: metadata.taskId ?? null,
          title: metadata.title ?? null,
          category: metadata.category ?? null,
          href: metadata.href ?? null,
          completedAt:
            metadata.completedAt ??
            event.created_at ??
            null,
        };
      }),
    progressionEvents: (progressionEventsResult.data ?? []).map(
      (event) => ({
        eventType: event.event_type,
        entityType: event.entity_type,
        occurredAt: event.created_at ?? null,
        metadata:
          event.metadata &&
          typeof event.metadata === "object" &&
          !Array.isArray(event.metadata)
            ? (event.metadata as Record<string, unknown>)
            : null,
      })
    ),
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  let body: {
    action?: string;
    title?: string;
    href?: string;
    state?: string;
    cycleState?: {
      status?: string;
      reason?: string;
      source?: string;
    };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (body.action === "record_cycle") {
    const cycleStatus = body.cycleState?.status;
    const cycleReason = body.cycleState?.reason?.trim();
    const cycleSource = body.cycleState?.source;

    if (
      (cycleStatus !== "CONTINUE" &&
        cycleStatus !== "REASSESS" &&
        cycleStatus !== "RESET") ||
      !cycleReason ||
      (cycleSource !== "HOLD" &&
        cycleSource !== "REASSESS" &&
        cycleSource !== "PERSISTENCE_RESET")
    ) {
      return NextResponse.json(
        {
          error:
            "cycleState.status, cycleState.reason, and cycleState.source are required",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("events").insert({
      user_id: user.id,
      event_type: "recovery_cycle_recorded",
      entity_type: "recovery_cycle",
      metadata: {
        status: cycleStatus,
        reason: cycleReason,
        source: cycleSource,
        recorded_at: new Date().toISOString(),
      },
    });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Recovery cycle recorded.",
    });
  }

  const title = body.title?.trim();
  const href = body.href?.trim();
  const state = body.state?.trim();

  if (!title || !href || !state) {
    return NextResponse.json(
      { error: "title, href, and state are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("events").insert({
    user_id: user.id,
    event_type: "recovery_action_completed",
    entity_type: "recovery_action",
    metadata: {
      title,
      href,
      state,
      completed_at: new Date().toISOString(),
    },
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Recovery action marked complete.",
  });
}
