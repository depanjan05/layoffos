import assert from "node:assert/strict";
import test from "node:test";

import {
  getActionMemory,
  getApplicationActionMemory,
  getActions,
  getExecutionActions,
  getRecoveryDecision,
  getRecoveryStrategy,
  getRecoveryExecutionPlan,
  getRecoveryRecalibration,
  getRecoveryDirection,
  getRecoveryDirectionMemory,
  getRecoveryDirectionStability,
  getRecoveryDirectionPersistence,
  calculateRecovery,
  getPipelineHealth,
  getProgressionSignal,
  getRecoveryOutcome,
  getRecoveryLearning,
  getRecoveryOutcomeIntelligence,

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

test("positive outcome intelligence preserves recovery direction", () => {
  const outcome = getRecoveryOutcome(
    progression("Interview", "Final"),
  );

  const result = getRecoveryOutcomeIntelligence(
    outcome,
    "ADVANCING",
  );

  assert.equal(result.direction, "POSITIVE");
  assert.equal(result.impact, "MEDIUM");
  assert.match(result.implication, /supports the current recovery direction/i);
  assert.ok(result.evidence.length > 0);
});

test("closed outcome intelligence identifies high recovery impact", () => {
  const outcome = getRecoveryOutcome(
    progression("Final", "Withdrawn"),
  );

  const result = getRecoveryOutcomeIntelligence(
    outcome,
    "CLOSED",
  );

  assert.equal(result.direction, "NEGATIVE");
  assert.equal(result.impact, "HIGH");
  assert.match(result.implication, /lost an opportunity/i);
});

test("neutral outcome intelligence avoids directional overreaction", () => {
  const outcome = getRecoveryOutcome(null);

  const result = getRecoveryOutcomeIntelligence(
    outcome,
    "NEUTRAL",
  );

  assert.equal(result.direction, "NEUTRAL");
  assert.equal(result.impact, "LOW");
  assert.match(result.implication, /does not provide enough directional evidence/i);
});

test("positive outcome creates recovery learning", () => {
  const outcome = getRecoveryOutcome(
    progression("Interview", "Final"),
  );

  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "ADVANCING",
  );

  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "ADVANCING",
  );

  assert.match(learning.pattern, /meaningful recovery progression/i);
  assert.match(learning.learning, /producing evidence/i);
  assert.equal(learning.confidence, "MEDIUM");
  assert.ok(learning.evidence.length > 0);
});

test("closed outcome creates capacity-loss recovery learning", () => {
  const outcome = getRecoveryOutcome(
    progression("Final", "Withdrawn"),
  );

  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "CLOSED",
  );

  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "CLOSED",
  );

  assert.match(learning.pattern, /opportunity capacity was lost/i);
  assert.match(learning.learning, /reduced pipeline/i);
  assert.equal(learning.confidence, "HIGH");
});

test("neutral outcome avoids inventing recovery learning", () => {
  const outcome = getRecoveryOutcome(null);

  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "NEUTRAL",
  );

  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "NEUTRAL",
  );

  assert.match(
    learning.pattern,
    /no material directional recovery pattern/i,
  );
  assert.match(learning.learning, /insufficient/i);
  assert.equal(learning.confidence, "LOW");
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

function actionInput(
  overrides: Partial<RecoveryEngineInput> = {},
): RecoveryEngineInput {
  return {
    recoveryTiming: "last month",
    employmentStatus: "unemployed",
    careerStage: "none",
    applications: [],
    interviews: [],
    networkContacts: [],
    companies: [],
    completedActions: [],
    progressionEvents: [],
    applicationActionEvents: [],
    ...overrides,
  };
}

function pipelineComposition(
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

test("recovery actions never exceed five recommendations", () => {
  const actions = getActions(
    actionInput({
      recoveryTiming: "this week",
    }),
    "JUST_LAID_OFF",
    6,
    null,
    "NEUTRAL",
    "NO_PIPELINE",
    pipelineComposition(),
  );

  assert.ok(actions.length <= 5);
});

test("completed recovery actions are excluded from recommendations", () => {
  const input = actionInput({
    recoveryTiming: "this week",
    completedActions: [
      {
        title: "Complete your first 72 hours",
        href: "/first-72-hours",
        completedAt: "2026-09-29T08:00:00.000Z",
      },
    ],
  });

  const actions = getActions(
    input,
    "JUST_LAID_OFF",
    6,
    null,
    "NEUTRAL",
    "NO_PIPELINE",
    pipelineComposition(),
  );

  assert.equal(
    actions.some(
      (action) =>
        action.title === "Complete your first 72 hours" &&
        action.href === "/first-72-hours",
    ),
    false,
  );
});

test("critical runway always preserves a financial recommendation", () => {
  const actions = getActions(
    actionInput({
      recoveryTiming: "last month",
      applications: [
        { stage: "Interview" },
        { stage: "Final" },
      ],
    }),
    "FINAL_ROUND",
    1.5,
    null,
    "NEUTRAL",
    "FINAL_ROUND",
    pipelineComposition({
      activeApplications: 2,
      activeInterviews: 1,
      finalRounds: 1,
    }),
  );

  assert.ok(
    actions.some((action) => action.href === "/runway"),
  );
});

test("offer-stage recommendations prioritize offer execution", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeApplications: 3,
    }),
  );

  assert.ok(
    actions.length > 0 &&
      actions[0].href === "/interviews",
  );
});

test("accepted offer recommendations surface accepted-offer confirmation", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      acceptedOffers: 1,
      offers: 1,
      activeApplications: 2,
    }),
  );

  assert.equal(
    actions[0].title,
    "Confirm your accepted offer details",
  );
});

test("final-round pipeline elevates interview execution", () => {
  const actions = getActions(
    actionInput(),
    "FINAL_ROUND",
    6,
    null,
    "NEUTRAL",
    "FINAL_ROUND",
    pipelineComposition({
      finalRounds: 1,
      activeInterviews: 1,
      activeApplications: 2,
    }),
  );

  assert.ok(
    actions[0].href === "/interviews",
  );
});

test("active interview pipeline recommends advancing the interview", () => {
  const actions = getActions(
    actionInput(),
    "INTERVIEWING",
    6,
    null,
    "NEUTRAL",
    "INTERVIEW_STAGE",
    pipelineComposition({
      activeInterviews: 2,
      activeApplications: 3,
    }),
  );

  assert.ok(
    actions.some(
      (action) => action.title === "Advance an active interview",
    ),
  );
});

test("application-heavy pipeline recommends converting applications into conversations", () => {
  const actions = getActions(
    actionInput(),
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "APPLICATION_STAGE",
    pipelineComposition({
      activeApplications: 4,
    }),
  );

  assert.ok(
    actions.some(
      (action) =>
        action.title === "Convert applications into conversations",
    ),
  );
});

test("network-only pipeline recommends turning a contact into an opportunity", () => {
  const actions = getActions(
    actionInput({
      networkContacts: [
        { status: "active" },
        { status: "active" },
      ],
    }),
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "NO_PIPELINE",
    pipelineComposition({
      activeNetworkContacts: 2,
    }),
  );

  assert.ok(
    actions.some(
      (action) =>
        action.title === "Turn a network contact into an opportunity",
    ),
  );
});

test("empty pipeline creates both search and networking recovery paths", () => {
  const actions = getActions(
    actionInput(),
    "STABILIZING",
    6,
    null,
    "NEUTRAL",
    "NO_PIPELINE",
    pipelineComposition(),
  );

  assert.ok(
    actions.some(
      (action) => action.href === "/job-search",
    ),
  );

  assert.ok(
    actions.some(
      (action) => action.href === "/networking",
    ),
  );
});

test("recovered state produces recovery closeout actions", () => {
  const actions = getActions(
    actionInput({
      employmentStatus: "employed",
    }),
    "RECOVERED",
    6,
    null,
    "NEUTRAL",
    "NO_PIPELINE",
    pipelineComposition(),
  );

  assert.ok(
    actions.some(
      (action) => action.title === "Review your recovery data",
    ),
  );
});

test("recent advancement into interview stage elevates interview actions", () => {
  const recent = progression("Application", "Interview");

  const actions = getActions(
    actionInput(),
    "INTERVIEWING",
    6,
    recent,
    "ADVANCING",
    "INTERVIEW_STAGE",
    pipelineComposition({
      activeApplications: 2,
      activeInterviews: 1,
    }),
  );

  assert.ok(
    actions[0].href === "/interviews",
  );
});

test("setback recommendations include replacement pipeline actions", () => {
  const recent = progression("Interview", "Rejected");

  const actions = getActions(
    actionInput(),
    "SEARCHING",
    6,
    recent,
    "SETBACK",
    "SETBACK",
    pipelineComposition({
      activeApplications: 1,
    }),
  );

  assert.ok(
    actions.some(
      (action) =>
        action.title === "Identify 3 replacement target roles",
    ),
  );
});

test("low-confidence application memory does not change recommendations", () => {
  const baseInput = actionInput({
    applications: [{ stage: "Applied" }],
  });

  const withoutMemory = getActions(
    baseInput,
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "APPLICATION_STAGE",
    pipelineComposition({
      activeApplications: 1,
    }),
  );

  const withLowConfidenceMemory = getActions(
    {
      ...baseInput,
      applicationActionEvents: [
        {
          action: "Review your active application pipeline",
          completedAt: "2026-09-20T10:00:00.000Z",
        },
      ],
    },
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "APPLICATION_STAGE",
    pipelineComposition({
      activeApplications: 1,
    }),
  );

  assert.deepEqual(
    withLowConfidenceMemory.map((action) => action.title),
    withoutMemory.map((action) => action.title),
  );
});

test("recommendations preserve category diversity when enough categories exist", () => {
  const actions = getActions(
    actionInput({
      recoveryTiming: "this week",
      networkContacts: [{ status: "active" }],
    }),
    "JUST_LAID_OFF",
    6,
    null,
    "NEUTRAL",
    "NO_PIPELINE",
    pipelineComposition({
      activeNetworkContacts: 1,
    }),
  );

  const categories = new Set(
    actions.map((action) => action.priority),
  );

  assert.ok(categories.size >= 3);
});

