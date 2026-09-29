import assert from "node:assert/strict";
import test from "node:test";

import {
  getProgressionSignal,
  getRecoveryOutcome,
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
