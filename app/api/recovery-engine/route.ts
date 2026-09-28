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
  ]);

  const result = calculateRecovery({
    recoveryTiming: profileResult.data?.recovery_timing,
    employmentStatus: profileResult.data?.employment_status,
    careerStage: profileResult.data?.career_stage,
    targetWorkType: profileResult.data?.target_work_type,
    primaryFocus: profileResult.data?.primary_focus,

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
  });

  return NextResponse.json(result);
}