test("action memory stays LOW when fewer than three observations are evaluated", () => {
  const result = getActionMemory(
    [
      {
        title: "Review your active application pipeline",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
    ],
    [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-02T10:00:00.000Z",
        metadata: {
          company: "Acme",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
    ],
  );

  assert.equal(result.actionTitle, "Review your active application pipeline");
  assert.equal(result.instances, 1);
  assert.equal(result.positive, 1);
  assert.equal(result.negative, 0);
  assert.equal(result.confidence, "LOW");
  assert.equal(result.recommendation, "HOLD");
});

test("action memory reaches MEDIUM confidence at three evaluated observations", () => {
  const result = getActionMemory(
    [
      {
        title: "Review your active application pipeline",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        title: "Review your active application pipeline",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        title: "Review your active application pipeline",
        completedAt: "2026-09-05T10:00:00.000Z",
      },
    ],
    [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-01T12:00:00.000Z",
        metadata: {
          company: "Acme",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-03T12:00:00.000Z",
        metadata: {
          company: "Beta",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-05T12:00:00.000Z",
        metadata: {
          company: "Gamma",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
    ],
  );

  assert.equal(result.instances, 3);
  assert.equal(result.positive, 3);
  assert.equal(result.confidence, "MEDIUM");
  assert.equal(result.recommendation, "REPEAT");
});

test("action memory reaches HIGH confidence at five evaluated observations", () => {
  const actions = Array.from({ length: 5 }, (_, index) => ({
    title: "Review your active application pipeline",
    completedAt: `2026-09-0${index + 1}T10:00:00.000Z`,
  }));

  const progressions = actions.map((_, index) => ({
    eventType: "application_progression",
    entityType: "application",
    occurredAt: `2026-09-0${index + 1}T12:00:00.000Z`,
    metadata: {
      company: `Company ${index + 1}`,
      role: "Engineer",
      previousStage: "Applied",
      newStage: "Interview",
    },
  }));

  const result = getActionMemory(actions, progressions);

  assert.equal(result.instances, 5);
  assert.equal(result.positive, 5);
  assert.equal(result.confidence, "HIGH");
  assert.equal(result.recommendation, "REPEAT");
});

test("repeated positive action outcomes recommend REPEAT", () => {
  const result = getActionMemory(
    [
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-05T10:00:00.000Z",
      },
    ],
    [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-01T12:00:00.000Z",
        metadata: {
          company: "Acme",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-03T12:00:00.000Z",
        metadata: {
          company: "Beta",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-05T12:00:00.000Z",
        metadata: {
          company: "Gamma",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
    ],
  );

  assert.equal(result.positive, 3);
  assert.equal(result.negative, 0);
  assert.equal(result.recommendation, "REPEAT");
});

test("repeated negative action outcomes recommend RETIRE", () => {
  const result = getActionMemory(
    [
      {
        title: "Mass apply to generic roles",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        title: "Mass apply to generic roles",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        title: "Mass apply to generic roles",
        completedAt: "2026-09-05T10:00:00.000Z",
      },
    ],
    [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-01T12:00:00.000Z",
        metadata: {
          company: "Acme",
          role: "Engineer",
          previousStage: "Interview",
          newStage: "Applied",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-03T12:00:00.000Z",
        metadata: {
          company: "Beta",
          role: "Engineer",
          previousStage: "Interview",
          newStage: "Applied",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-05T12:00:00.000Z",
        metadata: {
          company: "Gamma",
          role: "Engineer",
          previousStage: "Interview",
          newStage: "Applied",
        },
      },
    ],
  );

  assert.equal(result.negative, 3);
  assert.equal(result.positive, 0);
  assert.equal(result.recommendation, "RETIRE");
});

test("mixed positive and negative action outcomes recommend MODIFY", () => {
  const result = getActionMemory(
    [
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-05T10:00:00.000Z",
      },
    ],
    [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-01T12:00:00.000Z",
        metadata: {
          company: "Acme",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-03T12:00:00.000Z",
        metadata: {
          company: "Beta",
          role: "Engineer",
          previousStage: "Interview",
          newStage: "Applied",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-05T12:00:00.000Z",
        metadata: {
          company: "Gamma",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
    ],
  );

  assert.equal(result.positive, 2);
  assert.equal(result.negative, 1);
  assert.equal(result.recommendation, "MODIFY");
});

test("action memory remains HOLD when no downstream outcomes exist", () => {
  const result = getActionMemory(
    [
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-05T10:00:00.000Z",
      },
    ],
    [],
  );

  assert.equal(result.actionTitle, "Follow up with recruiter");
  assert.equal(result.instances, 0);
  assert.equal(result.positive, 0);
  assert.equal(result.negative, 0);
  assert.equal(result.neutral, 0);
  assert.equal(result.unknown, 3);
  assert.equal(result.confidence, "LOW");
  assert.equal(result.recommendation, "HOLD");
});

test("action memory aggregates only the latest repeated action title", () => {
  const result = getActionMemory(
    [
      {
        title: "Older action",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        title: "Repeated action",
        completedAt: "2026-09-02T10:00:00.000Z",
      },
      {
        title: "Repeated action",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        title: "Repeated action",
        completedAt: "2026-09-04T10:00:00.000Z",
      },
    ],
    [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-01T12:00:00.000Z",
        metadata: {
          company: "Old",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-02T12:00:00.000Z",
        metadata: {
          company: "Acme",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-03T12:00:00.000Z",
        metadata: {
          company: "Beta",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-04T12:00:00.000Z",
        metadata: {
          company: "Gamma",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
    ],
  );

  assert.equal(result.actionTitle, "Repeated action");
  assert.equal(result.instances, 3);
  assert.equal(result.positive, 3);
  assert.equal(result.confidence, "MEDIUM");
});

test("action memory does not treat UNKNOWN outcomes as positive or negative", () => {
  const result = getActionMemory(
    [
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        title: "Follow up with recruiter",
        completedAt: "2026-09-05T10:00:00.000Z",
      },
    ],
    [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-01T12:00:00.000Z",
        metadata: {
          company: "Acme",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
    ],
  );

  assert.equal(result.positive, 1);
  assert.equal(result.negative, 0);
  assert.equal(result.unknown, 2);
  assert.equal(result.positiveRate, 1);
  assert.equal(result.confidence, "LOW");
  assert.equal(result.recommendation, "HOLD");
});

test("application action memory reaches MEDIUM and recommends REPEAT", () => {
  const result = getApplicationActionMemory(
    [
      {
        applicationId: "app-1",
        company: "Acme",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        applicationId: "app-2",
        company: "Beta",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        applicationId: "app-3",
        company: "Gamma",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-05T10:00:00.000Z",
      },
    ],
    [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-01T12:00:00.000Z",
        metadata: {
          applicationId: "app-1",
          company: "Acme",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-03T12:00:00.000Z",
        metadata: {
          applicationId: "app-2",
          company: "Beta",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-05T12:00:00.000Z",
        metadata: {
          applicationId: "app-3",
          company: "Gamma",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
    ],
  );

  assert.equal(result.action, "Follow Up with Recruiter");
  assert.equal(result.instances, 3);
  assert.equal(result.positive, 3);
  assert.equal(result.confidence, "MEDIUM");
  assert.equal(result.recommendation, "REPEAT");
});

test("application action memory recommends RETIRE for repeated negative outcomes", () => {
  const result = getApplicationActionMemory(
    [
      {
        applicationId: "app-1",
        company: "Acme",
        role: "Engineer",
        action: "Generic Follow Up",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        applicationId: "app-2",
        company: "Beta",
        role: "Engineer",
        action: "Generic Follow Up",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        applicationId: "app-3",
        company: "Gamma",
        role: "Engineer",
        action: "Generic Follow Up",
        completedAt: "2026-09-05T10:00:00.000Z",
      },
    ],
    [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-01T12:00:00.000Z",
        metadata: {
          applicationId: "app-1",
          company: "Acme",
          role: "Engineer",
          previousStage: "Interview",
          newStage: "Applied",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-03T12:00:00.000Z",
        metadata: {
          applicationId: "app-2",
          company: "Beta",
          role: "Engineer",
          previousStage: "Interview",
          newStage: "Applied",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-05T12:00:00.000Z",
        metadata: {
          applicationId: "app-3",
          company: "Gamma",
          role: "Engineer",
          previousStage: "Interview",
          newStage: "Applied",
        },
      },
    ],
  );

  assert.equal(result.negative, 3);
  assert.equal(result.confidence, "MEDIUM");
  assert.equal(result.recommendation, "RETIRE");
});

test("application action memory recommends MODIFY for mixed outcomes", () => {
  const result = getApplicationActionMemory(
    [
      {
        applicationId: "app-1",
        company: "Acme",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        applicationId: "app-2",
        company: "Beta",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        applicationId: "app-3",
        company: "Gamma",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-05T10:00:00.000Z",
      },
    ],
    [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-01T12:00:00.000Z",
        metadata: {
          applicationId: "app-1",
          company: "Acme",
          role: "Engineer",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-03T12:00:00.000Z",
        metadata: {
          applicationId: "app-2",
          company: "Beta",
          role: "Engineer",
          previousStage: "Interview",
          newStage: "Applied",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-05T12:00:00.000Z",
        metadata: {
          applicationId: "app-3",
          company: "Gamma",
          role: "Applied",
          previousStage: "Applied",
          newStage: "Interview",
        },
      },
    ],
  );

  assert.equal(result.positive, 2);
  assert.equal(result.negative, 1);
  assert.equal(result.confidence, "MEDIUM");
  assert.equal(result.recommendation, "MODIFY");
});

test("application action memory stays LOW when downstream outcomes are unknown", () => {
  const result = getApplicationActionMemory(
    [
      {
        applicationId: "app-1",
        company: "Acme",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        applicationId: "app-2",
        company: "Beta",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        applicationId: "app-3",
        company: "Gamma",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-05T10:00:00.000Z",
      },
    ],
    [],
  );

  assert.equal(result.instances, 3);
  assert.equal(result.unknown, 3);
  assert.equal(result.confidence, "LOW");
  assert.equal(result.recommendation, "HOLD");
});

test("application action memory aggregates only the latest repeated action", () => {
  const result = getApplicationActionMemory(
    [
      {
        applicationId: "old",
        company: "Old",
        role: "Engineer",
        action: "Older Action",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        applicationId: "app-1",
        company: "Acme",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-02T10:00:00.000Z",
      },
      {
        applicationId: "app-2",
        company: "Beta",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
      {
        applicationId: "app-3",
        company: "Gamma",
        role: "Engineer",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-04T10:00:00.000Z",
      },
    ],
    [],
  );

  assert.equal(result.action, "Follow Up with Recruiter");
  assert.equal(result.instances, 3);
  assert.equal(result.unknown, 3);
  assert.equal(result.confidence, "LOW");
  assert.equal(result.recommendation, "HOLD");
});

test("final-round preparation action exposes action-specific explainability", () => {
  const actions = getActions(
    actionInput(),
    "FINAL_ROUND",
    6,
    null,
    "NEUTRAL",
    "FINAL_ROUND",
    pipelineComposition({
      finalRounds: 2,
      activeInterviews: 1,
      activeApplications: 2,
    }),
  );

  const action = actions.find(
    (item) => item.title === "Prepare your final-round talking points",
  );

  assert.ok(action);
  assert.ok(action.explanation);
  assert.match(
    action.explanation.why,
    /final-round opportunity is active/i,
  );
  assert.match(
    action.explanation.decision,
    /strongest downstream opportunity/i,
  );
  assert.ok(action.explanation.signals.length <= 3);
});

test("final-round follow-up action explains its follow-up signal", () => {
  const actions = getActions(
    actionInput({
      interviews: [
        {
          stage: "Final",
          nextAction: "Send follow-up",
        },
      ],
    }),
    "FINAL_ROUND",
    6,
    null,
    "NEUTRAL",
    "FINAL_ROUND",
    pipelineComposition({
      finalRounds: 1,
      activeInterviews: 1,
      activeApplications: 2,
    }),
  );

  const action = actions.find(
    (item) => item.title === "Send your final-round follow-up",
  );

  assert.ok(action);
  assert.ok(action.explanation);
  assert.match(
    action.explanation.why,
    /follow-up or next action/i,
  );
  assert.match(
    action.explanation.decision,
    /communication step/i,
  );
});

test("active interview action explains interview advancement", () => {
  const actions = getActions(
    actionInput(),
    "INTERVIEWING",
    6,
    null,
    "NEUTRAL",
    "INTERVIEW_STAGE",
    pipelineComposition({
      activeInterviews: 2,
      activeApplications: 3,
    }),
  );

  const action = actions.find(
    (item) => item.title === "Advance an active interview",
  );

  assert.ok(action);
  assert.ok(action.explanation);
  assert.match(
    action.explanation.why,
    /active interview/i,
  );
  assert.match(
    action.explanation.decision,
    /next pipeline stage/i,
  );
});

test("application conversion action explains why conversion is prioritized", () => {
  const actions = getActions(
    actionInput(),
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "APPLICATION_STAGE",
    pipelineComposition({
      activeApplications: 4,
    }),
  );

  const action = actions.find(
    (item) => item.title === "Convert applications into conversations",
  );

  assert.ok(action);
  assert.ok(action.explanation);
  assert.match(
    action.explanation.why,
    /active application/i,
  );
  assert.match(
    action.explanation.why,
    /conversion/i,
  );
  assert.match(
    action.explanation.decision,
    /existing applications/i,
  );
});

test("networking action explains the warm-path opportunity", () => {
  const actions = getActions(
    actionInput({
      networkContacts: [
        { status: "active" },
        { status: "active" },
      ],
    }),
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "NO_PIPELINE",
    pipelineComposition({
      activeNetworkContacts: 2,
    }),
  );

  const action = actions.find(
    (item) => item.title === "Turn a network contact into an opportunity",
  );

  assert.ok(action);
  assert.ok(action.explanation);
  assert.match(
    action.explanation.why,
    /active network/i,
  );
  assert.match(
    action.explanation.decision,
    /warm relationship/i,
  );
});

test("financial action explains runway as a recovery constraint", () => {
  const actions = getActions(
    actionInput(),
    "STABILIZING",
    1.5,
    null,
    "NEUTRAL",
    "NO_PIPELINE",
    pipelineComposition(),
  );

  const action = actions.find(
    (item) => item.href === "/runway",
  );

  assert.ok(action);
  assert.ok(action.explanation);
  assert.match(
    action.explanation.why,
    /1\.5 months/i,
  );
  assert.match(
    action.explanation.decision,
    /financial runway/i,
  );
});

test("accepted offer action explains transition completion", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      acceptedOffers: 1,
      offers: 1,
      activeInterviews: 1,
    }),
  );

  const action = actions.find(
    (item) => item.title === "Confirm your accepted offer details",
  );

  assert.ok(action);
  assert.ok(action.explanation);
  assert.match(
    action.explanation.why,
    /accepted/i,
  );
  assert.match(
    action.explanation.decision,
    /transition/i,
  );
});

test("setback replacement action explains lost pipeline capacity", () => {
  const actions = getActions(
    actionInput(),
    "SEARCHING",
    6,
    null,
    "SETBACK",
    "SETBACK",
    pipelineComposition({
      activeApplications: 1,
    }),
  );

  const action = actions.find(
    (item) =>
      item.title.toLowerCase().includes("replacement") ||
      item.title.toLowerCase().includes("replace"),
  );

  assert.ok(action);
  assert.ok(action.explanation);
  assert.match(
    action.explanation.why,
    /setback|replacement/i,
  );
  assert.match(
    action.explanation.decision,
    /pipeline capacity|pipeline/i,
  );
});

test("recovered actions expose recovery closeout reasoning", () => {
  const actions = getActions(
    actionInput(),
    "RECOVERED",
    12,
    null,
    "NEUTRAL",
    "NO_PIPELINE",
    pipelineComposition(),
  );

  assert.ok(actions.length > 0);

  const action = actions[0];

  assert.ok(action.explanation);
  assert.match(
    action.explanation.why,
    /closeout|employment/i,
  );
  assert.match(
    action.explanation.decision,
    /recovery loop|close/i,
  );
});

test("action explanations cap signals and remove duplicates", () => {
  const actions = getActions(
    actionInput(),
    "FINAL_ROUND",
    6,
    null,
    "NEUTRAL",
    "FINAL_ROUND",
    pipelineComposition({
      finalRounds: 2,
      activeInterviews: 2,
      activeApplications: 4,
    }),
  );

  assert.ok(actions.length > 0);

  for (const action of actions) {
    assert.ok(action.explanation);

    const signals = action.explanation.signals;

    assert.ok(signals.length <= 3);
    assert.equal(new Set(signals).size, signals.length);

    assert.ok(action.explanation.why.length > 0);
    assert.ok(action.explanation.decision.length > 0);
  }
});

test("decision trace records the action base priority", () => {
  const actions = getActions(
    actionInput(),
    "INTERVIEWING",
    6,
    null,
    "NEUTRAL",
    "INTERVIEWING",
    pipelineComposition({
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);

  const action = actions.find(
    (item) => item.title === "Advance an active interview",
  );

  assert.ok(action);
  assert.ok(action.decisionTrace);
  assert.equal(action.decisionTrace.basePriority, 22);
});

test("decision trace records every scoring adjustment", () => {
  const actions = getActions(
    actionInput(),
    "INTERVIEWING",
    6,
    null,
    "NEUTRAL",
    "INTERVIEWING",
    pipelineComposition({
      activeInterviews: 1,
    }),
  );

  const action = actions.find(
    (item) => item.title === "Advance an active interview",
  );

  assert.ok(action);
  assert.ok(action.decisionTrace);

  const labels = action.decisionTrace.adjustments.map(
    (adjustment) => adjustment.label,
  );

  assert.ok(labels.includes("Evidence"));
  assert.ok(labels.includes("INTERVIEWING state"));
  assert.ok(labels.includes("Active interview path"));
  assert.ok(labels.includes("Active interview action match"));
});

test("decision trace final score equals base priority plus adjustments", () => {
  const actions = getActions(
    actionInput(),
    "INTERVIEWING",
    6,
    null,
    "NEUTRAL",
    "INTERVIEWING",
    pipelineComposition({
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);

  for (const action of actions) {
    assert.ok(action.decisionTrace);

    const adjustmentTotal =
      action.decisionTrace.adjustments.reduce(
        (total, adjustment) => total + adjustment.delta,
        0,
      );

    assert.equal(
      action.decisionTrace.basePriority + adjustmentTotal,
      action.decisionTrace.finalScore,
    );
  }
});

test("decision trace records selected actions as SELECTED", () => {
  const actions = getActions(
    actionInput(),
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "APPLICATION_HEAVY",
    pipelineComposition({
      activeApplications: 4,
    }),
  );

  assert.ok(actions.length > 0);

  for (const action of actions) {
    assert.ok(action.decisionTrace);
    assert.equal(
      action.decisionTrace.selection,
      "SELECTED",
    );
    assert.ok(
      action.decisionTrace.selectionReason.length > 0,
    );
  }
});

test("critical runway trace records the financial constraint", () => {
  const actions = getActions(
    actionInput(),
    "INTERVIEWING",
    1,
    null,
    "NEUTRAL",
    "INTERVIEWING",
    pipelineComposition({
      activeInterviews: 2,
    }),
  );

  const runwayAction = actions.find(
    (item) => item.href === "/runway",
  );

  assert.ok(runwayAction);
  assert.ok(runwayAction.decisionTrace);

  assert.ok(
    runwayAction.decisionTrace.adjustments.some(
      (adjustment) =>
        adjustment.label === "Critical runway" &&
        adjustment.delta === 30,
    ),
  );

  assert.match(
    runwayAction.decisionTrace.selectionReason,
    /critical-runway constraint/i,
  );
});

test("category-diversity selection is recorded in the decision trace", () => {
  const actions = getActions(
    actionInput(),
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "APPLICATION_HEAVY",
    pipelineComposition({
      activeApplications: 4,
    }),
  );

  assert.ok(actions.length > 0);

  const diversitySelected = actions.find(
    (item) =>
      item.decisionTrace?.selectionReason ===
      "Selected during category-diversity pass",
  );

  assert.ok(diversitySelected);
});

test("ranked fill selection is recorded when categories run out", () => {
  const actions = getActions(
    actionInput(),
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "APPLICATION_HEAVY",
    pipelineComposition({
      activeApplications: 1,
    }),
  );

  assert.ok(actions.length > 0);

  const fillSelected = actions.find(
    (item) =>
      item.decisionTrace?.selectionReason ===
      "Selected during ranked fill pass",
  );

  assert.ok(fillSelected);
});

test("decision trace captures negative learning adjustments", () => {
  const input = actionInput({
    applicationActionEvents: [
      {
        applicationId: "app-1",
        company: "Test Company",
        role: "Marketing Lead",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-01T10:00:00.000Z",
      },
      {
        applicationId: "app-2",
        company: "Test Company",
        role: "Marketing Lead",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-02T10:00:00.000Z",
      },
      {
        applicationId: "app-3",
        company: "Test Company",
        role: "Marketing Lead",
        action: "Follow Up with Recruiter",
        completedAt: "2026-09-03T10:00:00.000Z",
      },
    ],
    progressionEvents: [
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-01T12:00:00.000Z",
        metadata: {
          applicationId: "app-1",
          company: "Test Company",
          role: "Marketing Lead",
          previousStage: "Interview",
          newStage: "Rejected",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-02T12:00:00.000Z",
        metadata: {
          applicationId: "app-2",
          company: "Test Company",
          role: "Marketing Lead",
          previousStage: "Interview",
          newStage: "Rejected",
        },
      },
      {
        eventType: "application_progression",
        entityType: "application",
        occurredAt: "2026-09-03T12:00:00.000Z",
        metadata: {
          applicationId: "app-3",
          company: "Test Company",
          role: "Marketing Lead",
          previousStage: "Interview",
          newStage: "Rejected",
        },
      },
    ],
    applications: [
      {
        stage: "applied",
        company: "New Company",
        role: "Marketing Lead",
      },
    ],
  });

  const actions = getActions(
    input,
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "APPLICATION_HEAVY",
    pipelineComposition({
      activeApplications: 1,
    }),
  );

  const action = actions.find(
    (item) =>
      item.title.toLowerCase().includes("follow up") &&
      item.href === "/job-search",
  );

  if (action) {
    assert.ok(action.decisionTrace);
    assert.ok(
      action.decisionTrace.adjustments.some(
        (adjustment) =>
          adjustment.label === "Learned action: RETIRE" &&
          adjustment.delta === -25,
      ),
    );
  }
});

test("decision trace does not alter recommendation count", () => {
  const actions = getActions(
    actionInput(),
    "FINAL_ROUND",
    6,
    null,
    "NEUTRAL",
    "FINAL_ROUND",
    pipelineComposition({
      finalRounds: 2,
      activeInterviews: 2,
      activeApplications: 4,
    }),
  );

  assert.ok(actions.length > 0);
  assert.ok(actions.length <= 5);

  for (const action of actions) {
    assert.ok(action.decisionTrace);
    assert.equal(
      action.decisionTrace.selection,
      "SELECTED",
    );
  }
});

test("decision trace preserves non-zero final scores and action identity", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);

  for (const action of actions) {
    assert.ok(action.title);
    assert.ok(action.href);
    assert.ok(action.decisionTrace);
    assert.equal(
      typeof action.decisionTrace.finalScore,
      "number",
    );
    assert.ok(
      Number.isFinite(action.decisionTrace.finalScore),
    );
  }
});


test("decision trace exposes unselected candidate alternatives", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);

  const alternatives = actions.flatMap((action) =>
    action.decisionTrace?.alternatives ?? [],
  );

  assert.ok(
    alternatives.length > 0,
    "Expected at least one unselected candidate alternative",
  );

  for (const candidate of alternatives) {
    assert.equal(candidate.selection, "NOT_SELECTED");
  }
});

test("decision trace candidate ranks follow sorted candidate order", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);

  const selectedCandidates = actions.map((action) => {
    const trace = action.decisionTrace;
    assert.ok(trace);

    return {
      title: action.title,
      href: action.href,
      rank: trace.rank,
    };
  });

  assert.ok(
    selectedCandidates.every((candidate) => candidate.rank >= 1),
    "Selected actions should have positive candidate ranks",
  );

  const alternativeMap = new Map<
    string,
    (typeof selectedCandidates)[number] & {
      selection: "NOT_SELECTED";
    }
  >();

  for (const action of actions) {
    for (const candidate of action.decisionTrace?.alternatives ?? []) {
      alternativeMap.set(`${candidate.title}|${candidate.href}`, {
        title: candidate.title,
        href: candidate.href,
        rank: candidate.rank,
        selection: candidate.selection,
      });
    }
  }

  const alternatives = [...alternativeMap.values()];

  assert.ok(
    alternatives.length > 0,
    "Expected at least one unselected candidate",
  );

  for (const candidate of alternatives) {
    assert.equal(candidate.selection, "NOT_SELECTED");
  }

  const allCandidates = [
    ...selectedCandidates.map((candidate) => ({
      title: candidate.title,
      href: candidate.href,
      rank: candidate.rank,
    })),
    ...alternatives.map((candidate) => ({
      title: candidate.title,
      href: candidate.href,
      rank: candidate.rank,
    })),
  ];

  const uniqueCandidateIds = new Set(
    allCandidates.map(
      (candidate) => `${candidate.title}|${candidate.href}`,
    ),
  );

  assert.equal(
    uniqueCandidateIds.size,
    allCandidates.length,
    "Candidate identities should be unique",
  );

  const uniqueRanks = new Set(
    allCandidates.map((candidate) => candidate.rank),
  );

  assert.equal(
    uniqueRanks.size,
    allCandidates.length,
    "Candidate ranks should be unique",
  );

  const sortedRanks = allCandidates
    .map((candidate) => candidate.rank)
    .sort((a, b) => a - b);

  assert.deepEqual(
    sortedRanks,
    Array.from(
      { length: sortedRanks.length },
      (_, index) => index + 1,
    ),
  );
});

test("decision trace candidate scores equal base priority plus adjustments", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);

  for (const action of actions) {
    const trace = action.decisionTrace;
    assert.ok(trace);

    const selectedScore =
      trace.basePriority +
      trace.adjustments.reduce(
        (total, adjustment) => total + adjustment.delta,
        0,
      );

    assert.equal(trace.finalScore, selectedScore);

    for (const candidate of trace.alternatives) {
      const candidateScore =
        candidate.basePriority +
        candidate.adjustments.reduce(
          (total, adjustment) => total + adjustment.delta,
          0,
        );

      assert.equal(candidate.finalScore, candidateScore);
    }
  }
});

test("decision trace marks selected candidates separately from alternatives", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);

  for (const action of actions) {
    assert.ok(action.decisionTrace);
    assert.equal(action.decisionTrace.selection, "SELECTED");

    for (const candidate of action.decisionTrace.alternatives) {
      assert.equal(candidate.selection, "NOT_SELECTED");
    }
  }
});

test("decision trace exposes structured selection context", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);

  for (const action of actions) {
    const trace = action.decisionTrace;
    assert.ok(trace);

    assert.ok(
      [
        "CRITICAL_RUNWAY",
        "DIVERSITY",
        "RANKED_FILL",
      ].includes(trace.selectionContext.pass),
    );

    assert.ok(trace.selectionContext.reason);

    assert.equal(
      trace.selectionContext.reason,
      trace.selectionReason,
    );

    for (const candidate of trace.alternatives) {
      assert.equal(
        candidate.selectionContext.pass,
        "NOT_SELECTED",
      );

      assert.equal(
        candidate.selectionContext.reason,
        candidate.selectionReason,
      );
    }
  }
});

test("decision trace identifies category competition for unselected candidates", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);

  const alternatives = actions.flatMap(
    (action) => action.decisionTrace?.alternatives ?? [],
  );

  assert.ok(alternatives.length > 0);

  const categoryCompetition = alternatives.filter(
    (candidate) =>
      candidate.selectionContext.competingCandidate,
  );

  assert.ok(categoryCompetition.length > 0);

  for (const candidate of categoryCompetition) {
    assert.equal(
      candidate.selectionContext.pass,
      "NOT_SELECTED",
    );

    assert.ok(
      candidate.selectionContext.reason.includes(
        "stronger candidate already represented this category",
      ),
    );

    assert.ok(
      candidate.selectionContext.competingCandidate,
    );
  }
});

test("decision trace preserves the selected recommendation set", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);
  assert.ok(actions.length <= 5);

  const selectedTitles = actions.map((action) => action.title);

  assert.equal(
    new Set(selectedTitles).size,
    selectedTitles.length,
    "Selected recommendations should remain unique",
  );

  const alternatives = actions.flatMap((action) =>
    action.decisionTrace?.alternatives ?? [],
  );

  for (const action of actions) {
    assert.ok(
      !alternatives.some(
        (candidate) =>
          candidate.title === action.title &&
          candidate.href === action.href,
      ),
      "Selected actions should not appear as NOT_SELECTED alternatives",
    );
  }
});

test("decision trace records competing candidate score for category conflicts", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  const alternatives = actions.flatMap(
    (action) => action.decisionTrace?.alternatives ?? [],
  );

  const categoryCompetition = alternatives.filter(
    (candidate) =>
      candidate.selectionContext.competingCandidate &&
      candidate.selectionContext.competingScore !== undefined,
  );

  assert.ok(categoryCompetition.length > 0);

  for (const candidate of categoryCompetition) {
    assert.equal(
      candidate.selectionContext.pass,
      "NOT_SELECTED",
    );

    assert.equal(
      typeof candidate.selectionContext.competingScore,
      "number",
    );

    assert.ok(
      candidate.selectionContext.competingScore! >=
        candidate.finalScore,
    );
  }
});

test("decision trace records the actual selection pass for selected candidates", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  assert.ok(actions.length > 0);

  for (const action of actions) {
    const context = action.decisionTrace?.selectionContext;

    assert.ok(context);

    assert.ok(
      [
        "CRITICAL_RUNWAY",
        "DIVERSITY",
        "RANKED_FILL",
      ].includes(context.pass),
    );

    assert.equal(
      context.reason,
      action.decisionTrace?.selectionReason,
    );
  }
});

test("ranked-fill selections are explicitly recorded as ranked-fill decisions", () => {
  const actions = getActions(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      activeInterviews: 1,
    }),
  );

  const rankedFillActions = actions.filter(
    (action) =>
      action.decisionTrace?.selectionContext.pass ===
      "RANKED_FILL",
  );

  for (const action of rankedFillActions) {
    assert.equal(
      action.decisionTrace?.selectionReason,
      "Selected during ranked fill pass",
    );
  }
});

