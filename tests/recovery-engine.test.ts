import assert from "node:assert/strict";
import test from "node:test";

import {
  getPipelineHealth,
  getProgressionSignal,
  getRecoveryOutcome,
  getState,
  getWeeklyPlanTaskEffect,
  type RecentProgression,
  type RecoveryEngineInput,
} from "../lib/recovery-engine.ts";

function progression(
  previousStage: string,
  newStage: string,
  type: "application" | "interview" = "interview",
): RecentProgression {
  return {
    type,
    company: "Test Company",
    role: "Test Role",
    previousStage,
    newStage,
    occurredAt: "2026-09-29T10:00:00.000Z",
  };
}

test("forward progression is classified as ADVANCING", () => {
  assert.equal(
    getProgressionSignal(progression("Interview", "Final")),
    "ADVANCING",
  );

  assert.equal(
    getProgressionSignal(progression("Final", "Offer")),
    "ADVANCING",
  );

  assert.equal(
    getProgressionSignal(progression("Offer", "Accepted")),
    "ADVANCING",
  );
});

test("backward progression is classified as SETBACK", () => {
  assert.equal(
    getProgressionSignal(progression("Accepted", "Final")),
    "SETBACK",
  );

  assert.equal(
    getProgressionSignal(progression("Final", "Interview")),
    "SETBACK",
  );
});

test("rejection is classified as SETBACK", () => {
  assert.equal(
    getProgressionSignal(progression("Interview", "Rejected")),
    "SETBACK",
  );
});

test("withdrawal is classified as CLOSED", () => {
  assert.equal(
    getProgressionSignal(progression("Interview", "Withdrawn")),
    "CLOSED",
  );
});

test("unknown or unchanged stage movement remains NEUTRAL", () => {
  assert.equal(
    getProgressionSignal(progression("Interview", "Interview")),
    "NEUTRAL",
  );

  assert.equal(
    getProgressionSignal(progression("Custom Stage A", "Custom Stage B")),
    "NEUTRAL",
  );

  assert.equal(getProgressionSignal(null), "NEUTRAL");
});

test("backward progression produces a backward-movement recovery outcome", () => {
  const result = getRecoveryOutcome(
    progression("Accepted", "Final"),
  );

  assert.equal(result.status, "NEGATIVE");
  assert.match(result.headline, /backward progression signal/i);
  assert.match(result.summary, /Accepted to Final/i);
  assert.ok(result.evidence.some((item) => item === "Accepted → Final"));
  assert.ok(
    result.evidence.some((item) => /stage regressed/i.test(item)),
  );
});

test("rejection produces a lost-opportunity recovery outcome", () => {
  const result = getRecoveryOutcome(
    progression("Interview", "Rejected"),
  );

  assert.equal(result.status, "NEGATIVE");
  assert.match(result.summary, /Interview.*Rejected/i);
  assert.ok(
    result.evidence.some((item) => /opportunity lost/i.test(item)),
  );
});

test("withdrawal produces a closed-opportunity recovery outcome", () => {
  const result = getRecoveryOutcome(
    progression("Final", "Withdrawn"),
  );

  assert.equal(result.status, "NEGATIVE");
  assert.match(result.summary, /Final.*Withdrawn/i);
  assert.ok(
    result.evidence.some((item) => /opportunity closed/i.test(item)),
  );
});

test("forward progression produces a positive recovery outcome", () => {
  const result = getRecoveryOutcome(
    progression("Interview", "Final"),
  );

  assert.equal(result.status, "POSITIVE");
  assert.match(result.summary, /Interview.*Final/i);
});

