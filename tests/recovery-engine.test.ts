import assert from "node:assert/strict";
import test from "node:test";

import {
  getActionMemory,
  getApplicationActionMemory,
  getActions,
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