test("recovery decision closes out a recovered state", () => {
  const decision = getRecoveryDecision(
    actionInput({
      employmentStatus: "employed",
    }),
    "RECOVERED",
    6,
    null,
    "NEUTRAL",
    "ACTIVE",
    pipelineComposition(),
  );

  assert.equal(decision.decision, "Close out recovery");
  assert.equal(decision.confidence, "HIGH");
  assert.ok(
    decision.evidence.includes("Recovery state is RECOVERED"),
  );
});

test("recovery decision prioritizes offer execution", () => {
  const decision = getRecoveryDecision(
    actionInput(),
    "OFFER",
    6,
    null,
    "NEUTRAL",
    "OFFER_STAGE",
    pipelineComposition({
      offers: 1,
      interviewOffers: 1,
    }),
  );

  assert.equal(
    decision.decision,
    "Prioritize offer execution",
  );
  assert.equal(decision.confidence, "HIGH");
  assert.ok(
    decision.evidence.some((item) =>
      item.includes("offer-stage recovery opportunity"),
    ),
  );
});

test("critical runway becomes the strategic decision constraint", () => {
  const decision = getRecoveryDecision(
    actionInput({
      applications: [{ stage: "Interview" }],
    }),
    "INTERVIEWING",
    1.5,
    null,
    "NEUTRAL",
    "ACTIVE",
    pipelineComposition({
      activeApplications: 3,
      activeInterviews: 1,
    }),
  );

  assert.equal(
    decision.decision,
    "Stabilize runway while maintaining recovery momentum",
  );
  assert.equal(decision.confidence, "HIGH");
  assert.ok(
    decision.constraints.some((item) =>
      item.includes("critical recovery constraint"),
    ),
  );
  assert.ok(
    decision.evidence.includes(
      "Active interview opportunities still exist",
    ),
  );
});