test("weekly plan task matches only its destination progression type", () => {
  const completedAt = "2026-09-29T10:00:00.000Z";

  const weeklyPlanEvents: RecoveryEngineInput["weeklyPlanTaskEvents"] = [
    {
      weeklyPlanId: "plan-1",
      taskId: "plan-6",
      title: "Complete your offer transition details",
      category: "TRANSITION",
      href: "/interviews",
      completedAt,
    },
  ];

  const applicationProgression = {
    eventType: "application_progression",
    entityType: "application_progression",
    occurredAt: "2026-09-30T10:00:00.000Z",
    metadata: {
      company: "Application Co",
      role: "Engineer",
      previousStage: "Interview",
      newStage: "Final",
    },
  };

  const interviewProgression = {
    eventType: "interview_progression",
    entityType: "interview_progression",
    occurredAt: "2026-09-30T11:00:00.000Z",
    metadata: {
      company: "Interview Co",
      role: "Marketing Head",
      previousStage: "Accepted",
      newStage: "Final",
    },
  };

  const result = getWeeklyPlanTaskEffect(
    weeklyPlanEvents,
    [applicationProgression, interviewProgression],
  );

  assert.equal(result.status, "NEGATIVE");
  assert.equal(result.title, "Complete your offer transition details");
  assert.equal(result.category, "TRANSITION");
  assert.equal(result.progression?.company, "Interview Co");
  assert.equal(result.progression?.previousStage, "Accepted");
  assert.equal(result.progression?.newStage, "Final");
});

test("weekly plan task ignores progression outside its destination", () => {
  const completedAt = "2026-09-29T10:00:00.000Z";

  const weeklyPlanEvents: RecoveryEngineInput["weeklyPlanTaskEvents"] = [
    {
      weeklyPlanId: "plan-1",
      taskId: "plan-3",
      title: "Build targeted application opportunities",
      category: "APPLICATIONS",
      href: "/job-search",
      completedAt,
    },
  ];

  const interviewProgression = {
    eventType: "interview_progression",
    entityType: "interview_progression",
    occurredAt: "2026-09-30T10:00:00.000Z",
    metadata: {
      company: "Interview Co",
      role: "Marketing Head",
      previousStage: "Interview",
      newStage: "Final",
    },
  };

  const result = getWeeklyPlanTaskEffect(
    weeklyPlanEvents,
    [interviewProgression],
  );

  assert.equal(result.status, "UNKNOWN");
  assert.equal(result.progression, null);
});

test("weekly plan task ignores progression before task completion", () => {
  const weeklyPlanEvents: RecoveryEngineInput["weeklyPlanTaskEvents"] = [
    {
      weeklyPlanId: "plan-1",
      taskId: "plan-3",
      title: "Build targeted application opportunities",
      category: "APPLICATIONS",
      href: "/job-search",
      completedAt: "2026-09-29T10:00:00.000Z",
    },
  ];

  const progressionBeforeCompletion = {
    eventType: "application_progression",
    entityType: "application_progression",
    occurredAt: "2026-09-29T09:00:00.000Z",
    metadata: {
      company: "Application Co",
      role: "Engineer",
      previousStage: "Interview",
      newStage: "Final",
    },
  };

  const result = getWeeklyPlanTaskEffect(
    weeklyPlanEvents,
    [progressionBeforeCompletion],
  );

  assert.equal(result.status, "UNKNOWN");
  assert.equal(result.progression, null);
});

test("weekly plan task ignores progression after the 14-day window", () => {
  const weeklyPlanEvents: RecoveryEngineInput["weeklyPlanTaskEvents"] = [
    {
      weeklyPlanId: "plan-1",
      taskId: "plan-3",
      title: "Build targeted application opportunities",
      category: "APPLICATIONS",
      href: "/job-search",
      completedAt: "2026-09-01T10:00:00.000Z",
    },
  ];

  const lateProgression = {
    eventType: "application_progression",
    entityType: "application_progression",
    occurredAt: "2026-09-16T10:00:00.000Z",
    metadata: {
      company: "Application Co",
      role: "Engineer",
      previousStage: "Interview",
      newStage: "Final",
    },
  };

  const result = getWeeklyPlanTaskEffect(
    weeklyPlanEvents,
    [lateProgression],
  );

  assert.equal(result.status, "UNKNOWN");
  assert.equal(result.progression, null);
});