test("recovery decision prioritizes final-round progression", () => {
  const decision = getRecoveryDecision(
    actionInput(),
    "FINAL_ROUND",
    6,
    null,
    "NEUTRAL",
    "ACTIVE",
    pipelineComposition({
      activeInterviews: 1,
      finalRounds: 1,
    }),
  );

  assert.equal(
    decision.decision,
    "Prioritize final-round progression",
  );
  assert.equal(decision.confidence, "HIGH");
});

test("recovery decision prioritizes interview progression", () => {
  const decision = getRecoveryDecision(
    actionInput(),
    "INTERVIEWING",
    6,
    null,
    "NEUTRAL",
    "ACTIVE",
    pipelineComposition({
      activeInterviews: 2,
    }),
  );

  assert.equal(
    decision.decision,
    "Prioritize interview progression",
  );
  assert.equal(decision.confidence, "HIGH");
});

test("recovery decision rebuilds the pipeline after a setback", () => {
  const progression = {
    company: "Example Corp",
    previousStage: "Interview",
    newStage: "Rejected",
    type: "interview",
  };

  const decision = getRecoveryDecision(
    actionInput(),
    "SEARCHING",
    6,
    progression,
    "SETBACK",
    "SETBACK",
    pipelineComposition({
      activeApplications: 2,
    }),
  );

  assert.equal(
    decision.decision,
    "Rebuild the recovery pipeline",
  );
  assert.equal(decision.confidence, "MEDIUM");
  assert.ok(
    decision.evidence.some((item) =>
      item.includes("Example Corp"),
    ),
  );
});

test("recovery decision prioritizes application conversion", () => {
  const decision = getRecoveryDecision(
    actionInput(),
    "SEARCHING",
    6,
    null,
    "NEUTRAL",
    "ACTIVE",
    pipelineComposition({
      activeApplications: 6,
      activeInterviews: 0,
      finalRounds: 0,
      offers: 0,
    }),
  );

  assert.equal(
    decision.decision,
    "Prioritize application conversion",
  );
  assert.equal(decision.confidence, "HIGH");
  assert.ok(
    decision.evidence.some((item) =>
      item.includes("active applications"),
    ),
  );
});

test("recovery decision builds the pipeline when downstream recovery is thin", () => {
  const decision = getRecoveryDecision(
    actionInput(),
    "STABILIZING",
    6,
    null,
    "NEUTRAL",
    "THIN",
    pipelineComposition(),
  );

  assert.equal(
    decision.decision,
    "Build recovery pipeline",
  );
  assert.equal(decision.confidence, "MEDIUM");
  assert.ok(
    decision.evidence.includes(
      "The recovery pipeline is thin",
    ),
  );
});

test("persistence-aware recovery decision records persistent direction evidence", () => {
  const decision = getRecoveryDecision(
    {} as Parameters<typeof getRecoveryDecision>[0],
    "INTERVIEWING",
    null,
    null,
    "ADVANCING",
    "HEALTHY",
    {} as Parameters<typeof getRecoveryDecision>[6],
    {
      direction: "INTENSIFY",
      rationale: "The active opportunity is progressing.",
      evidence: ["Interview progression is improving."],
      source: "ADVANCEMENT",
      confidence: "HIGH",
    },
    {
      direction: "INTENSIFY",
      consecutiveCycles: 3,
      status: "PERSISTING",
      rationale: "The direction has persisted.",
      confidence: "HIGH",
    },
  );

  assert.equal(
    decision.evidence.some((item) =>
      item.includes("persisted for 3 consecutive cycles"),
    ),
    true,
  );
});

test("persistence-aware recovery decision records a newly established direction", () => {
  const decision = getRecoveryDecision(
    {} as Parameters<typeof getRecoveryDecision>[0],
    "SEARCHING",
    null,
    null,
    "NEUTRAL",
    "WEAK",
    {} as Parameters<typeof getRecoveryDecision>[6],
    {
      direction: "CONTINUE",
      rationale: "Evidence is insufficient.",
      evidence: [],
      source: "INSUFFICIENT",
      confidence: "LOW",
    },
    {
      direction: "CONTINUE",
      consecutiveCycles: 1,
      status: "NEW",
      rationale: "This direction is newly established.",
      confidence: "LOW",
    },
  );

  assert.equal(
    decision.evidence.some((item) =>
      item.includes("newly established"),
    ),
    true,
  );
});

test("persistence-aware recovery decision records a reset direction", () => {
  const decision = getRecoveryDecision(
    {} as Parameters<typeof getRecoveryDecision>[0],
    "SEARCHING",
    null,
    null,
    "CLOSED",
    "WEAK",
    {} as Parameters<typeof getRecoveryDecision>[6],
    {
      direction: "REBUILD",
      rationale: "The pipeline needs replacement capacity.",
      evidence: ["An active opportunity closed."],
      source: "CLOSURE",
      confidence: "HIGH",
    },
    {
      direction: "REBUILD",
      consecutiveCycles: 1,
      status: "RESET",
      rationale: "The previous path was materially reset.",
      confidence: "HIGH",
    },
  );

  assert.equal(
    decision.evidence.some((item) =>
      item.includes("persistence was reset"),
    ),
    true,
  );
});

test("recovery engine exposes the strategic recovery decision", () => {
  const input = actionInput({
    applications: [
      { stage: "Applied" },
      { stage: "Applied" },
      { stage: "Applied" },
    ],
    interviews: [],
  });

  const result = calculateRecovery(input);

  assert.ok(result.recoveryDecision);
  assert.equal(
    result.recoveryDecision.decision,
    "Prioritize application conversion",
  );
  assert.equal(result.recoveryDecision.confidence, "HIGH");
});

test("recovery strategy completes the recovery transition", () => {
  const strategy = getRecoveryStrategy({
    decision: "Close out recovery",
    objective: "Complete the transition",
    evidence: [],
    constraints: [],
    confidence: "HIGH",
  });

  assert.equal(
    strategy.strategy,
    "Complete the recovery transition",
  );
  assert.equal(strategy.confidence, "HIGH");
  assert.ok(strategy.approach.length > 0);
  assert.ok(strategy.successSignals.length > 0);
});

test("recovery strategy converts an offer into completed employment", () => {
  const strategy = getRecoveryStrategy({
    decision: "Prioritize offer execution",
    objective: "Convert the offer",
    evidence: [],
    constraints: [],
    confidence: "HIGH",
  });

  assert.equal(
    strategy.strategy,
    "Convert the strongest offer opportunity into completed employment",
  );
  assert.equal(strategy.confidence, "HIGH");
  assert.ok(strategy.guardrails.length > 0);
});

test("recovery strategy protects runway while preserving momentum", () => {
  const strategy = getRecoveryStrategy({
    decision: "Stabilize runway while maintaining recovery momentum",
    objective: "Protect runway",
    evidence: [],
    constraints: [],
    confidence: "HIGH",
  });

  assert.equal(
    strategy.strategy,
    "Protect runway while preserving the shortest viable recovery path",
  );
  assert.equal(strategy.confidence, "HIGH");
  assert.ok(
    strategy.guardrails.some((item) =>
      item.includes("recovery opportunities"),
    ),
  );
});

test("recovery strategy concentrates effort on final-round execution", () => {
  const strategy = getRecoveryStrategy({
    decision: "Prioritize final-round progression",
    objective: "Advance the final round",
    evidence: [],
    constraints: [],
    confidence: "HIGH",
  });

  assert.equal(
    strategy.strategy,
    "Concentrate effort on final-round execution",
  );
  assert.equal(strategy.confidence, "HIGH");
  assert.ok(strategy.approach.length >= 3);
});

test("recovery strategy converts interviews into late-stage opportunities", () => {
  const strategy = getRecoveryStrategy({
    decision: "Prioritize interview progression",
    objective: "Advance interviews",
    evidence: [],
    constraints: [],
    confidence: "HIGH",
  });

  assert.equal(
    strategy.strategy,
    "Convert active interviews into late-stage opportunities",
  );
  assert.equal(strategy.confidence, "HIGH");
});

test("recovery strategy replaces lost opportunity capacity", () => {
  const strategy = getRecoveryStrategy({
    decision: "Rebuild the recovery pipeline",
    objective: "Replace lost pipeline",
    evidence: [],
    constraints: [],
    confidence: "MEDIUM",
  });

  assert.equal(
    strategy.strategy,
    "Replace lost opportunity capacity",
  );
  assert.equal(strategy.confidence, "MEDIUM");
  assert.ok(strategy.guardrails.length >= 2);
});

test("recovery strategy converts existing application volume", () => {
  const strategy = getRecoveryStrategy({
    decision: "Prioritize application conversion",
    objective: "Improve conversion",
    evidence: [],
    constraints: [],
    confidence: "HIGH",
  });

  assert.equal(
    strategy.strategy,
    "Convert existing application volume into conversations",
  );
  assert.equal(strategy.confidence, "HIGH");
  assert.ok(
    strategy.guardrails.some((item) =>
      item.includes("application volume"),
    ),
  );
});

test("recovery strategy maintains qualified search activity", () => {
  const strategy = getRecoveryStrategy({
    decision: "Maintain active job search",
    objective: "Maintain search",
    evidence: [],
    constraints: [],
    confidence: "MEDIUM",
  });

  assert.equal(
    strategy.strategy,
    "Maintain qualified search activity while strengthening downstream depth",
  );
  assert.equal(strategy.confidence, "MEDIUM");
});

test("recovery strategy establishes sufficient qualified pipeline", () => {
  const strategy = getRecoveryStrategy({
    decision: "Build recovery pipeline",
    objective: "Build pipeline",
    evidence: [],
    constraints: [],
    confidence: "MEDIUM",
  });

  assert.equal(
    strategy.strategy,
    "Establish sufficient qualified recovery pipeline",
  );
  assert.equal(strategy.confidence, "MEDIUM");
  assert.ok(strategy.successSignals.length >= 3);
});

test("recovery strategy falls back safely for an unknown decision", () => {
  const strategy = getRecoveryStrategy({
    decision: "Unknown decision",
    objective: "Unknown",
    evidence: [],
    constraints: [],
    confidence: "LOW",
  });

  assert.equal(
    strategy.strategy,
    "Maintain recovery momentum",
  );
  assert.equal(strategy.confidence, "LOW");
  assert.ok(strategy.successSignals.length > 0);
});

test("recovery engine exposes the strategy derived from its recovery decision", () => {
  const result = calculateRecovery(
    actionInput({
      recoveryTiming: "last month",
      employmentStatus: "unemployed",
      careerStage: "none",
      applications: [
        {
          id: "app-1",
          company: "Acme",
          role: "Growth Manager",
          stage: "applied",
        },
      ],
    }),
  );

  assert.equal(
    result.recoveryDecision.decision,
    "Prioritize application conversion",
  );

  assert.equal(
    result.recoveryStrategy.strategy,
    "Convert existing application volume into conversations",
  );

  assert.equal(
    result.recoveryStrategy.objective,
    "Turn existing application activity into active conversations and downstream opportunities before materially increasing volume.",
  );

  assert.equal(result.recoveryStrategy.confidence, "HIGH");
  assert.ok(result.recoveryStrategy.approach.length > 0);
  assert.ok(result.recoveryStrategy.guardrails.length > 0);
  assert.ok(result.recoveryStrategy.successSignals.length > 0);
});

test("persistence-aware recovery strategy preserves an established direction", () => {
  const strategy = getRecoveryStrategy(
    {
      decision: "Prioritize interview progression",
      objective: "Advance the strongest active interview opportunity.",
      evidence: ["Active interview is progressing."],
      constraints: [],
      confidence: "HIGH",
    },
    {
      direction: "INTENSIFY",
      rationale: "The active opportunity is progressing.",
      evidence: ["Interview progression is improving."],
      source: "ADVANCEMENT",
      confidence: "HIGH",
    },
    {
      direction: "INTENSIFY",
      consecutiveCycles: 3,
      status: "PERSISTING",
      rationale: "The direction has persisted.",
      confidence: "HIGH",
    },
  );

  assert.equal(
    strategy.guardrails.some((item) =>
      item.includes("3 consecutive cycles"),
    ),
    true,
  );
});

test("persistence-aware recovery strategy avoids overexpanding a new direction", () => {
  const strategy = getRecoveryStrategy(
    {
      decision: "Build recovery pipeline",
      objective: "Create sufficient qualified recovery opportunities.",
      evidence: [],
      constraints: [],
      confidence: "LOW",
    },
    {
      direction: "CONTINUE",
      rationale: "Evidence is insufficient.",
      evidence: [],
      source: "INSUFFICIENT",
      confidence: "LOW",
    },
    {
      direction: "CONTINUE",
      consecutiveCycles: 1,
      status: "NEW",
      rationale: "The direction is newly established.",
      confidence: "LOW",
    },
  );

  assert.equal(
    strategy.guardrails.some((item) =>
      item.includes("newly established"),
    ),
    true,
  );
});

test("persistence-aware recovery strategy resets assumptions after directional reset", () => {
  const strategy = getRecoveryStrategy(
    {
      decision: "Rebuild the recovery pipeline",
      objective: "Replace lost opportunity capacity.",
      evidence: ["An active opportunity closed."],
      constraints: [],
      confidence: "HIGH",
    },
    {
      direction: "REBUILD",
      rationale: "The pipeline requires replacement capacity.",
      evidence: ["An active opportunity closed."],
      source: "CLOSURE",
      confidence: "HIGH",
    },
    {
      direction: "REBUILD",
      consecutiveCycles: 1,
      status: "RESET",
      rationale: "The previous path was materially reset.",
      confidence: "HIGH",
    },
  );

  assert.equal(
    strategy.guardrails.some((item) =>
      item.includes("reset path"),
    ),
    true,
  );
});

test("persistence-aware recovery execution preserves an established direction", () => {
  const plan = getRecoveryExecutionPlan(
    {
      decision: "Prioritize interview progression",
      objective: "Advance the strongest active interview opportunity.",
      evidence: ["Active interview is progressing."],
      constraints: [],
      confidence: "HIGH",
    },
    {
      strategy: "Convert interviews into late-stage opportunities",
      objective: "Advance the strongest active interview opportunity.",
      approach: ["Prepare for the next interview stage"],
      guardrails: [],
      successSignals: ["Interview progresses"],
      confidence: "HIGH",
    },
    {
      direction: "INTENSIFY",
      rationale: "The active opportunity is progressing.",
      evidence: ["Interview progression is improving."],
      source: "ADVANCEMENT",
      confidence: "HIGH",
    },
    {
      direction: "INTENSIFY",
      consecutiveCycles: 4,
      status: "PERSISTING",
      rationale: "The direction has persisted.",
      confidence: "HIGH",
    },
  );

  assert.equal(
    plan.avoidActions.some((item) =>
      item.includes("4 consecutive cycles"),
    ),
    true,
  );
});

test("persistence-aware recovery execution avoids expanding a new direction", () => {
  const plan = getRecoveryExecutionPlan(
    {
      decision: "Build recovery pipeline",
      objective: "Create sufficient qualified recovery opportunities.",
      evidence: [],
      constraints: [],
      confidence: "LOW",
    },
    {
      strategy: "Establish sufficient qualified pipeline",
      objective: "Create sufficient qualified recovery opportunities.",
      approach: ["Create new qualified application opportunities"],
      guardrails: [],
      successSignals: ["Qualified pipeline increases"],
      confidence: "LOW",
    },
    {
      direction: "CONTINUE",
      rationale: "Evidence is insufficient.",
      evidence: [],
      source: "INSUFFICIENT",
      confidence: "LOW",
    },
    {
      direction: "CONTINUE",
      consecutiveCycles: 1,
      status: "NEW",
      rationale: "The direction is newly established.",
      confidence: "LOW",
    },
  );

  assert.equal(
    plan.avoidActions.some((item) =>
      item.includes("newly established"),
    ),
    true,
  );
});

test("persistence-aware recovery execution resets assumptions after directional reset", () => {
  const plan = getRecoveryExecutionPlan(
    {
      decision: "Rebuild the recovery pipeline",
      objective: "Replace lost opportunity capacity.",
      evidence: ["An active opportunity closed."],
      constraints: [],
      confidence: "HIGH",
    },
    {
      strategy: "Replace lost opportunity capacity",
      objective: "Replace lost opportunity capacity.",
      approach: ["Create new qualified application opportunities"],
      guardrails: [],
      successSignals: ["Replacement opportunity capacity exists"],
      confidence: "HIGH",
    },
    {
      direction: "REBUILD",
      rationale: "The pipeline requires replacement capacity.",
      evidence: ["An active opportunity closed."],
      source: "CLOSURE",
      confidence: "HIGH",
    },
    {
      direction: "REBUILD",
      consecutiveCycles: 1,
      status: "RESET",
      rationale: "The previous path was materially reset.",
      confidence: "HIGH",
    },
  );

  assert.equal(
    plan.avoidActions.some((item) =>
      item.includes("reset path"),
    ),
    true,
  );
});

test("recovery execution plan completes the recovery transition", () => {
  const decision = {
    decision: "Close out recovery",
    objective:
      "Complete the transition into stable employment and preserve the recovery gains.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  assert.equal(
    plan.immediateAction,
    "Complete the highest-priority outstanding transition step",
  );
  assert.equal(plan.sequence.length, 3);
  assert.ok(plan.supportingActions.length > 0);
  assert.ok(plan.avoidActions.length > 0);
  assert.equal(plan.confidence, "HIGH");
});

test("recovery execution plan converts an offer into completed employment", () => {
  const decision = {
    decision: "Prioritize offer execution",
    objective:
      "Convert the strongest active offer opportunity into a completed recovery transition.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  assert.equal(
    plan.immediateAction,
    "Complete the next outstanding offer or decision step",
  );
  assert.ok(
    plan.sequence.includes(
      "Resolve open questions or blockers on the active offer",
    ),
  );
  assert.ok(plan.supportingActions.includes("Keep appropriate backup coverage moving"));
  assert.equal(plan.confidence, "HIGH");
});

test("recovery execution plan protects runway while preserving momentum", () => {
  const decision = {
    decision: "Stabilize runway while maintaining recovery momentum",
    objective:
      "Protect financial runway while preserving the shortest viable path back to employment.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  assert.equal(
    plan.immediateAction,
    "Review and protect immediate financial runway",
  );
  assert.equal(plan.sequence[0], "Protect immediate financial runway");
  assert.ok(
    plan.sequence.includes(
      "Prioritize active opportunities with the shortest path to progression",
    ),
  );
  assert.equal(plan.confidence, "HIGH");
});

test("recovery execution plan concentrates effort on final-round execution", () => {
  const decision = {
    decision: "Prioritize final-round progression",
    objective:
      "Convert the strongest late-stage opportunity into the next recovery transition.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  assert.equal(
    plan.immediateAction,
    "Prepare for the next final-round requirement",
  );
  assert.equal(
    plan.sequence[0],
    "Prepare specifically for the final-round requirements",
  );
  assert.ok(
    plan.supportingActions.includes(
      "Complete targeted final-round follow-up",
    ),
  );
  assert.equal(plan.confidence, "HIGH");
});

test("recovery execution plan converts interviews into late-stage opportunities", () => {
  const decision = {
    decision: "Prioritize interview progression",
    objective:
      "Move active interview opportunities toward final rounds or offers.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  assert.equal(
    plan.immediateAction,
    "Prepare for the next active interview stage",
  );
  assert.equal(plan.sequence.length, 3);
  assert.ok(
    plan.supportingActions.includes(
      "Identify opportunities showing progression",
    ),
  );
  assert.equal(plan.confidence, "HIGH");
});

test("recovery execution plan replaces lost opportunity capacity", () => {
  const decision = {
    decision: "Rebuild the recovery pipeline",
    objective:
      "Replace lost opportunity capacity while learning from the latest pipeline change.",
    evidence: [],
    constraints: [],
    confidence: "MEDIUM" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  assert.equal(
    plan.immediateAction,
    "Create the first qualified replacement opportunity",
  );
  assert.equal(plan.sequence[0], "Replace recently lost opportunity capacity");
  assert.ok(
    plan.supportingActions.includes(
      "Use the latest setback or closure as selection evidence",
    ),
  );
  assert.equal(plan.confidence, "MEDIUM");
});

test("recovery execution plan converts existing application volume", () => {
  const decision = {
    decision: "Prioritize application conversion",
    objective:
      "Turn existing application activity into active conversations and downstream opportunities before materially increasing volume.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  assert.equal(
    plan.immediateAction,
    "Follow up on the strongest existing application",
  );
  assert.equal(
    plan.sequence[0],
    "Follow up on the strongest existing applications",
  );
  assert.ok(
    plan.supportingActions.includes(
      "Track whether applications produce conversations",
    ),
  );
  assert.equal(plan.confidence, "HIGH");
});

test("recovery execution plan maintains qualified search activity", () => {
  const decision = {
    decision: "Maintain active job search",
    objective:
      "Keep active opportunities moving while strengthening downstream pipeline depth.",
    evidence: [],
    constraints: [],
    confidence: "MEDIUM" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  assert.equal(
    plan.immediateAction,
    "Advance the strongest qualified active opportunity",
  );
  assert.equal(plan.sequence[0], "Continue qualified applications");
  assert.ok(
    plan.sequence.includes(
      "Strengthen downstream opportunities from the existing pipeline",
    ),
  );
  assert.equal(plan.confidence, "MEDIUM");
});

test("recovery execution plan establishes sufficient qualified pipeline", () => {
  const decision = {
    decision: "Build recovery pipeline",
    objective:
      "Create enough qualified opportunities to move the recovery process into active progression.",
    evidence: [],
    constraints: [],
    confidence: "MEDIUM" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  assert.equal(
    plan.immediateAction,
    "Create the first qualified recovery opportunity",
  );
  assert.equal(
    plan.sequence[0],
    "Create new qualified application opportunities",
  );
  assert.ok(
    plan.supportingActions.includes(
      "Create relevant networking and referral paths",
    ),
  );
  assert.equal(plan.confidence, "MEDIUM");
});

test("direction-aware recovery execution plan closes out recovery", () => {
  const decision = {
    decision: "Close out recovery",
    objective:
      "Complete the transition into stable employment and preserve the recovery gains.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy, {
    direction: "CLOSEOUT" as const,
    rationale: "Employment recovery is operational.",
    evidence: [],
    source: "RECOVERY" as const,
    confidence: "HIGH" as const,
  });

  assert.ok(
    plan.avoidActions.includes(
      "Closeout direction: do not expand recovery activity unless the transition becomes unstable.",
    ),
  );
});

test("direction-aware recovery execution plan rebuilds lost capacity", () => {
  const decision = {
    decision: "Rebuild the recovery pipeline",
    objective:
      "Replace lost opportunity capacity while learning from the latest pipeline change.",
    evidence: [],
    constraints: [],
    confidence: "MEDIUM" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy, {
    direction: "REBUILD" as const,
    rationale: "Opportunity capacity was lost.",
    evidence: [],
    source: "CLOSURE" as const,
    confidence: "HIGH" as const,
  });

  assert.ok(
    plan.avoidActions.includes(
      "Rebuild direction: replace lost opportunity capacity before relying on the remaining pipeline.",
    ),
  );
});

test("direction-aware recovery execution plan shifts before increasing volume", () => {
  const decision = {
    decision: "Prioritize application conversion",
    objective:
      "Turn existing application activity into active conversations and downstream opportunities before materially increasing volume.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy, {
    direction: "SHIFT" as const,
    rationale: "The latest recovery evidence weakened the current path.",
    evidence: [],
    source: "SETBACK" as const,
    confidence: "HIGH" as const,
  });

  assert.ok(
    plan.avoidActions.includes(
      "Shift direction: change the recovery approach before increasing activity volume.",
    ),
  );
});

test("direction-aware recovery execution plan intensifies the active opportunity", () => {
  const decision = {
    decision: "Prioritize final-round progression",
    objective:
      "Convert the strongest late-stage opportunity into the next recovery transition.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy, {
    direction: "INTENSIFY" as const,
    rationale: "The active recovery opportunity is progressing.",
    evidence: [],
    source: "ADVANCEMENT" as const,
    confidence: "HIGH" as const,
  });

  assert.ok(
    plan.avoidActions.includes(
      "Intensify direction: concentrate effort on the active recovery opportunity before expanding search.",
    ),
  );
});