test("non-pipeline weekly plan destinations do not fabricate outcomes", () => {
  const weeklyPlanEvents: RecoveryEngineInput["weeklyPlanTaskEvents"] = [
    {
      weeklyPlanId: "plan-1",
      taskId: "plan-3",
      title: "Review your financial runway",
      category: "FINANCIAL",
      href: "/runway",
      completedAt: "2026-09-29T10:00:00.000Z",
    },
  ];

  const applicationProgression = {
    eventType: "application_progression",
    entityType: "application_progression",
    occurredAt: "2026-09-30T10:00:00.000Z",
    metadata: {
      company: "Application Co",
      role: "Engineer",
      previousStage: "Interview",
      newStage: "Final",
    },
  };

  const result = getWeeklyPlanTaskEffect(
    weeklyPlanEvents,
    [applicationProgression],
  );

  assert.equal(result.status, "UNKNOWN");
  assert.equal(result.progression, null);
});

function stateInput(
  overrides: Partial<RecoveryEngineInput> = {},
): RecoveryEngineInput {
  return {
    recoveryTiming: "last month",
    employmentStatus: "unemployed",
    careerStage: "none",
    applications: [],
    interviews: [],
    ...overrides,
  };
}

function pipeline(
  overrides: Partial<{
    totalApplications: number;
    activeApplications: number;
    activeInterviews: number;
    finalRounds: number;
    offers: number;
    applicationOffers: number;
    interviewOffers: number;
    acceptedOffers: number;
    activeNetworkContacts: number;
  }> = {},
) {
  return {
    totalApplications: 0,
    activeApplications: 0,
    activeInterviews: 0,
    finalRounds: 0,
    offers: 0,
    applicationOffers: 0,
    interviewOffers: 0,
    acceptedOffers: 0,
    activeNetworkContacts: 0,
    ...overrides,
  };
}

test("state machine classifies recovered employment first", () => {
  assert.equal(
    getState(
      stateInput({
        employmentStatus: "employed",
        careerStage: "offer",
        applications: [{ stage: "applied" }],
        interviews: [{ stage: "final" }],
      }),
    ),
    "RECOVERED",
  );

  assert.equal(
    getState(
      stateInput({
        employmentStatus: "unemployed",
        careerStage: "recovered",
      }),
    ),
    "RECOVERED",
  );
});

test("state machine gives offer precedence over final and interview stages", () => {
  assert.equal(
    getState(
      stateInput({
        careerStage: "offer",
        interviews: [{ stage: "final" }],
      }),
    ),
    "OFFER",
  );

  assert.equal(
    getState(
      stateInput({
        interviews: [{ stage: "accepted" }],
      }),
    ),
    "OFFER",
  );
});

test("state machine gives final round precedence over ordinary interviews", () => {
  assert.equal(
    getState(
      stateInput({
        interviews: [
          { stage: "interview" },
          { stage: "final" },
        ],
      }),
    ),
    "FINAL_ROUND",
  );

  assert.equal(
    getState(
      stateInput({
        careerStage: "finals",
      }),
    ),
    "FINAL_ROUND",
  );
});

test("state machine classifies active interviews as INTERVIEWING", () => {
  assert.equal(
    getState(
      stateInput({
        interviews: [{ stage: "interview" }],
      }),
    ),
    "INTERVIEWING",
  );

  assert.equal(
    getState(
      stateInput({
        careerStage: "interviews",
      }),
    ),
    "INTERVIEWING",
  );
});

test("state machine classifies active applications as SEARCHING", () => {
  assert.equal(
    getState(
      stateInput({
        applications: [{ stage: "applied" }],
      }),
    ),
    "SEARCHING",
  );

  assert.equal(
    getState(
      stateInput({
        careerStage: "applying",
      }),
    ),
    "SEARCHING",
  );
});

test("state machine classifies recent layoff timing as JUST_LAID_OFF", () => {
  assert.equal(
    getState(
      stateInput({
        recoveryTiming: "this week",
      }),
    ),
    "JUST_LAID_OFF",
  );

  assert.equal(
    getState(
      stateInput({
        recoveryTiming: "week",
      }),
    ),
    "JUST_LAID_OFF",
  );
});