test("direction-aware recovery execution plan preserves the existing continue plan", () => {
  const decision = {
    decision: "Build recovery pipeline",
    objective:
      "Create enough qualified opportunities to move the recovery process into active progression.",
    evidence: [],
    constraints: [],
    confidence: "MEDIUM" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const basePlan = getRecoveryExecutionPlan(decision, strategy);

  const directionAwarePlan = getRecoveryExecutionPlan(decision, strategy, {
    direction: "CONTINUE" as const,
    rationale: "The current recovery path remains supported.",
    evidence: [],
    source: "ADVANCEMENT" as const,
    confidence: "MEDIUM" as const,
  });

  assert.deepEqual(directionAwarePlan, basePlan);
});

test("recovery execution plan falls back safely for an unknown decision", () => {
  const decision = {
    decision: "Unknown recovery decision",
    objective: "Continue recovery",
    evidence: [],
    constraints: [],
    confidence: "LOW" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  assert.equal(
    plan.immediateAction,
    "Continue the highest-value recovery activity",
  );
  assert.equal(plan.sequence.length, 2);
  assert.ok(plan.supportingActions.length > 0);
  assert.equal(plan.confidence, "LOW");
});


test("persistence-aware execution actions preserve an established direction", () => {
  const plan = {
    objective: "Advance the strongest active opportunity.",
    sequence: ["Prepare for the next interview stage"],
    immediateAction: "Prepare for the next interview stage",
    supportingActions: [],
    avoidActions: [],
    confidence: "HIGH",
  };

  const actions = getExecutionActions(
    plan,
    [],
    {
      direction: "INTENSIFY",
      consecutiveCycles: 4,
      status: "PERSISTING",
      rationale: "The direction has persisted.",
      confidence: "HIGH",
    },
  );

  assert.equal(actions.length > 0, true);
  assert.equal(
    actions.every((item) =>
      item.step.includes("4 consecutive cycles"),
    ),
    true,
  );
});

test("persistence-aware execution actions avoid expanding a new direction", () => {
  const plan = {
    objective: "Create qualified recovery opportunities.",
    sequence: ["Create new qualified application opportunities"],
    immediateAction: "Create new qualified application opportunities",
    supportingActions: [],
    avoidActions: [],
    confidence: "LOW",
  };

  const actions = getExecutionActions(
    plan,
    [],
    {
      direction: "CONTINUE",
      consecutiveCycles: 1,
      status: "NEW",
      rationale: "The direction is newly established.",
      confidence: "LOW",
    },
  );

  assert.equal(actions.length > 0, true);
  assert.equal(
    actions.every((item) =>
      item.step.includes("newly established"),
    ),
    true,
  );
});

test("persistence-aware execution actions reset assumptions after directional reset", () => {
  const plan = {
    objective: "Replace lost opportunity capacity.",
    sequence: ["Create new qualified application opportunities"],
    immediateAction: "Create new qualified application opportunities",
    supportingActions: [],
    avoidActions: [],
    confidence: "HIGH",
  };

  const actions = getExecutionActions(
    plan,
    [],
    {
      direction: "REBUILD",
      consecutiveCycles: 1,
      status: "RESET",
      rationale: "The previous path was materially reset.",
      confidence: "HIGH",
    },
  );

  assert.equal(actions.length > 0, true);
  assert.equal(
    actions.every((item) =>
      item.step.includes("reset path"),
    ),
    true,
  );
});

test("execution actions map plan steps to existing recovery actions", () => {
  const input: RecoveryEngineInput = {
    applications: [
      {
        id: "application-1",
        company: "Test Company",
        role: "Test Role",
        stage: "Interview",
      },
    ],
    interviews: [
      {
        id: "interview-1",
        company: "Test Company",
        role: "Test Role",
        stage: "Interview",
      },
    ],
  };

  const recovery = calculateRecovery(input);

  const executionActions = recovery.executionActions;

  assert.ok(executionActions.length > 0);
  assert.equal(
    executionActions.length,
    recovery.recoveryExecutionPlan.sequence.length,
  );

  const mappedActions = executionActions.filter(
    (item) => item.action !== null,
  );

  assert.ok(mappedActions.length > 0);

  for (const item of mappedActions) {
    assert.ok(item.action);
    assert.ok(
      recovery.actions.some(
        (action) =>
          action.title === item.action?.title &&
          action.href === item.action?.href,
      ),
    );
  }
});

test("execution actions never invent actions that are absent from recommendations", () => {
  const plan = getRecoveryExecutionPlan(
    {
      decision: "Prioritize interview progression",
      objective: "Advance the active interview pipeline",
      evidence: [],
      constraints: [],
      confidence: "HIGH",
    },
    {
      strategy: "Concentrate effort on interview progression",
      objective: "Advance the active interview pipeline",
      approach: [],
      guardrails: [],
      successSignals: [],
      confidence: "HIGH",
    },
  );

  const actions = [
    {
      title: "Unrelated action",
      reason: "Test",
      href: "/test",
      priority: "DIRECTION" as const,
    },
  ];

  const executionActions = getExecutionActions(plan, actions);

  assert.equal(executionActions.length, plan.sequence.length);
  assert.ok(
    executionActions.every((item) => item.action === null),
  );
});

test("execution actions preserve the execution plan sequence", () => {
  const plan = getRecoveryExecutionPlan(
    {
      decision: "Prioritize final-round progression",
      objective: "Advance the final-round opportunity",
      evidence: [],
      constraints: [],
      confidence: "HIGH",
    },
    {
      strategy: "Concentrate effort on final-round execution",
      objective: "Advance the final-round opportunity",
      approach: [],
      guardrails: [],
      successSignals: [],
      confidence: "HIGH",
    },
  );

  const actions = [
    {
      title: "Prepare your final-round talking points",
      reason: "Prepare for the active final round.",
      href: "/interviews",
      priority: "INTERVIEWS" as const,
    },
  ];

  const executionActions = getExecutionActions(plan, actions);

  assert.deepEqual(
    executionActions.map((item) => item.step),
    plan.sequence,
  );

  assert.equal(
    executionActions[0]?.action?.title,
    "Prepare your final-round talking points",
  );
});


test("learning-aware recalibration supports the current direction", () => {
  const outcome = getRecoveryOutcome(
    progression("Interview", "Final"),
  );
  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "ADVANCING",
  );
  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "ADVANCING",
  );

  const result = getRecoveryRecalibration(
    "INTERVIEWING",
    "ADVANCING",
    {
      decision: "Prioritize interview progression",
      objective: "Advance the active interview",
      evidence: [],
      constraints: [],
      confidence: "HIGH",
    },
    {
      strategy: "Convert interview into late-stage opportunity",
      objective: "Advance the active interview",
      approach: [],
      guardrails: [],
      successSignals: [],
      confidence: "HIGH",
    },
    {
      objective: "Advance the active interview",
      sequence: [],
      immediateAction: "Prepare for your next interview",
      supportingActions: [],
      avoidActions: [],
      confidence: "HIGH",
    },
    [],
    learning,
  );

  assert.equal(result.learningEffect, "SUPPORTS");
});

test("learning-aware recalibration challenges the direction after closure", () => {
  const outcome = getRecoveryOutcome(
    progression("Interview", "Rejected"),
  );
  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "CLOSED",
  );
  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "CLOSED",
  );

  const result = getRecoveryRecalibration(
    "SEARCHING",
    "CLOSED",
    {
      decision: "Rebuild the recovery pipeline",
      objective: "Replace lost opportunity capacity",
      evidence: [],
      constraints: [],
      confidence: "HIGH",
    },
    {
      strategy: "Replace lost opportunity capacity",
      objective: "Rebuild qualified pipeline",
      approach: [],
      guardrails: [],
      successSignals: [],
      confidence: "HIGH",
    },
    {
      objective: "Rebuild qualified pipeline",
      sequence: [],
      immediateAction: "Add a new target opportunity",
      supportingActions: [],
      avoidActions: [],
      confidence: "HIGH",
    },
    [],
    learning,
  );

  assert.equal(result.learningEffect, "CHALLENGES");
});

test("learning-aware recalibration remains insufficient with low-confidence learning", () => {
  const outcome = getRecoveryOutcome(null);
  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "NEUTRAL",
  );
  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "NEUTRAL",
  );

  const result = getRecoveryRecalibration(
    "STABILIZING",
    "NEUTRAL",
    {
      decision: "Continue current recovery direction",
      objective: "Maintain recovery progress",
      evidence: [],
      constraints: [],
      confidence: "LOW",
    },
    {
      strategy: "Maintain current recovery direction",
      objective: "Maintain recovery progress",
      approach: [],
      guardrails: [],
      successSignals: [],
      confidence: "LOW",
    },
    {
      objective: "Maintain recovery progress",
      sequence: [],
      immediateAction: "Review this week's recovery plan",
      supportingActions: [],
      avoidActions: [],
      confidence: "LOW",
    },
    [],
    learning,
  );

  assert.equal(result.learningEffect, "INSUFFICIENT");
});

test("execution-aware recovery recalibration supports positive action effect", () => {
  const decision = {
    decision: "Prioritize interview progression",
    objective: "Convert active interviews into late-stage opportunities.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  const recalibration = getRecoveryRecalibration(
    "INTERVIEWING",
    "ADVANCING",
    decision,
    strategy,
    plan,
    [],
    {
      pattern: "Meaningful recovery progression is being generated.",
      learning:
        "The current recovery approach is producing evidence of downstream movement. Preserve the direction while continuing execution.",
      evidence: [],
      confidence: "HIGH" as const,
    },
    {
      status: "POSITIVE" as const,
      headline: "Action produced positive movement",
      summary: "The completed action generated downstream progression.",
      evidence: ["Interview progressed."],
      recommendation: "Continue the current recovery path.",
    },
  );

  assert.equal(recalibration.executionEffect, "SUPPORTS");
});

test("execution-aware recovery recalibration challenges after negative action effect", () => {
  const decision = {
    decision: "Prioritize application conversion",
    objective: "Convert existing application activity into conversations.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  const recalibration = getRecoveryRecalibration(
    "SEARCHING",
    "SETBACK",
    decision,
    strategy,
    plan,
    [],
    {
      pattern: "Recovery progression weakened or moved backward.",
      learning:
        "The latest recovery evidence weakens the current direction. Treat the signal as learning before expanding the same activity.",
      evidence: [],
      confidence: "HIGH" as const,
    },
    {
      status: "NEGATIVE" as const,
      headline: "Action did not produce progression",
      summary: "The completed action produced a negative downstream result.",
      evidence: ["Application did not progress."],
      recommendation: "Reassess the current approach.",
    },
  );

  assert.equal(recalibration.executionEffect, "CHALLENGES");
});

test("execution-aware recovery recalibration remains insufficient for unknown action effect", () => {
  const decision = {
    decision: "Build recovery pipeline",
    objective: "Create sufficient qualified recovery pipeline.",
    evidence: [],
    constraints: [],
    confidence: "MEDIUM" as const,
  };

  const strategy = getRecoveryStrategy(decision);
  const plan = getRecoveryExecutionPlan(decision, strategy);

  const recalibration = getRecoveryRecalibration(
    "SEARCHING",
    "NEUTRAL",
    decision,
    strategy,
    plan,
    [],
    {
      pattern: "No material directional recovery pattern is visible.",
      learning:
        "The available outcome evidence is insufficient to establish a new recovery lesson.",
      evidence: [],
      confidence: "LOW" as const,
    },
    {
      status: "UNKNOWN" as const,
      headline: "No downstream action outcome",
      summary: "The action has not produced a measurable outcome.",
      evidence: [],
      recommendation: "Continue until stronger evidence appears.",
    },
  );

  assert.equal(recalibration.executionEffect, "INSUFFICIENT");
});

test("recovery recalibration reassesses after a setback", () => {
  const decision = {
    decision: "Rebuild the recovery pipeline",
    objective: "Restore qualified opportunity capacity",
    evidence: ["A recent opportunity was lost"],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = {
    strategy: "Replace lost opportunity capacity",
    objective: "Restore qualified opportunity capacity",
    approach: ["Replace lost pipeline capacity"],
    guardrails: ["Avoid undifferentiated volume"],
    successSignals: ["Qualified replacement opportunities"],
    confidence: "HIGH" as const,
  };

  const plan = getRecoveryExecutionPlan(decision, strategy);
  const recalibration = getRecoveryRecalibration(
    "SEARCHING",
    "SETBACK",
    decision,
    strategy,
    plan,
    []
  );

  assert.equal(recalibration.decisionStatus, "REASSESS");
  assert.equal(recalibration.strategyStatus, "REASSESS");
  assert.match(recalibration.signal, /moved backward/i);
});

test("recovery recalibration holds direction during advancement", () => {
  const decision = {
    decision: "Prioritize interview progression",
    objective: "Move active interviews toward later stages",
    evidence: ["An active interview is progressing"],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = {
    strategy: "Concentrate effort on late-stage execution",
    objective: "Move active interviews toward later stages",
    approach: ["Prepare for the next interview stage"],
    guardrails: ["Protect active opportunities"],
    successSignals: ["Interview progression"],
    confidence: "HIGH" as const,
  };

  const plan = getRecoveryExecutionPlan(decision, strategy);
  const recalibration = getRecoveryRecalibration(
    "INTERVIEWING",
    "ADVANCING",
    decision,
    strategy,
    plan,
    []
  );

  assert.equal(recalibration.decisionStatus, "HOLD");
  assert.equal(recalibration.strategyStatus, "HOLD");
  assert.match(recalibration.signal, /progressing/i);
});

test("recovery recalibration preserves execution as the next step", () => {
  const decision = {
    decision: "Prioritize final-round progression",
    objective: "Move the final-round opportunity toward an offer",
    evidence: ["A final round is active"],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = {
    strategy: "Concentrate effort on final-round execution",
    objective: "Move the final-round opportunity toward an offer",
    approach: ["Prepare specifically for final-round requirements"],
    guardrails: ["Protect final-round execution"],
    successSignals: ["Final-round progression"],
    confidence: "HIGH" as const,
  };

  const plan = getRecoveryExecutionPlan(decision, strategy);
  const action = {
    title: "Prepare your final-round talking points",
    reason: "Final-round preparation is the highest-value next action.",
    href: "/interviews",
    priority: "INTERVIEWS",
  };

  const recalibration = getRecoveryRecalibration(
    "FINAL_ROUND",
    "NEUTRAL",
    decision,
    strategy,
    plan,
    [action]
  );

  assert.equal(
    recalibration.nextStep,
    "Prepare your final-round talking points"
  );
});

test("recovery recalibration holds after recovery", () => {
  const decision = {
    decision: "Close out recovery",
    objective: "Complete the employment transition",
    evidence: ["Employment transition is active"],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = {
    strategy: "Complete the recovery transition",
    objective: "Complete the employment transition",
    approach: ["Complete outstanding transition steps"],
    guardrails: ["Protect the gains created by recovery"],
    successSignals: ["Transition operational"],
    confidence: "HIGH" as const,
  };

  const plan = getRecoveryExecutionPlan(decision, strategy);
  const recalibration = getRecoveryRecalibration(
    "RECOVERED",
    "NEUTRAL",
    decision,
    strategy,
    plan,
    []
  );

  assert.equal(recalibration.decisionStatus, "HOLD");
  assert.equal(recalibration.strategyStatus, "HOLD");
  assert.match(recalibration.trigger, /recovered/i);
});


test("direction persistence starts from one cycle", () => {
  const stability = {
    status: "INITIAL",
    previousDirection: null,
    currentDirection: "CONTINUE",
    rationale: "Initial directional state.",
    confidence: "MEDIUM",
  } as const;

  const persistence = getRecoveryDirectionPersistence(stability);

  assert.equal(persistence.status, "NEW");
  assert.equal(persistence.direction, "CONTINUE");
  assert.equal(persistence.consecutiveCycles, 1);
});

test("direction persistence increments when direction remains stable", () => {
  const stability = {
    status: "STABLE",
    previousDirection: "CONTINUE",
    currentDirection: "CONTINUE",
    rationale: "Direction remains stable.",
    confidence: "MEDIUM",
  } as const;

  const persistence = getRecoveryDirectionPersistence(stability, 3);

  assert.equal(persistence.status, "PERSISTING");
  assert.equal(persistence.direction, "CONTINUE");
  assert.equal(persistence.consecutiveCycles, 4);
});

test("direction persistence resets after an ordinary directional change", () => {
  const stability = {
    status: "CHANGED",
    previousDirection: "CONTINUE",
    currentDirection: "SHIFT",
    rationale: "Direction changed.",
    confidence: "HIGH",
  } as const;

  const persistence = getRecoveryDirectionPersistence(stability, 7);

  assert.equal(persistence.status, "NEW");
  assert.equal(persistence.direction, "SHIFT");
  assert.equal(persistence.consecutiveCycles, 1);
});

test("direction persistence resets after a material recovery reset", () => {
  const stability = {
    status: "RESET",
    previousDirection: "CONTINUE",
    currentDirection: "REBUILD",
    rationale: "Recovery path materially changed.",
    confidence: "HIGH",
  } as const;

  const persistence = getRecoveryDirectionPersistence(stability, 9);

  assert.equal(persistence.status, "RESET");
  assert.equal(persistence.direction, "REBUILD");
  assert.equal(persistence.consecutiveCycles, 1);
});

test("direction stability is initial without previous direction", () => {
  const direction = {
    direction: "CONTINUE",
    rationale: "Continue the current recovery path.",
    evidence: ["Current evidence supports continuation."],
    source: "ADVANCEMENT",
    confidence: "MEDIUM",
  } as const;

  const memory = getRecoveryDirectionMemory(null, direction);
  const stability = getRecoveryDirectionStability(memory);

  assert.equal(stability.status, "INITIAL");
  assert.equal(stability.previousDirection, null);
  assert.equal(stability.currentDirection, "CONTINUE");
});

test("direction stability is stable when direction is preserved", () => {
  const direction = {
    direction: "CONTINUE",
    rationale: "Continue the current recovery path.",
    evidence: ["Current evidence supports continuation."],
    source: "ADVANCEMENT",
    confidence: "MEDIUM",
  } as const;

  const memory = getRecoveryDirectionMemory("CONTINUE", direction);
  const stability = getRecoveryDirectionStability(memory);

  assert.equal(stability.status, "STABLE");
  assert.equal(stability.previousDirection, "CONTINUE");
  assert.equal(stability.currentDirection, "CONTINUE");
});

test("direction stability identifies an ordinary directional change", () => {
  const direction = {
    direction: "SHIFT",
    rationale: "Change the current recovery approach.",
    evidence: ["The current path weakened."],
    source: "SETBACK",
    confidence: "HIGH",
  } as const;

  const memory = getRecoveryDirectionMemory("CONTINUE", direction);
  const stability = getRecoveryDirectionStability(memory);

  assert.equal(stability.status, "CHANGED");
  assert.equal(stability.previousDirection, "CONTINUE");
  assert.equal(stability.currentDirection, "SHIFT");
});

test("direction stability identifies a material recovery reset", () => {
  const direction = {
    direction: "REBUILD",
    rationale: "Rebuild the recovery pipeline.",
    evidence: ["Recovery opportunity capacity was lost."],
    source: "CLOSURE",
    confidence: "HIGH",
  } as const;

  const memory = getRecoveryDirectionMemory("CONTINUE", direction);
  const stability = getRecoveryDirectionStability(memory);

  assert.equal(stability.status, "RESET");
  assert.equal(stability.previousDirection, "CONTINUE");
  assert.equal(stability.currentDirection, "REBUILD");
});

test("direction memory records a meaningful direction change", () => {
  const direction = getRecoveryDirection(
    "INTERVIEWING",
    "SETBACK",
    {
      direction: "NEGATIVE",
      impact: "MEDIUM",
      implication:
        "The latest outcome weakens the evidence supporting the current recovery direction.",
      evidence: ["The active opportunity moved backward."],
    },
    {
      pattern: "Recovery progression weakened or moved backward.",
      learning:
        "The latest recovery evidence weakens the current direction. Treat the signal as learning before expanding the same activity.",
      evidence: ["The active opportunity moved backward."],
      confidence: "HIGH",
    },
    undefined,
    {
      status: "NEGATIVE",
      headline: "Recovery action produced negative evidence",
      summary: "The completed action was followed by a setback signal.",
      evidence: ["Action: Follow up", "Progression: Interview → Rejected"],
      recommendation: "Change the approach before repeating the action.",
    },
  );

  const memory = getRecoveryDirectionMemory("CONTINUE", direction);

  assert.equal(memory.changed, true);
  assert.equal(memory.previousDirection, "CONTINUE");
  assert.equal(memory.currentDirection, "SHIFT");
  assert.equal(memory.source, "SETBACK");
  assert.equal(memory.confidence, "HIGH");
  assert.deepEqual(memory.evidence, direction.evidence);
});

test("direction memory stays unchanged when direction is preserved", () => {
  const direction = getRecoveryDirection(
    "SEARCHING",
    "NEUTRAL",
    {
      direction: "NEUTRAL",
      impact: "LOW",
      implication:
        "The latest outcome does not provide enough directional evidence to change the current recovery approach.",
      evidence: [],
    },
    {
      pattern: "No material directional recovery pattern is visible.",
      learning:
        "The available outcome evidence is insufficient to establish a new recovery lesson.",
      evidence: [],
      confidence: "LOW",
    },
  );

  const memory = getRecoveryDirectionMemory("CONTINUE", direction);

  assert.equal(memory.changed, false);
  assert.equal(memory.previousDirection, "CONTINUE");
  assert.equal(memory.currentDirection, "CONTINUE");
  assert.equal(memory.confidence, "LOW");
});

test("direction memory does not invent a change without previous direction", () => {
  const direction = getRecoveryDirection(
    "RECOVERED",
    "ADVANCING",
    {
      direction: "POSITIVE",
      impact: "MEDIUM",
      implication:
        "The latest outcome supports the current recovery direction and provides evidence to continue execution.",
      evidence: [],
    },
    {
      pattern: "Meaningful recovery progression is being generated.",
      learning:
        "The current recovery approach is producing evidence of downstream movement. Preserve the direction while continuing execution.",
      evidence: [],
      confidence: "HIGH",
    },
  );

  const memory = getRecoveryDirectionMemory(null, direction);

  assert.equal(memory.changed, false);
  assert.equal(memory.previousDirection, null);
  assert.equal(memory.currentDirection, "CLOSEOUT");
  assert.equal(memory.source, "RECOVERY");
});

test("recovery direction closes out recovered employment", () => {
  const outcome = getRecoveryOutcome(
    progression("Final", "Offer"),
  );
  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "ADVANCING",
  );
  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "ADVANCING",
  );

  const recalibration = getRecoveryRecalibration(
    "RECOVERED",
    "ADVANCING",
    {
      decision: "Complete recovery transition",
      objective: "Close out employment recovery",
      evidence: [],
      constraints: [],
      confidence: "HIGH",
    },
    {
      strategy: "Complete recovery transition",
      objective: "Close out employment recovery",
      approach: [],
      guardrails: [],
      successSignals: [],
      confidence: "HIGH",
    },
    {
      objective: "Close out employment recovery",
      sequence: [],
      immediateAction: "Confirm your accepted offer details",
      supportingActions: [],
      avoidActions: [],
      confidence: "HIGH",
    },
    [],
    learning,
  );

  const result = getRecoveryDirection(
    "RECOVERED",
    "ADVANCING",
    intelligence,
    learning,
    recalibration,
  );

  assert.equal(result.direction, "CLOSEOUT");
  assert.equal(result.source, "RECOVERY");
});

test("recovery direction intensifies supported late-stage advancement", () => {
  const outcome = getRecoveryOutcome(
    progression("Interview", "Final"),
  );
  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "ADVANCING",
  );
  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "ADVANCING",
  );

  const recalibration = getRecoveryRecalibration(
    "FINAL_ROUND",
    "ADVANCING",
    {
      decision: "Prioritize final-round progression",
      objective: "Advance the final round",
      evidence: [],
      constraints: [],
      confidence: "HIGH",
    },
    {
      strategy: "Concentrate effort on final-round execution",
      objective: "Advance the final round",
      approach: [],
      guardrails: [],
      successSignals: [],
      confidence: "HIGH",
    },
    {
      objective: "Advance the final round",
      sequence: [],
      immediateAction: "Prepare your final-round talking points",
      supportingActions: [],
      avoidActions: [],
      confidence: "HIGH",
    },
    [],
    learning,
  );

  const result = getRecoveryDirection(
    "FINAL_ROUND",
    "ADVANCING",
    intelligence,
    learning,
    recalibration,
  );

  assert.equal(result.direction, "INTENSIFY");
  assert.equal(result.source, "ADVANCEMENT");
});

test("recovery direction shifts after a setback", () => {
  const outcome = getRecoveryOutcome(
    progression("Interview", "Rejected"),
  );
  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "SETBACK",
  );
  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "SETBACK",
  );

  const recalibration = getRecoveryRecalibration(
    "INTERVIEWING",
    "SETBACK",
    {
      decision: "Rebuild the recovery pipeline",
      objective: "Replace lost opportunity capacity",
      evidence: [],
      constraints: [],
      confidence: "HIGH",
    },
    {
      strategy: "Replace lost opportunity capacity",
      objective: "Rebuild qualified pipeline",
      approach: [],
      guardrails: [],
      successSignals: [],
      confidence: "HIGH",
    },
    {
      objective: "Rebuild qualified pipeline",
      sequence: [],
      immediateAction: "Add a new target opportunity",
      supportingActions: [],
      avoidActions: [],
      confidence: "HIGH",
    },
    [],
    learning,
  );

  const result = getRecoveryDirection(
    "INTERVIEWING",
    "SETBACK",
    intelligence,
    learning,
    recalibration,
  );

  assert.equal(result.direction, "SHIFT");
  assert.equal(result.source, "SETBACK");
});

test("recovery direction rebuilds after opportunity closure", () => {
  const outcome = getRecoveryOutcome(
    progression("Interview", "Rejected"),
  );
  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "CLOSED",
  );
  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "CLOSED",
  );

  const recalibration = getRecoveryRecalibration(
    "SEARCHING",
    "CLOSED",
    {
      decision: "Rebuild the recovery pipeline",
      objective: "Replace lost opportunity capacity",
      evidence: [],
      constraints: [],
      confidence: "HIGH",
    },
    {
      strategy: "Replace lost opportunity capacity",
      objective: "Rebuild qualified pipeline",
      approach: [],
      guardrails: [],
      successSignals: [],
      confidence: "HIGH",
    },
    {
      objective: "Rebuild qualified pipeline",
      sequence: [],
      immediateAction: "Add a new target opportunity",
      supportingActions: [],
      avoidActions: [],
      confidence: "HIGH",
    },
    [],
    learning,
  );

  const result = getRecoveryDirection(
    "SEARCHING",
    "CLOSED",
    intelligence,
    learning,
    recalibration,
  );

  assert.equal(result.direction, "REBUILD");
  assert.equal(result.source, "CLOSURE");
});

test("recovery direction continues when evidence is insufficient", () => {
  const outcome = getRecoveryOutcome(null);
  const intelligence = getRecoveryOutcomeIntelligence(
    outcome,
    "NEUTRAL",
  );
  const learning = getRecoveryLearning(
    outcome,
    intelligence,
    "NEUTRAL",
  );

  const recalibration = getRecoveryRecalibration(
    "STABILIZING",
    "NEUTRAL",
    {
      decision: "Continue current recovery direction",
      objective: "Maintain recovery progress",
      evidence: [],
      constraints: [],
      confidence: "LOW",
    },
    {
      strategy: "Maintain current recovery direction",
      objective: "Maintain recovery progress",
      approach: [],
      guardrails: [],
      successSignals: [],
      confidence: "LOW",
    },
    {
      objective: "Maintain recovery progress",
      sequence: [],
      immediateAction: "Review this week's recovery plan",
      supportingActions: [],
      avoidActions: [],
      confidence: "LOW",
    },
    [],
    learning,
  );

  const result = getRecoveryDirection(
    "STABILIZING",
    "NEUTRAL",
    intelligence,
    learning,
    recalibration,
  );

  assert.equal(result.direction, "CONTINUE");
  assert.equal(result.source, "INSUFFICIENT");
  assert.equal(result.confidence, "LOW");
});