test("state machine defaults to STABILIZING without active recovery signals", () => {
  assert.equal(
    getState(
      stateInput({
        recoveryTiming: "last month",
      }),
    ),
    "STABILIZING",
  );
});

test("rejected and withdrawn opportunities do not create active pipeline state", () => {
  assert.equal(
    getState(
      stateInput({
        applications: [
          { stage: "rejected" },
          { stage: "withdrawn" },
        ],
      }),
    ),
    "STABILIZING",
  );

  assert.equal(
    getState(
      stateInput({
        interviews: [
          { stage: "rejected" },
          { stage: "withdrawn" },
        ],
      }),
    ),
    "STABILIZING",
  );
});

test("pipeline with an offer or accepted offer is HEALTHY and OFFER_HEAVY", () => {
  const offerResult = getPipelineHealth(
    pipeline({
      activeApplications: 3,
      activeInterviews: 1,
      offers: 1,
      interviewOffers: 1,
    }),
  );

  assert.equal(offerResult.status, "HEALTHY");
  assert.equal(offerResult.balance, "OFFER_HEAVY");

  const acceptedResult = getPipelineHealth(
    pipeline({
      activeApplications: 2,
      acceptedOffers: 1,
      interviewOffers: 1,
    }),
  );

  assert.equal(acceptedResult.status, "HEALTHY");
  assert.equal(acceptedResult.balance, "OFFER_HEAVY");
});

test("pipeline with final rounds or interviews is HEALTHY", () => {
  const finalResult = getPipelineHealth(
    pipeline({
      activeApplications: 2,
      finalRounds: 1,
    }),
  );

  assert.equal(finalResult.status, "HEALTHY");

  const interviewResult = getPipelineHealth(
    pipeline({
      activeApplications: 2,
      activeInterviews: 1,
    }),
  );

  assert.equal(interviewResult.status, "HEALTHY");
});

test("pipeline with multiple applications but no downstream stage is FRAGILE", () => {
  const result = getPipelineHealth(
    pipeline({
      activeApplications: 3,
    }),
  );

  assert.equal(result.status, "FRAGILE");
  assert.equal(result.balance, "APPLICATION_HEAVY");
});

test("pipeline with one or two applications and no downstream stage is also FRAGILE", () => {
  const oneApplication = getPipelineHealth(
    pipeline({
      activeApplications: 1,
    }),
  );

  assert.equal(oneApplication.status, "FRAGILE");

  const twoApplications = getPipelineHealth(
    pipeline({
      activeApplications: 2,
    }),
  );

  assert.equal(twoApplications.status, "FRAGILE");
});

test("empty pipeline is THIN", () => {
  const result = getPipelineHealth(pipeline());

  assert.equal(result.status, "THIN");
  assert.equal(result.depth, 0);
  assert.equal(result.conversion, null);
  assert.equal(result.progression, null);
});

test("pipeline depth counts active applications, interviews, finals, and offers", () => {
  const result = getPipelineHealth(
    pipeline({
      activeApplications: 5,
      activeInterviews: 2,
      finalRounds: 1,
      offers: 1,
      acceptedOffers: 1,
    }),
  );

  assert.equal(result.depth, 9);
});

test("pipeline conversion includes interviews, finals, offers, and accepted offers", () => {
  const result = getPipelineHealth(
    pipeline({
      activeApplications: 10,
      activeInterviews: 2,
      finalRounds: 1,
      offers: 1,
      acceptedOffers: 1,
    }),
  );

  assert.equal(result.conversion, 50);
});

test("pipeline progression is calculated from active interviews", () => {
  const result = getPipelineHealth(
    pipeline({
      activeApplications: 5,
      activeInterviews: 4,
      finalRounds: 1,
      offers: 1,
      acceptedOffers: 0,
    }),
  );

  assert.equal(result.progression, 50);
});

test("pipeline progression is null when there are no active interviews", () => {
  const result = getPipelineHealth(
    pipeline({
      activeApplications: 5,
    }),
  );

  assert.equal(result.progression, null);
});