test("direction-aware recovery strategy closes out recovery", () => {
  const decision = {
    decision: "Close out recovery",
    objective: "Complete the recovery transition.",
    evidence: ["Recovery is operational."],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision, {
    direction: "CLOSEOUT" as const,
    rationale: "Recovery is operational.",
    evidence: ["Recovery state is RECOVERED."],
    source: "RECOVERY" as const,
    confidence: "HIGH" as const,
  });

  assert.ok(
    strategy.guardrails.includes(
      "Closeout direction: do not expand recovery activity unless the transition becomes unstable.",
    ),
  );
});

test("direction-aware recovery strategy rebuilds lost capacity", () => {
  const decision = {
    decision: "Rebuild the recovery pipeline",
    objective: "Restore recovery pipeline capacity.",
    evidence: ["Opportunity capacity was lost."],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision, {
    direction: "REBUILD" as const,
    rationale: "Pipeline capacity was lost.",
    evidence: ["Recovery opportunity closed."],
    source: "CLOSURE" as const,
    confidence: "HIGH" as const,
  });

  assert.ok(
    strategy.guardrails.includes(
      "Rebuild direction: replace lost opportunity capacity before relying on the existing pipeline.",
    ),
  );
});

test("direction-aware recovery strategy shifts before increasing volume", () => {
  const decision = {
    decision: "Prioritize application conversion",
    objective: "Convert existing application activity.",
    evidence: ["Applications are active."],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision, {
    direction: "SHIFT" as const,
    rationale: "The current path weakened.",
    evidence: ["Recovery opportunity moved backward."],
    source: "SETBACK" as const,
    confidence: "HIGH" as const,
  });

  assert.ok(
    strategy.guardrails.includes(
      "Shift direction: change the recovery approach before increasing activity volume.",
    ),
  );
});

test("direction-aware recovery strategy intensifies the active opportunity", () => {
  const decision = {
    decision: "Prioritize final-round progression",
    objective: "Advance the strongest late-stage opportunity.",
    evidence: ["Final round is active."],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const strategy = getRecoveryStrategy(decision, {
    direction: "INTENSIFY" as const,
    rationale: "Late-stage progression is supported.",
    evidence: ["Final-round progression detected."],
    source: "ADVANCEMENT" as const,
    confidence: "HIGH" as const,
  });

  assert.ok(
    strategy.guardrails.includes(
      "Intensify direction: concentrate effort on the active recovery opportunity before expanding search.",
    ),
  );
});

test("direction-aware recovery strategy preserves the existing continue strategy", () => {
  const decision = {
    decision: "Maintain active job search",
    objective: "Maintain qualified recovery activity.",
    evidence: ["Recovery activity remains active."],
    constraints: [],
    confidence: "MEDIUM" as const,
  };

  const baseStrategy = getRecoveryStrategy(decision);

  const directionAwareStrategy = getRecoveryStrategy(decision, {
    direction: "CONTINUE" as const,
    rationale: "Current direction remains supported.",
    evidence: ["No material directional change."],
    source: "ADVANCEMENT" as const,
    confidence: "MEDIUM" as const,
  });

  assert.deepEqual(directionAwareStrategy, baseStrategy);
});

test("direction-aware recovery decision closes out recovered employment", () => {
  const direction = {
    direction: "CLOSEOUT" as const,
    rationale: "Recovery is operational.",
    evidence: ["Recovery state is RECOVERED."],
    source: "RECOVERY" as const,
    confidence: "HIGH" as const,
  };

  const decision = getRecoveryDecision(
    {} as Parameters<typeof getRecoveryDecision>[0],
    "RECOVERED",
    null,
    "ACTIVE",
    {
      totalApplications: 0,
      activeApplications: 0,
      activeInterviews: 0,
      activeFinalRounds: 0,
      activeOffers: 0,
    },
    "NEUTRAL",
    null,
    direction,
  );

  assert.equal(decision.decision, "Close out recovery");
  assert.equal(decision.confidence, "HIGH");
});

test("direction-aware recovery decision rebuilds after closure", () => {
  const direction = {
    direction: "REBUILD" as const,
    rationale: "Pipeline capacity was lost.",
    evidence: ["Recovery opportunity closed."],
    source: "CLOSURE" as const,
    confidence: "HIGH" as const,
  };

  const decision = getRecoveryDecision(
    {} as Parameters<typeof getRecoveryDecision>[0],
    "SEARCHING",
    null,
    "SETBACK",
    {
      totalApplications: 0,
      activeApplications: 0,
      activeInterviews: 0,
      activeFinalRounds: 0,
      activeOffers: 0,
    },
    "CLOSED",
    null,
    direction,
  );

  assert.equal(decision.decision, "Rebuild the recovery pipeline");
  assert.equal(decision.confidence, "HIGH");
});

test("direction-aware recovery decision intensifies late-stage recovery", () => {
  const direction = {
    direction: "INTENSIFY" as const,
    rationale: "Late-stage progression is supported.",
    evidence: ["Interview progression detected."],
    source: "ADVANCEMENT" as const,
    confidence: "HIGH" as const,
  };

  const decision = getRecoveryDecision(
    {} as Parameters<typeof getRecoveryDecision>[0],
    "FINAL_ROUND",
    null,
    "ACTIVE",
    {
      totalApplications: 1,
      activeApplications: 1,
      activeInterviews: 1,
      activeFinalRounds: 1,
      activeOffers: 0,
    },
    "ADVANCING",
    null,
    direction,
  );

  assert.equal(decision.decision, "Prioritize final-round progression");
  assert.equal(decision.confidence, "HIGH");
});

test("direction-aware recovery decision shifts after setback", () => {
  const direction = {
    direction: "SHIFT" as const,
    rationale: "The current path weakened.",
    evidence: ["Recovery opportunity moved backward."],
    source: "SETBACK" as const,
    confidence: "HIGH" as const,
  };

  const decision = getRecoveryDecision(
    {} as Parameters<typeof getRecoveryDecision>[0],
    "SEARCHING",
    null,
    null,
    "SETBACK",
    null,
    {
      totalApplications: 3,
      activeApplications: 3,
      activeInterviews: 0,
      activeFinalRounds: 0,
      activeOffers: 0,
    },
    direction,
  );

  assert.equal(decision.decision, "Prioritize application conversion");
  assert.equal(decision.confidence, "HIGH");
});

test("direction-aware recovery decision preserves fallback logic for continue", () => {
  const direction = {
    direction: "CONTINUE" as const,
    rationale: "Current direction remains supported.",
    evidence: ["No material directional change."],
    source: "ADVANCEMENT" as const,
    confidence: "MEDIUM" as const,
  };

  const decision = getRecoveryDecision(
    {} as Parameters<typeof getRecoveryDecision>[0],
    "SEARCHING",
    null,
    null,
    "ADVANCING",
    "BUILDING",
    {
      totalApplications: 1,
      activeApplications: 1,
      activeInterviews: 0,
      activeFinalRounds: 0,
      activeOffers: 0,
    },
    direction,
  );

  assert.notEqual(decision.decision, "");
});


test("action-aware recovery direction shifts after negative action effect", () => {
  const direction = getRecoveryDirection(
    "INTERVIEWING",
    "ADVANCING",
    {
      direction: "POSITIVE",
      impact: "MEDIUM",
      implication:
        "The latest outcome supports the current recovery direction and provides evidence to continue execution.",
      evidence: ["Interview progressed before the action feedback was evaluated."],
    },
    {
      pattern: "Meaningful recovery progression is being generated.",
      learning:
        "The current recovery approach is producing evidence of downstream movement. Preserve the direction while continuing execution.",
      evidence: [],
      confidence: "HIGH",
    },
    undefined,
    {
      status: "NEGATIVE",
      headline: "Recovery action produced negative evidence",
      summary:
        "The completed action was followed by a setback signal.",
      evidence: [
        "Action: Send targeted follow-up",
        "Progression: Interview → Rejected",
      ],
      recommendation:
        "Change the approach before repeating the action.",
    },
  );

  assert.equal(direction.direction, "SHIFT");
  assert.equal(direction.source, "SETBACK");
  assert.equal(direction.confidence, "HIGH");
});

test("action-aware recovery direction preserves positive advancement", () => {
  const direction = getRecoveryDirection(
    "FINAL_ROUND",
    "ADVANCING",
    {
      direction: "POSITIVE",
      impact: "MEDIUM",
      implication:
        "The latest outcome supports the current recovery direction and provides evidence to continue execution.",
      evidence: ["Final-round progression was recorded."],
    },
    {
      pattern: "Meaningful recovery progression is being generated.",
      learning:
        "The current recovery approach is producing evidence of downstream movement. Preserve the direction while continuing execution.",
      evidence: [],
      confidence: "HIGH",
    },
    undefined,
    {
      status: "POSITIVE",
      headline: "Recovery action produced positive evidence",
      summary:
        "The completed action was followed by progression.",
      evidence: [
        "Action: Send final-round follow-up",
        "Progression: Final Round → Offer",
      ],
      recommendation:
        "Continue the action pattern while protecting the active opportunity.",
    },
  );

  assert.equal(direction.direction, "INTENSIFY");
  assert.equal(direction.source, "ADVANCEMENT");
});

test("action-aware recovery direction preserves direction with insufficient action evidence", () => {
  const direction = getRecoveryDirection(
    "SEARCHING",
    "NEUTRAL",
    {
      direction: "NEUTRAL",
      impact: "LOW",
      implication:
        "The latest outcome does not provide enough directional evidence to change the current recovery approach.",
      evidence: [],
    },
    {
      pattern: "No material directional recovery pattern is visible.",
      learning:
        "The available outcome evidence is insufficient to establish a new recovery lesson.",
      evidence: [],
      confidence: "LOW",
    },
    undefined,
    {
      status: "UNKNOWN",
      headline: "No completed recovery action to evaluate",
      summary:
        "The system does not yet have a completed recovery action with a usable timestamp to compare against pipeline movement.",
      evidence: [],
      recommendation:
        "Complete a recommended recovery action and track what happens next.",
    },
  );

  assert.equal(direction.direction, "CONTINUE");
  assert.equal(direction.source, "INSUFFICIENT");
  assert.equal(direction.confidence, "LOW");
});



  const baseDecision = {
    decision: "Continue recovery",
    objective: "Maintain recovery momentum.",
    evidence: [],
    constraints: [],
    confidence: "HIGH" as const,
  };

  const baseStrategy = {
    strategy: "Continue the current recovery approach",
    objective: "Maintain recovery momentum.",
    approach: [],
    guardrails: [],
    successSignals: [],
    confidence: "HIGH" as const,
  };

  const basePlan = {
    objective: "Maintain recovery momentum.",
    sequence: ["Prioritize progression"],
    immediateAction: "Prioritize progression",
    supportingActions: [],
    avoidActions: [],
    confidence: "HIGH" as const,
  };

  test("persistence-aware recalibration holds an established direction", () => {
    const result = getRecoveryRecalibration(
      "ADVANCING",
      "Recovery is progressing.",
      baseDecision,
      baseStrategy,
      basePlan,
      [],
      undefined,
      undefined,
      {
        direction: "CONTINUE",
        consecutiveCycles: 3,
        status: "PERSISTING",
        rationale: "The recovery direction is unchanged.",
        confidence: "HIGH",
      },
    );

    assert.equal(result.decisionStatus, "HOLD");
    assert.equal(result.strategyStatus, "HOLD");
    assert.ok(
      result.rationale.includes(
        "Persistence-aware recalibration: hold the current recovery direction because it remains supported across 3 consecutive cycles.",
      ),
    );
  });

  test("persistence-aware recalibration avoids premature reassessment for a new direction", () => {
    const result = getRecoveryRecalibration(
      "ADVANCING",
      "Recovery is progressing.",
      baseDecision,
      baseStrategy,
      basePlan,
      [],
      undefined,
      undefined,
      {
        direction: "CONTINUE",
        consecutiveCycles: 1,
        status: "NEW",
        rationale: "This is a newly established direction.",
        confidence: "HIGH",
      },
    );

    assert.equal(result.decisionStatus, "HOLD");
    assert.equal(result.strategyStatus, "HOLD");
    assert.ok(
      result.rationale.includes(
        "Persistence-aware recalibration: avoid premature reassessment because the current recovery direction has only been established for one cycle.",
      ),
    );
  });

  test("persistence-aware recalibration resets assumptions after directional reset", () => {
    const result = getRecoveryRecalibration(
      "SETBACK",
      "SETBACK",
      {
        ...baseDecision,
        decision: "Reassess recovery",
        objective: "Restore recovery progression.",
      },
      {
        ...baseStrategy,
        strategy: "Reassess the recovery approach",
        objective: "Restore recovery progression.",
      },
      {
        ...basePlan,
        objective: "Restore recovery progression.",
        sequence: ["Rebuild qualified applications/conversations"],
        immediateAction: "Rebuild qualified applications/conversations",
      },
      [],
      undefined,
      undefined,
      {
        direction: "SHIFT",
        consecutiveCycles: 1,
        status: "RESET",
        rationale: "The recovery direction was reset.",
        confidence: "HIGH",
      },
    );

    assert.equal(result.decisionStatus, "REASSESS");
    assert.equal(result.strategyStatus, "REASSESS");
    assert.ok(
      result.rationale.includes(
        "Persistence-aware recalibration: reassess the current recovery direction and discard assumptions carried forward from the previous direction.",
      ),
    );
  });
