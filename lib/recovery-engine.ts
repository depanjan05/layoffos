export type RecoveryState =
  | "JUST_LAID_OFF"
  | "STABILIZING"
  | "SEARCHING"
  | "INTERVIEWING"
  | "FINAL_ROUND"
  | "OFFER"
  | "RECOVERED";

export type RecoveryPriority =
  | "FINANCIAL"
  | "APPLICATIONS"
  | "NETWORKING"
  | "INTERVIEWS"
  | "DIRECTION";

export type RecoveryAction = {
  title: string;
  reason: string;
  href: string;
  priority: RecoveryPriority;
  evidence?: string;
};

export type RecoverySituation = {
  headline: string;
  summary: string;
  risk: string | null;
};

export type RecoveryChange = {
  headline: string;
  summary: string;
  implication: string;
};

export type RecoveryBottleneck = {
  headline: string;
  summary: string;
  focus: string;
};

export type RecoveryReadiness = {
  ready: boolean;
  headline: string;
  summary: string;
  blockers: string[];
  nextState: RecoveryState;
};


export type PipelineHealth = {
  status: "HEALTHY" | "FRAGILE" | "THIN";
  headline: string;
  summary: string;
  depth: number;
  conversion: number | null;
  progression: number | null;
  balance: "BALANCED" | "APPLICATION_HEAVY" | "INTERVIEW_HEAVY" | "OFFER_HEAVY";
  signals: string[];
};


export type RecoveryMomentum = {
  status: "ACCELERATING" | "STEADY" | "STALLING" | "REVERSING";
  headline: string;
  summary: string;
  direction: "FORWARD" | "FLAT" | "BACKWARD";
  recentAdvances: number;
  recentSetbacks: number;
  recentClosures: number;
  signals: string[];
};

export type RecoveryOutcome = {
  status: "POSITIVE" | "MIXED" | "NEGATIVE" | "NONE";
  headline: string;
  summary: string;
  evidence: string[];
  recommendation: string;
};

export type RecoveryRecalibration = {
  needed: boolean;
  headline: string;
  summary: string;
  reason: string;
  nextFocus: RecoveryPriority;
};

export type RecoveryActionEffect = {
  status: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "UNKNOWN";
  headline: string;
  summary: string;
  evidence: string[];
  recommendation: string;
};

export type ActionRecalibration = {
  actionTitle: string | null;
  decision: "REPEAT" | "MODIFY" | "RETIRE" | "HOLD";
  reason: string;
  evidence: string[];
};

export type ActionMemory = {
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

export type RecoveryTransition = {
  nextState: RecoveryState;
  label: string;
  reason: string;
};

export type RecoveryEngineInput = {
  recoveryTiming?: string | null;
  employmentStatus?: string | null;
  careerStage?: string | null;
  targetWorkType?: string | null;
  primaryFocus?: string | null;

  savings?: number;
  severance?: number;
  monthlyExpenses?: number;
  monthlyDebt?: number;
  otherIncome?: number;
  benefits?: number;
  upcomingExpenses?: number;

  applications?: Array<{
    stage?: string | null;
    company?: string | null;
    role?: string | null;
  }>;

  interviews?: Array<{
    stage?: string | null;
    company?: string | null;
    role?: string | null;
    interviewDate?: string | null;
    followUpDate?: string | null;
    nextAction?: string | null;
  }>;

  companies?: Array<{
    status?: string | null;
    priority?: string | null;
  }>;

  networkContacts?: Array<{
    name?: string | null;
    company?: string | null;
    role?: string | null;
    status?: string | null;
    lastContacted?: string | null;
    nextAction?: string | null;
    linkedApplicationId?: string | null;
  }>;

  completedActions?: Array<{
    title?: string | null;
    href?: string | null;
    completedAt?: string | null;
  }>;

  progressionEvents?: Array<{
    eventType?: string | null;
    entityType?: string | null;
    occurredAt?: string | null;
    metadata?: Record<string, unknown> | null;
  }>;

  applicationActionEvents?: Array<{
    applicationId?: string | null;
    company?: string | null;
    role?: string | null;
    action?: string | null;
    dueDate?: string | null;
    completedAt?: string | null;
  }>;

  weeklyPlanTaskEvents?: Array<{
    weeklyPlanId?: string | null;
    taskId?: string | null;
    title?: string | null;
    category?: string | null;
    href?: string | null;
    completedAt?: string | null;
  }>;
};

export type RecentProgression = {
  type: "application" | "interview";
  company: string;
  role: string;
  previousStage: string;
  newStage: string;
  occurredAt: string | null;
};


export type WeeklyPlanTaskEffect = {
  status: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "UNKNOWN";
  headline: string;
  summary: string;
  evidence: string[];
  recommendation: string;
  taskId: string | null;
  title: string | null;
  category: string | null;
  completedAt: string | null;
  progression: RecentProgression | null;
};

function getWeeklyPlanTaskEffect(
  weeklyPlanTaskEvents: RecoveryEngineInput["weeklyPlanTaskEvents"],
  progressionEvents: RecoveryEngineInput["progressionEvents"],
): WeeklyPlanTaskEffect {
  const completedTasks = (weeklyPlanTaskEvents ?? [])
    .filter(
      (task) =>
        typeof task.title === "string" &&
        task.title.length > 0 &&
        typeof task.completedAt === "string" &&
        task.completedAt.length > 0,
    )
    .sort((a, b) => {
      const aTime = new Date(a.completedAt as string).getTime();
      const bTime = new Date(b.completedAt as string).getTime();
      return bTime - aTime;
    });

  const latestTask = completedTasks[0];

  if (!latestTask) {
    return {
      status: "UNKNOWN",
      headline: "No weekly plan execution outcome yet",
      summary:
        "Complete a weekly recovery task and the engine will look for subsequent pipeline movement.",
      evidence: [],
      recommendation: "Complete a tracked weekly recovery task.",
      taskId: null,
      title: null,
      category: null,
      completedAt: null,
      progression: null,
    };
  }

  const completedAt = new Date(latestTask.completedAt as string);
  const fourteenDaysLater = new Date(completedAt);
  fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);

  const relevantEntityType =
    latestTask.href === "/job-search"
      ? "application_progression"
      : latestTask.href === "/interviews"
        ? "interview_progression"
        : null;

  const relatedProgression = relevantEntityType
    ? (progressionEvents ?? [])
        .filter(
          (event) => event.entityType === relevantEntityType
        )
        .map((event) => {
          const metadata = event.metadata ?? {};
          const occurredAt = event.occurredAt ?? null;

          return {
            event,
            occurredAt,
            company:
              typeof metadata.company === "string"
                ? metadata.company
                : "",
            role:
              typeof metadata.role === "string"
                ? metadata.role
                : "",
            previousStage:
              typeof metadata.previousStage === "string"
                ? metadata.previousStage
                : "",
            newStage:
              typeof metadata.newStage === "string"
                ? metadata.newStage
                : "",
          };
        })
        .filter((item) => {
          if (!item.occurredAt) return false;

          const occurredAt = new Date(item.occurredAt);

          return (
            occurredAt > completedAt &&
            occurredAt <= fourteenDaysLater
          );
        })
        .sort(
          (a, b) =>
            new Date(a.occurredAt as string).getTime() -
            new Date(b.occurredAt as string).getTime(),
        )
    : [];

  const progression = relatedProgression[0];

  if (!progression) {
    return {
      status: "UNKNOWN",
      headline: "No pipeline movement followed the weekly plan task",
      summary:
        "The completed plan task has no tracked application or interview stage change within 14 days.",
      evidence: [
        `Completed: ${latestTask.title}`,
        "No subsequent progression event was recorded within 14 days.",
      ],
      recommendation:
        "Hold this execution pattern until more outcome data is available.",
      taskId: latestTask.taskId ?? null,
      title: latestTask.title ?? null,
      category: latestTask.category ?? null,
      completedAt: latestTask.completedAt ?? null,
      progression: null,
    };
  }

  const recentProgression: RecentProgression = {
    type:
      progression.event.entityType === "interview_progression"
        ? "interview"
        : "application",
    company: progression.company,
    role: progression.role,
    previousStage: progression.previousStage,
    newStage: progression.newStage,
    occurredAt: progression.occurredAt,
  };

  const signal = getProgressionSignal(recentProgression);

  if (signal === "ADVANCING") {
    return {
      status: "POSITIVE",
      headline: "Weekly plan task was followed by progression",
      summary:
        "A tracked application or interview stage advanced after the completed recovery-plan task.",
      evidence: [
        `Completed: ${latestTask.title}`,
        `${recentProgression.previousStage} → ${recentProgression.newStage}`,
        "Progression occurred within 14 days of task completion.",
      ],
      recommendation:
        "Repeat this plan execution pattern while continuing to measure downstream outcomes.",
      taskId: latestTask.taskId ?? null,
      title: latestTask.title ?? null,
      category: latestTask.category ?? null,
      completedAt: latestTask.completedAt ?? null,
      progression: recentProgression,
    };
  }

  if (signal === "SETBACK" || signal === "CLOSED") {
    return {
      status: "NEGATIVE",
      headline: "Weekly plan task was followed by a setback",
      summary:
        "A tracked pipeline setback followed the completed recovery-plan task.",
      evidence: [
        `Completed: ${latestTask.title}`,
        `${recentProgression.previousStage} → ${recentProgression.newStage}`,
        "The setback occurred within 14 days of task completion.",
      ],
      recommendation:
        "Modify the execution pattern and continue gathering downstream evidence.",
      taskId: latestTask.taskId ?? null,
      title: latestTask.title ?? null,
      category: latestTask.category ?? null,
      completedAt: latestTask.completedAt ?? null,
      progression: recentProgression,
    };
  }

  return {
    status: "NEUTRAL",
    headline: "Weekly plan task was followed by pipeline movement",
    summary:
      "A tracked pipeline stage changed after the completed recovery-plan task, but the movement was not clearly directional.",
    evidence: [
      `Completed: ${latestTask.title}`,
      `${recentProgression.previousStage} → ${recentProgression.newStage}`,
      "Progression occurred within 14 days of task completion.",
    ],
    recommendation:
      "Hold the execution pattern while more outcome data accumulates.",
    taskId: latestTask.taskId ?? null,
    title: latestTask.title ?? null,
    category: latestTask.category ?? null,
    completedAt: latestTask.completedAt ?? null,
    progression: recentProgression,
  };
}

type ProgressionSignal =
  | "ADVANCING"
  | "SETBACK"
  | "CLOSED"
  | "NEUTRAL";

export type PipelineSignal =
  | "OFFER_STAGE"
  | "SETBACK"
  | "BUILDING"
  | "ACTIVE"
  | "THIN";

export type PipelineComposition = {
  totalApplications: number;
  activeApplications: number;
  activeInterviews: number;
  finalRounds: number;
  offers: number;
  applicationOffers: number;
  interviewOffers: number;
  acceptedOffers: number;
  activeNetworkContacts: number;
};


function getActionMemory(
  completedActions: RecoveryEngineInput["completedActions"] = [],
  progressionEvents: RecoveryEngineInput["progressionEvents"] = [],
): ActionMemory {
  const actions = completedActions
    .filter(
      (action) =>
        typeof action.title === "string" &&
        typeof action.completedAt === "string",
    )
    .map((action) => ({
      ...action,
      timestamp: new Date(action.completedAt as string).getTime(),
    }))
    .filter((action) => Number.isFinite(action.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);

  const progressions = progressionEvents
    .filter(
      (event) =>
        (event.eventType === "application_progression" ||
          event.eventType === "interview_progression") &&
        typeof event.occurredAt === "string",
    )
    .map((event) => ({
      event,
      timestamp: new Date(event.occurredAt as string).getTime(),
    }))
    .filter((item) => Number.isFinite(item.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (actions.length === 0) {
    return {
      actionTitle: null,
      instances: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      unknown: 0,
      positiveRate: null,
      negativeRate: null,
      confidence: "LOW",
      recommendation: "HOLD",
      evidence: [],
    };
  }

  const targetTitle = actions[actions.length - 1].title as string;

  const matchingActions = actions.filter(
    (action) => action.title === targetTitle,
  );

  const counts = {
    positive: 0,
    negative: 0,
    neutral: 0,
    unknown: 0,
  };

  const matchedEvidence: string[] = [];

  for (let i = 0; i < matchingActions.length; i += 1) {
    const action = matchingActions[i];

    const nextActionTime =
      i < matchingActions.length - 1
        ? matchingActions[i + 1].timestamp
        : Infinity;

    const related = progressions.find(
      (item) =>
        item.timestamp >= action.timestamp &&
        item.timestamp < nextActionTime &&
        item.timestamp <=
          action.timestamp + 14 * 24 * 60 * 60 * 1000,
    );

    if (!related) {
      counts.unknown += 1;
      continue;
    }

    const metadata = related.event.metadata ?? {};

    const previousStage =
      typeof metadata.previousStage === "string"
        ? metadata.previousStage
        : "previous stage";

    const newStage =
      typeof metadata.newStage === "string"
        ? metadata.newStage
        : "new stage";

    const company =
      typeof metadata.company === "string"
        ? metadata.company
        : "the company";

    const role =
      typeof metadata.role === "string"
        ? metadata.role
        : "the role";

    const signal = getProgressionSignal({
      type:
        related.event.eventType === "application_progression"
          ? "application"
          : "interview",
      company,
      role,
      previousStage,
      newStage,
      occurredAt: related.event.occurredAt ?? null,
    });

    if (signal === "ADVANCING") {
      counts.positive += 1;
    } else if (signal === "SETBACK" || signal === "CLOSED") {
      counts.negative += 1;
    } else {
      counts.neutral += 1;
    }

    if (matchedEvidence.length < 5) {
      matchedEvidence.push(
        `${targetTitle}: ${previousStage} → ${newStage} at ${company}`,
      );
    }
  }

  const instances =
    counts.positive +
    counts.negative +
    counts.neutral;

  const positiveRate =
    instances > 0 ? counts.positive / instances : null;

  const negativeRate =
    instances > 0 ? counts.negative / instances : null;

  let confidence: ActionMemory["confidence"] = "LOW";

  if (instances >= 5) {
    confidence = "HIGH";
  } else if (instances >= 3) {
    confidence = "MEDIUM";
  }

  let recommendation: ActionMemory["recommendation"] = "HOLD";

  if (instances >= 3) {
    if (
      counts.positive >= 2 &&
      (positiveRate ?? 0) >= 0.67
    ) {
      recommendation = "REPEAT";
    } else if (
      counts.negative >= 2 &&
      (negativeRate ?? 0) >= 0.67
    ) {
      recommendation = "RETIRE";
    } else if (
      counts.positive > 0 &&
      counts.negative > 0
    ) {
      recommendation = "MODIFY";
    }
  }

  const evidence = [
    `Action: ${targetTitle}`,
    `Tracked instances: ${matchingActions.length}`,
    `Evaluated instances: ${instances}`,
    `Positive: ${counts.positive}`,
    `Negative: ${counts.negative}`,
    `Neutral: ${counts.neutral}`,
    `Unknown: ${counts.unknown}`,
    ...matchedEvidence,
  ];

  return {
    actionTitle: targetTitle,
    instances,
    positive: counts.positive,
    negative: counts.negative,
    neutral: counts.neutral,
    unknown: counts.unknown,
    positiveRate,
    negativeRate,
    confidence,
    recommendation,
    evidence,
  };
}

function getRecoveryActionEffect(
  completedActions: RecoveryEngineInput["completedActions"] = [],
  progressionEvents: RecoveryEngineInput["progressionEvents"] = [],
): RecoveryActionEffect {
  const completed = completedActions
    .filter(
      (action) =>
        typeof action.title === "string" &&
        typeof action.completedAt === "string",
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt as string).getTime() -
        new Date(a.completedAt as string).getTime(),
    );

  if (completed.length === 0) {
    return {
      status: "UNKNOWN",
      headline: "No completed recovery action to evaluate",
      summary:
        "The system does not yet have a completed recovery action with a usable timestamp to compare against pipeline movement.",
      evidence: [],
      recommendation: "Complete a recommended recovery action and track what happens next.",
    };
  }

  const latestAction = completed[0];
  const actionTime = new Date(latestAction.completedAt as string).getTime();

  if (!Number.isFinite(actionTime)) {
    return {
      status: "UNKNOWN",
      headline: "Action timing is unavailable",
      summary:
        "A completed recovery action exists, but its timestamp cannot be used reliably for temporal comparison.",
      evidence: [latestAction.title as string],
      recommendation: "Continue completing tracked actions so future outcomes can be evaluated.",
    };
  }

  const relatedProgressions = progressionEvents
    .filter(
      (event) =>
        (event.eventType === "application_progression" ||
          event.eventType === "interview_progression") &&
        typeof event.occurredAt === "string",
    )
    .map((event) => ({
      event,
      timestamp: new Date(event.occurredAt as string).getTime(),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.timestamp) &&
        item.timestamp >= actionTime &&
        item.timestamp <= actionTime + 14 * 24 * 60 * 60 * 1000,
    )
    .sort((a, b) => a.timestamp - b.timestamp);

  if (relatedProgressions.length === 0) {
    return {
      status: "UNKNOWN",
      headline: "No pipeline change followed the action yet",
      summary:
        "The latest completed action has not been followed by a recorded application or interview progression within the evaluation window.",
      evidence: [
        `Completed: ${latestAction.title}`,
        `Completed at: ${latestAction.completedAt}`,
      ],
      recommendation:
        "Hold the action for now and continue tracking pipeline movement before changing the recommendation.",
    };
  }

  const progression = relatedProgressions[0].event;
  const metadata = progression.metadata ?? {};
  const previousStage =
    typeof metadata.previousStage === "string"
      ? metadata.previousStage
      : "previous stage";
  const newStage =
    typeof metadata.newStage === "string"
      ? metadata.newStage
      : "new stage";
  const company =
    typeof metadata.company === "string" ? metadata.company : "the company";
  const role =
    typeof metadata.role === "string" ? metadata.role : "the role";

  const signal = getProgressionSignal({
    type:
      progression.eventType === "application_progression"
        ? "application"
        : "interview",
    company,
    role,
    previousStage,
    newStage,
    occurredAt: progression.occurredAt ?? null,
  });

  if (signal === "ADVANCING") {
    return {
      status: "POSITIVE",
      headline: "Action was followed by pipeline progression",
      summary:
        `The completed action was followed by ${company} moving ${role} from ${previousStage} to ${newStage}. This is a positive temporal signal, not proof of causation.`,
      evidence: [
        `Action: ${latestAction.title}`,
        `Completed: ${latestAction.completedAt}`,
        `Progression: ${previousStage} → ${newStage}`,
        `Company: ${company}`,
      ],
      recommendation:
        "Repeat this type of action when the same recovery situation appears again.",
    };
  }

  if (signal === "SETBACK" || signal === "CLOSED") {
    return {
      status: "NEGATIVE",
      headline: "Action was followed by a pipeline setback",
      summary:
        `The completed action was followed by ${company} moving ${role} from ${previousStage} to ${newStage}. This is a negative temporal signal, not proof that the action caused the setback.`,
      evidence: [
        `Action: ${latestAction.title}`,
        `Completed: ${latestAction.completedAt}`,
        `Progression: ${previousStage} → ${newStage}`,
        `Company: ${company}`,
      ],
      recommendation:
        "Modify the action or its execution before repeating it in the same situation.",
    };
  }

  return {
    status: "NEUTRAL",
    headline: "Action was followed by a neutral pipeline change",
    summary:
      `The completed action was followed by a recorded change from ${previousStage} to ${newStage}, but the change does not provide a strong positive or negative signal.`,
    evidence: [
      `Action: ${latestAction.title}`,
      `Completed: ${latestAction.completedAt}`,
      `Progression: ${previousStage} → ${newStage}`,
      `Company: ${company}`,
    ],
    recommendation:
      "Hold the action and collect more evidence before changing the recommendation.",
  };
}

function getActionRecalibration(
  effect: RecoveryActionEffect,
): ActionRecalibration {
  const actionTitle =
    effect.evidence
      .find((item) => item.startsWith("Action: "))
      ?.replace("Action: ", "") ?? null;

  if (effect.status === "POSITIVE") {
    return {
      actionTitle,
      decision: "REPEAT",
      reason:
        "The action was followed by a positive progression signal, so it should remain in the recovery playbook.",
      evidence: effect.evidence,
    };
  }

  if (effect.status === "NEGATIVE") {
    return {
      actionTitle,
      decision: "MODIFY",
      reason:
        "The action was followed by a setback signal. The evidence supports changing the approach rather than automatically repeating it.",
      evidence: effect.evidence,
    };
  }

  if (effect.status === "NEUTRAL") {
    return {
      actionTitle,
      decision: "HOLD",
      reason:
        "The available progression signal is not strong enough to justify repeating or retiring the action.",
      evidence: effect.evidence,
    };
  }

  return {
    actionTitle,
    decision: "HOLD",
    reason:
      "There is not yet enough temporal evidence to determine whether the completed action should be repeated, modified, or retired.",
    evidence: effect.evidence,
  };
}

export type RecoveryEngineResult = {
  state: RecoveryState;
  applicationActionEvents: RecoveryEngineInput["applicationActionEvents"];
  applicationActionEffect: ApplicationActionEffect;
  applicationActionRecalibration: ApplicationActionRecalibration;
  applicationActionMemory: ApplicationActionMemory;
  stateLabel: string;
  stateReason: string;
  runwayMonths: number | null;
  pipelineHealth: PipelineHealth;
  momentum: RecoveryMomentum;
  outcome: RecoveryOutcome;
  recalibration: RecoveryRecalibration;
  actionEffect: RecoveryActionEffect;
  actionRecalibration: ActionRecalibration;
  actionMemory: ActionMemory;
  weeklyPlanTaskEffect: WeeklyPlanTaskEffect;
  priorities: RecoveryPriority[];
  actions: RecoveryAction[];
  transition: RecoveryTransition;
  recentProgression: RecentProgression | null;
  pipelineSignal: PipelineSignal;
  pipelineComposition: PipelineComposition;
  situation: RecoverySituation;
  change: RecoveryChange | null;
  bottleneck: RecoveryBottleneck;
  readiness: RecoveryReadiness;
};

function normalize(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function calculateRunway(input: RecoveryEngineInput) {
  const availableCash =
    (input.savings ?? 0) +
    (input.severance ?? 0) -
    (input.upcomingExpenses ?? 0);

  const monthlyInflow =
    (input.otherIncome ?? 0) +
    (input.benefits ?? 0);

  const monthlyOutflow =
    (input.monthlyExpenses ?? 0) +
    (input.monthlyDebt ?? 0);

  const monthlyBurn = Math.max(0, monthlyOutflow - monthlyInflow);

  if (monthlyBurn <= 0) {
    return null;
  }

  return Math.max(0, availableCash / monthlyBurn);
}

function getState(input: RecoveryEngineInput): RecoveryState {
  const employmentStatus = normalize(input.employmentStatus);
  const careerStage = normalize(input.careerStage);
  const recoveryTiming = normalize(input.recoveryTiming);

  const activeApplications = (input.applications ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const activeInterviews = (input.interviews ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const hasRecoveredEmployment =
    employmentStatus === "employed" ||
    employmentStatus === "recovered" ||
    careerStage === "employed" ||
    careerStage === "recovered";

  if (hasRecoveredEmployment) {
    return "RECOVERED";
  }

  const hasOffer =
    careerStage === "offer" ||
    careerStage === "offers" ||
    activeInterviews.some((item) => {
      const stage = normalize(item.stage);
      return stage === "offer" || stage === "accepted";
    });

  if (hasOffer) {
    return "OFFER";
  }

  const hasFinalRound =
    careerStage === "finals" ||
    activeInterviews.some(
      (item) => normalize(item.stage) === "final"
    );

  if (hasFinalRound) {
    return "FINAL_ROUND";
  }

  if (
    activeInterviews.length > 0 ||
    careerStage === "interviews"
  ) {
    return "INTERVIEWING";
  }

  if (
    activeApplications.length > 0 ||
    careerStage === "applying"
  ) {
    return "SEARCHING";
  }

  if (
    recoveryTiming === "this week" ||
    recoveryTiming === "week"
  ) {
    return "JUST_LAID_OFF";
  }

  return "STABILIZING";
}

function getStateLabel(state: RecoveryState) {
  const labels: Record<RecoveryState, string> = {
    JUST_LAID_OFF: "Just laid off",
    STABILIZING: "Stabilizing",
    SEARCHING: "Searching",
    INTERVIEWING: "Interviewing",
    FINAL_ROUND: "Final round",
    OFFER: "Offer",
    RECOVERED: "Recovered",
  };

  return labels[state];
}

function getStateReason(
  input: RecoveryEngineInput,
  state: RecoveryState
) {
  const activeApplications = (input.applications ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const activeInterviews = (input.interviews ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  switch (state) {
    case "JUST_LAID_OFF":
      return "Your recovery timing indicates a recent layoff and the immediate stabilization workflow is the next step.";

    case "STABILIZING":
      return "There is not yet enough active job-search evidence to place you further into the recovery pipeline.";

    case "SEARCHING":
      return `${activeApplications.length} active application${activeApplications.length === 1 ? "" : "s"} indicate that your recovery is in active job search mode.`;

    case "INTERVIEWING":
      return `${activeInterviews.length} active interview${activeInterviews.length === 1 ? "" : "s"} indicate that opportunities have moved beyond the application stage.`;

    case "FINAL_ROUND":
      return "At least one active interview has reached the final round, making execution and follow-up time-sensitive.";

    case "OFFER":
      return "An active interview or career-stage record indicates that an offer-stage decision is in progress.";

    case "RECOVERED":
      return "Your employment status or career stage indicates that employment has resumed.";
  }
}

function getTransition(
  input: RecoveryEngineInput,
  state: RecoveryState
): RecoveryTransition {
  const activeApplications = (input.applications ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const activeInterviews = (input.interviews ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  switch (state) {
    case "JUST_LAID_OFF":
      return {
        nextState: "STABILIZING",
        label: "Stabilize",
        reason:
          "Complete the immediate post-layoff workflow and establish your financial and weekly recovery baseline.",
      };

    case "STABILIZING":
      return {
        nextState: "SEARCHING",
        label: "Start searching",
        reason:
          "Move into active search once you have target opportunities or applications in motion.",
      };

    case "SEARCHING":
      return {
        nextState: "INTERVIEWING",
        label: "Reach interviews",
        reason:
          `${activeApplications.length} active application${activeApplications.length === 1 ? "" : "s"} are currently in the pipeline. The next meaningful transition is an interview.`,
      };

    case "INTERVIEWING":
      return {
        nextState: "FINAL_ROUND",
        label: "Reach final round",
        reason:
          `${activeInterviews.length} active interview${activeInterviews.length === 1 ? "" : "s"} are in progress. The next meaningful transition is a final-round opportunity.`,
      };

    case "FINAL_ROUND":
      return {
        nextState: "OFFER",
        label: "Reach offer",
        reason:
          "The current priority is converting the final-round opportunity into an offer-stage decision.",
      };

    case "OFFER":
      return {
        nextState: "RECOVERED",
        label: "Return to employment",
        reason:
          "The recovery cycle closes when an offer is accepted and employment status is updated.",
      };

    case "RECOVERED":
      return {
        nextState: "RECOVERED",
        label: "Maintain recovery",
        reason:
          "Employment has resumed, so the system shifts from job-search execution to maintaining the recovered state.",
      };
  }
}

function getPriorities(
  input: RecoveryEngineInput,
  state: RecoveryState,
  runwayMonths: number | null,
  pipelineSignal: PipelineSignal
): RecoveryPriority[] {
  const priorities: RecoveryPriority[] = [];

  if (pipelineSignal === "OFFER_STAGE") {
    priorities.push("INTERVIEWS", "FINANCIAL");
  } else if (
    pipelineSignal === "SETBACK" ||
    pipelineSignal === "BUILDING" ||
    pipelineSignal === "THIN"
  ) {
    priorities.push("APPLICATIONS", "NETWORKING");
  }

  if (runwayMonths !== null && runwayMonths < 4) {
    priorities.push("FINANCIAL");
  }

  if (
    state === "JUST_LAID_OFF" ||
    state === "STABILIZING"
  ) {
    priorities.push("DIRECTION");
  }

  if (
    state === "SEARCHING" ||
    state === "STABILIZING"
  ) {
    priorities.push("APPLICATIONS", "NETWORKING");
  }

  if (
    state === "INTERVIEWING" ||
    state === "FINAL_ROUND"
  ) {
    priorities.push("INTERVIEWS", "NETWORKING");
  }

  if (state === "OFFER") {
    priorities.push("INTERVIEWS", "FINANCIAL");
  }

  if (state === "RECOVERED") {
    priorities.push("DIRECTION", "FINANCIAL");
  }

  const focus = normalize(input.primaryFocus);

  if (focus.includes("financial")) {
    priorities.unshift("FINANCIAL");
  } else if (focus.includes("network")) {
    priorities.unshift("NETWORKING");
  } else if (focus.includes("interview")) {
    priorities.unshift("INTERVIEWS");
  } else if (focus.includes("application")) {
    priorities.unshift("APPLICATIONS");
  }

  const unique = Array.from(new Set(priorities));

  const fallback: RecoveryPriority[] = [
    "APPLICATIONS",
    "NETWORKING",
    "FINANCIAL",
    "INTERVIEWS",
    "DIRECTION",
  ];

  for (const priority of fallback) {
    if (!unique.includes(priority)) {
      unique.push(priority);
    }
  }

  return unique.slice(0, 3);
}

function getRecoverySituation(
  input: RecoveryEngineInput,
  state: RecoveryState,
  runwayMonths: number | null,
  pipelineSignal: PipelineSignal,
  pipelineComposition: PipelineComposition,
  recentProgression: RecentProgression | null
): RecoverySituation {
  const criticalRunway =
    runwayMonths !== null && runwayMonths < 2;

  if (criticalRunway) {
    const runwayText = `${runwayMonths.toFixed(1)} months of estimated runway`;

    if (pipelineComposition.acceptedOffers > 0) {
      return {
        headline: "You have an accepted offer with critical runway pressure.",
        summary:
          "Your recovery pipeline has reached an accepted offer, but the remaining financial runway still needs active attention until employment resumes.",
        risk: `Your current runway is ${runwayText}.`,
      };
    }

    if (pipelineComposition.offers > 0) {
      return {
        headline: "You have an active offer with critical runway pressure.",
        summary:
          "An offer-stage opportunity is active, but the financial runway remains short while the decision is unresolved.",
        risk: `Your current runway is ${runwayText}.`,
      };
    }

    if (pipelineComposition.finalRounds > 0) {
      return {
        headline: "You are in a final round with critical runway pressure.",
        summary:
          "A final-round opportunity is active, so execution matters while financial runway remains constrained.",
        risk: `Your current runway is ${runwayText}.`,
      };
    }

    if (pipelineComposition.activeInterviews > 0) {
      return {
        headline: "You have active interviews with critical runway pressure.",
        summary:
          "Interview opportunities are moving, but financial runway needs attention alongside interview execution.",
        risk: `Your current runway is ${runwayText}.`,
      };
    }

    return {
      headline: "Your financial runway is critically short.",
      summary:
        "The immediate recovery priority is to keep the job search moving while making financial decisions with a very limited runway.",
      risk: `Your current runway is ${runwayText}.`,
    };
  }

  if (pipelineComposition.acceptedOffers > 0) {
    return {
      headline: "You have an accepted offer in the pipeline.",
      summary:
        "The recovery process has reached an accepted offer. The remaining work is to confirm the transition details and update employment status when it resumes.",
      risk: null,
    };
  }

  if (pipelineSignal === "OFFER_STAGE" || pipelineComposition.offers > 0) {
    return {
      headline: "You have an active offer-stage opportunity.",
      summary:
        "The recovery pipeline has reached a decision point where compensation, timing, and the next step need to stay explicit.",
      risk: "The opportunity is not yet fully resolved.",
    };
  }

  if (pipelineComposition.finalRounds > 0 || state === "FINAL_ROUND") {
    return {
      headline: "You are in a final-round recovery stage.",
      summary:
        "At least one opportunity has reached the final round, so preparation, logistics, and follow-up are now time-sensitive.",
      risk: null,
    };
  }

  if (pipelineSignal === "SETBACK") {
    const company = recentProgression?.company;

    return {
      headline: "A recent opportunity has closed or been rejected.",
      summary: company
        ? `${company} moved out of the active pipeline. The next step is to capture the signal and replace the lost opportunity.`
        : "A recent opportunity moved out of the active pipeline. The next step is to capture the signal and replace the lost opportunity.",
      risk: "Pipeline capacity was lost and needs to be rebuilt.",
    };
  }

  if (pipelineComposition.activeInterviews > 0 || state === "INTERVIEWING") {
    return {
      headline: "You have an active interview pipeline.",
      summary:
        `${pipelineComposition.activeInterviews} active interview${pipelineComposition.activeInterviews === 1 ? "" : "s"} ${pipelineComposition.activeInterviews === 1 ? "is" : "are"} in progress. The next meaningful transition is a final-round opportunity.`,
      risk: null,
    };
  }

  if (pipelineComposition.activeApplications > 0 || state === "SEARCHING") {
    return {
      headline: "You are in active job search mode.",
      summary:
        `${pipelineComposition.activeApplications} active application${pipelineComposition.activeApplications === 1 ? "" : "s"} ${pipelineComposition.activeApplications === 1 ? "is" : "are"} currently in the pipeline.`,
      risk:
        pipelineSignal === "THIN"
          ? "The active opportunity pipeline is still relatively thin."
          : null,
    };
  }

  if (state === "JUST_LAID_OFF") {
    return {
      headline: "You are in the immediate post-layoff stage.",
      summary:
        "The immediate priority is stabilization: establish your financial baseline, complete the first recovery steps, and create a manageable operating rhythm.",
      risk: null,
    };
  }

  return {
    headline: "You are stabilizing your recovery.",
    summary:
      "There is not yet enough active opportunity evidence to place you further into the recovery pipeline.",
    risk: null,
  };
}

function getActionEvidence(
  input: RecoveryEngineInput,
  action: RecoveryAction,
  state: RecoveryState,
  runwayMonths: number | null
) {
  const activeApplications = (input.applications ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const activeInterviews = (input.interviews ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const finalInterviews = activeInterviews.filter(
    (item) => normalize(item.stage) === "final"
  );

  const offerInterviews = activeInterviews.filter((item) => {
    const stage = normalize(item.stage);
    return stage === "offer" || stage === "accepted";
  });

  const activeNetworkContacts = (input.networkContacts ?? []).filter(
    (item) => {
      const status = normalize(item.status);

      return (
        status !== "inactive" &&
        status !== "closed" &&
        status !== "rejected"
      );
    }
  );

  const networkFollowUps = activeNetworkContacts.filter(
    (item) => Boolean(item.nextAction)
  );

  if (action.href === "/runway" && runwayMonths !== null) {
    return `${runwayMonths.toFixed(1)} months of estimated runway`;
  }

  if (action.href === "/interviews") {
    if (
      state === "FINAL_ROUND" &&
      finalInterviews.length > 0 &&
      action.title.toLowerCase().includes("follow-up")
    ) {
      const followUpCount = finalInterviews.filter(
        (item) => Boolean(item.followUpDate) || Boolean(item.nextAction)
      ).length;

      return `${followUpCount} final-round interview${
        followUpCount === 1 ? "" : "s"
      } with a follow-up or next action`;
    }

    if (state === "FINAL_ROUND" && finalInterviews.length > 0) {
      return `${finalInterviews.length} active final-round interview${
        finalInterviews.length === 1 ? "" : "s"
      }`;
    }

    if (offerInterviews.length > 0) {
      return `${offerInterviews.length} active offer-stage interview${
        offerInterviews.length === 1 ? "" : "s"
      }`;
    }

    if (activeInterviews.length > 0) {
      return `${activeInterviews.length} active interview${
        activeInterviews.length === 1 ? "" : "s"
      }`;
    }

    return "No active interview records yet";
  }

  if (action.href === "/job-search") {
    if (activeApplications.length > 0) {
      return `${activeApplications.length} active application${
        activeApplications.length === 1 ? "" : "s"
      }`;
    }

    return "No active applications yet";
  }

  if (action.href === "/networking") {
    if (networkFollowUps.length > 0) {
      return `${networkFollowUps.length} network follow-up${
        networkFollowUps.length === 1 ? "" : "s"
      } recorded`;
    }

    if (activeNetworkContacts.length > 0) {
      return `${activeNetworkContacts.length} active network contact${
        activeNetworkContacts.length === 1 ? "" : "s"
      }`;
    }

    return "No active network contacts yet";
  }

  if (action.href === "/companies") {
    const targetCompanies = (input.companies ?? []).filter((item) => {
      const status = normalize(item.status);

      return (
        status !== "rejected" &&
        status !== "closed" &&
        status !== "inactive"
      );
    });

    if (targetCompanies.length > 0) {
      return `${targetCompanies.length} active target compan${
        targetCompanies.length === 1 ? "y" : "ies"
      }`;
    }

    return "No active target companies yet";
  }

  if (action.href === "/first-72-hours") {
    return "Immediate post-layoff recovery workflow";
  }

  if (action.href === "/plan") {
    return "Current weekly recovery plan";
  }

  if (state === "RECOVERED") {
    return "Employment status indicates recovery";
  }

  return undefined;
}

function getActions(
  input: RecoveryEngineInput,
  state: RecoveryState,
  runwayMonths: number | null,
  recentProgression: RecentProgression | null,
  progressionSignal: ProgressionSignal,
  pipelineSignal: PipelineSignal,
  pipelineComposition: PipelineComposition
): RecoveryAction[] {
  const actions: RecoveryAction[] = [];

  if (recentProgression && progressionSignal !== "NEUTRAL") {
    if (
      progressionSignal === "ADVANCING" &&
      normalize(recentProgression.newStage) === "interview" &&
      state === "INTERVIEWING"
    ) {
      actions.push({
        title: "Prepare for your next interview",
        reason:
          `${recentProgression.company} moved from ${recentProgression.previousStage} to ${recentProgression.newStage}. Prepare while the opportunity is active.`,
        href: "/interviews",
        priority: "INTERVIEWS",
      });
    }

    if (
      progressionSignal === "ADVANCING" &&
      normalize(recentProgression.newStage) === "final" &&
      state === "FINAL_ROUND"
    ) {
      actions.push({
        title: "Prepare your final-round talking points",
        reason:
          `${recentProgression.company} moved into the final round. Preparation and follow-up are now time-sensitive.`,
        href: "/interviews",
        priority: "INTERVIEWS",
      });
    }

    if (progressionSignal === "SETBACK") {
      actions.push({
        title: "Review what changed in the closed opportunity",
        reason:
          `${recentProgression.company} moved to Rejected. Capture the useful signal from the setback before replacing the lost opportunity.`,
        href: recentProgression.type === "interview"
          ? "/interviews"
          : "/job-search",
        priority: "APPLICATIONS",
      });
    }

    if (progressionSignal === "CLOSED") {
      actions.push({
        title: "Review your active opportunity pipeline",
        reason:
          `${recentProgression.company} was marked Withdrawn. Focus the recovery plan on opportunities that are still active.`,
        href: recentProgression.type === "interview"
          ? "/interviews"
          : "/job-search",
        priority: "APPLICATIONS",
      });
    }
  }

  const activeApplications = (input.applications ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const activeInterviews = (input.interviews ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const interviewsNeedingAttention = activeInterviews.filter(
    (item) =>
      Boolean(item.followUpDate) ||
      Boolean(item.nextAction)
  );

  const activeNetworkContacts = (input.networkContacts ?? []).filter(
    (item) => {
      const status = normalize(item.status);

      return (
        status !== "inactive" &&
        status !== "closed" &&
        status !== "rejected"
      );
    }
  );

  const activeNetworkFollowUps = activeNetworkContacts.filter(
    (item) => Boolean(item.nextAction)
  );

  const hasActiveApplications = activeApplications.length > 0;
  const hasActiveInterviews = activeInterviews.length > 0;

  // v1.9.1: use pipeline composition to make recommendations more precise.
  if (pipelineSignal === "OFFER_STAGE") {
    if (pipelineComposition.acceptedOffers > 0) {
      actions.push({
        title: "Confirm your accepted offer details",
        reason:
          "An accepted offer is already in the pipeline. Focus on the concrete details that turn the accepted opportunity into a completed transition.",
        href: "/interviews",
        priority: "INTERVIEWS",
      });
    } else if (pipelineComposition.offers > 0) {
      actions.push({
        title: "Review your active offer",
        reason:
          "An offer is active but has not yet been accepted. Review the decision, compensation, and next-step details before treating the opportunity as closed.",
        href: "/interviews",
        priority: "INTERVIEWS",
      });
    }

    if (
      pipelineComposition.activeApplications +
        pipelineComposition.activeInterviews >
      0
    ) {
      actions.push({
        title: "Keep one backup opportunity moving",
        reason:
          "An offer-stage opportunity is active. Keep at least one other path moving until the offer is fully resolved.",
        href:
          pipelineComposition.activeInterviews > 0
            ? "/interviews"
            : "/job-search",
        priority:
          pipelineComposition.activeInterviews > 0
            ? "INTERVIEWS"
            : "APPLICATIONS",
      });
    }
  } else if (pipelineSignal === "SETBACK") {
    actions.push({
      title: "Identify 3 replacement target roles",
      reason:
        "A recent opportunity closed or was rejected. Replace the lost pipeline capacity with another concrete opportunity.",
      href: "/job-search",
      priority: "APPLICATIONS",
    });

    actions.push({
      title: "Reopen a warm referral path",
      reason:
        "Use networking to create another path after the recent setback.",
      href: "/networking",
      priority: "NETWORKING",
    });
  } else if (pipelineComposition.finalRounds > 0) {
    actions.push({
      title: "Confirm final-round logistics",
      reason:
        `You currently have ${pipelineComposition.finalRounds} final-round ${
          pipelineComposition.finalRounds === 1 ? "opportunity" : "opportunities"
        }. Focus on closing the strongest active path before adding unnecessary volume.`,
      href: "/interviews",
      priority: "INTERVIEWS",
    });
  } else if (pipelineComposition.activeInterviews > 0) {
    actions.push({
      title: "Advance an active interview",
      reason:
        `You have ${pipelineComposition.activeInterviews} active ${
          pipelineComposition.activeInterviews === 1
            ? "interview"
            : "interviews"
        } and no final round yet. Make the next interview action explicit.`,
      href: "/interviews",
      priority: "INTERVIEWS",
    });
  } else if (pipelineComposition.activeApplications > 0) {
    actions.push({
      title: "Convert applications into conversations",
      reason:
        `You have ${pipelineComposition.activeApplications} active ${
          pipelineComposition.activeApplications === 1
            ? "application"
            : "applications"
        } but no active interviews. Focus on turning existing applications into conversations before simply adding more.`,
      href: "/job-search",
      priority: "APPLICATIONS",
    });
  } else if (pipelineComposition.activeNetworkContacts > 0) {
    actions.push({
      title: "Turn a network contact into an opportunity",
      reason:
        `You have ${pipelineComposition.activeNetworkContacts} active network ${
          pipelineComposition.activeNetworkContacts === 1
            ? "contact"
            : "contacts"
        } but no active application or interview pipeline. Convert a warm relationship into a concrete opportunity.`,
      href: "/networking",
      priority: "NETWORKING",
    });
  } else {
    actions.push({
      title: "Add a new target opportunity",
      reason:
        "Your active opportunity pipeline is currently empty. Add a concrete target to restart search momentum.",
      href: "/job-search",
      priority: "APPLICATIONS",
    });

    actions.push({
      title: "Create a new networking path",
      reason:
        "There is no active opportunity pipeline yet. Add a warm conversation alongside your next target.",
      href: "/networking",
      priority: "NETWORKING",
    });
  }

  if (state === "JUST_LAID_OFF") {
    actions.push(
      {
        title: "Complete your first 72 hours",
        reason:
          "Stabilize the immediate financial, administrative, and job-search basics before adding more activity.",
        href: "/first-72-hours",
        priority: "DIRECTION",
      },
      {
        title: "Confirm your financial runway",
        reason:
          "Knowing your actual runway gives the rest of your recovery plan a realistic time horizon.",
        href: "/runway",
        priority: "FINANCIAL",
      },
      {
        title: "Build your target company list",
        reason:
          "Turn a broad search into a defined set of companies worth pursuing.",
        href: "/companies",
        priority: "APPLICATIONS",
      },
      {
        title: "Start your networking pipeline",
        reason:
          "Early conversations can create opportunities before they reach public job boards.",
        href: "/networking",
        priority: "NETWORKING",
      },
      {
        title: "Set this week's recovery plan",
        reason:
          "Convert the immediate priorities into a manageable weekly operating rhythm.",
        href: "/plan",
        priority: "DIRECTION",
      }
    );
  }

  if (
    state === "STABILIZING" ||
    state === "SEARCHING" ||
    (runwayMonths !== null && runwayMonths < 2)
  ) {
    if (runwayMonths !== null && runwayMonths < 4) {
      actions.push({
        title: "Review your financial runway",
        reason:
          "Your current runway is relatively short, so financial decisions should stay visible while you search.",
        href: "/runway",
        priority: "FINANCIAL",
      });
    }

    actions.push({
      title: hasActiveApplications
        ? "Review your active application pipeline"
        : "Add your first target application",
      reason: hasActiveApplications
        ? "Keep active opportunities moving instead of letting applications become passive entries."
        : "Create a concrete starting point for the search.",
      href: "/job-search",
      priority: "APPLICATIONS",
    });

    if (activeNetworkFollowUps.length > 0) {
      actions.push({
        title: "Follow up with an active network contact",
        reason:
          "You already have a networking follow-up that can be acted on now.",
        href: "/networking",
        priority: "NETWORKING",
      });
    } else {
      actions.push({
        title:
          activeNetworkContacts.length > 0
            ? "Review your active network"
            : "Start your networking pipeline",
        reason:
          activeNetworkContacts.length > 0
            ? "Use existing relationships to create warm paths into target companies."
            : "Build a referral and conversation pipeline alongside applications.",
        href: "/networking",
        priority: "NETWORKING",
      });
    }

    actions.push({
      title: "Review this week's recovery plan",
      reason:
        "Keep your search tied to a weekly execution rhythm rather than ad hoc activity.",
      href: "/plan",
      priority: "DIRECTION",
    });
  }

  if (state === "INTERVIEWING") {
    actions.push({
      title: "Prepare for your next interview",
      reason:
        hasActiveInterviews
          ? "You have an active interview opportunity, so preparation should take priority over adding more volume."
          : "Keep interview preparation ready while opportunities move through the pipeline.",
      href: "/interviews",
      priority: "INTERVIEWS",
    });

    actions.push({
      title:
        interviewsNeedingAttention.length > 0
          ? "Review your interview follow-ups"
          : "Track your interview follow-up",
      reason:
        interviewsNeedingAttention.length > 0
          ? "At least one interview has a follow-up or next action recorded."
          : "Make the next interviewer or recruiter action explicit.",
      href: "/interviews",
      priority: "INTERVIEWS",
    });

    if (activeNetworkFollowUps.length > 0) {
      actions.push({
        title: "Follow up with an active network contact",
        reason:
          "You already have a networking action recorded that can move forward.",
        href: "/networking",
        priority: "NETWORKING",
      });
    } else {
      actions.push({
        title: "Review your active network",
        reason:
          "Continue warm conversations while interviews progress.",
        href: "/networking",
        priority: "NETWORKING",
      });
    }

    if (hasActiveApplications) {
      actions.push({
        title: "Review your active application pipeline",
        reason:
          "Keep other opportunities moving while you interview.",
        href: "/job-search",
        priority: "APPLICATIONS",
      });
    }
  }

  if (state === "FINAL_ROUND") {
    actions.push({
      title: "Prepare your final-round talking points",
      reason:
        "A final-round opportunity makes interview preparation and follow-up time-sensitive.",
      href: "/interviews",
      priority: "INTERVIEWS",
    });

    actions.push({
      title:
        interviewsNeedingAttention.length > 0
          ? "Send your final-round follow-up"
          : "Plan your final-round follow-up",
      reason:
        interviewsNeedingAttention.length > 0
          ? "Your interview record contains a follow-up or next action that needs attention."
          : "Make the next action after the final round explicit.",
      href: "/interviews",
      priority: "INTERVIEWS",
    });

    if (activeNetworkFollowUps.length > 0) {
      actions.push({
        title: "Follow up with an active network contact",
        reason:
          "Use existing relationships to support the active opportunity pipeline.",
        href: "/networking",
        priority: "NETWORKING",
      });
    } else if (activeNetworkContacts.length > 0) {
      actions.push({
        title: "Review your active network",
        reason:
          "Keep relevant relationships warm while the final-round opportunity progresses.",
        href: "/networking",
        priority: "NETWORKING",
      });
    } else {
      actions.push({
        title: "Start a referral conversation",
        reason:
          "Build another warm opportunity alongside the final-round process.",
        href: "/networking",
        priority: "NETWORKING",
      });
    }

    actions.push({
      title: hasActiveApplications
        ? "Review your active application pipeline"
        : "Add your next target application",
      reason:
        "Keep another path moving while the final-round opportunity is unresolved.",
      href: "/job-search",
      priority: "APPLICATIONS",
    });
  }

  if (state === "OFFER") {
    if (pipelineComposition.acceptedOffers === 0) {
      actions.push({
        title: "Review your offer pipeline",
        reason:
          "Keep the offer, decision timeline, and next steps clearly tracked.",
        href: "/interviews",
        priority: "INTERVIEWS",
      });
    }

    actions.push(
      {
        title: "Review compensation and decision dates",
        reason:
          "Make the financial and timing implications explicit before deciding on the next step.",
        href: "/interviews",
        priority: "FINANCIAL",
      },
      {
        title: "Review your financial position",
        reason:
          "Compare the offer decision against your current runway and obligations.",
        href: "/runway",
        priority: "FINANCIAL",
      },
      {
        title: "Keep one backup opportunity moving",
        reason:
          "An offer-stage process does not necessarily mean every other opportunity should stop.",
        href: "/job-search",
        priority: "APPLICATIONS",
      }
    );
  }

  if (state === "RECOVERED") {
    actions.push(
      {
        title: "Review your recovery data",
        reason:
          "Close the loop on the recovery process and keep the useful records.",
        href: "/dashboard",
        priority: "DIRECTION",
      },
      {
        title: "Review your financial position",
        reason:
          "Reassess your runway now that employment has resumed.",
        href: "/runway",
        priority: "FINANCIAL",
      },
      {
        title: "Archive completed job-search activity",
        reason:
          "Keep the active pipeline focused on opportunities that still matter.",
        href: "/job-search",
        priority: "APPLICATIONS",
      }
    );
  }

  if (actions.length === 0) {
    actions.push(
      {
        title: "Review this week's recovery plan",
        reason:
          "Keep your recovery work organized around a concrete weekly plan.",
        href: "/plan",
        priority: "DIRECTION",
      },
      {
        title: "Review your financial runway",
        reason:
          "Keep your available time horizon visible while you make decisions.",
        href: "/runway",
        priority: "FINANCIAL",
      },
      {
        title: "Review your target companies",
        reason:
          "Maintain a concrete list of opportunities to pursue.",
        href: "/companies",
        priority: "APPLICATIONS",
      }
    );
  }

  const priorityBase: Record<RecoveryPriority, number> = {
    FINANCIAL: 20,
    INTERVIEWS: 22,
    APPLICATIONS: 18,
    NETWORKING: 15,
    DIRECTION: 10,
  };

  const completedActions = input.completedActions ?? [];

  const uniqueActions = actions.filter(
    (action, index, all) =>
      index ===
      all.findIndex(
        (candidate) =>
          candidate.title === action.title &&
          candidate.href === action.href
      )
  );

  const hasCriticalRunway =
    runwayMonths !== null && runwayMonths < 2;

  const getActionCategory = (action: RecoveryAction): string => {
    const title = normalize(action.title);

    if (action.href === "/runway") {
      return "FINANCIAL";
    }

    if (
      title.includes("compensation") ||
      title.includes("financial position") ||
      title.includes("offer pipeline")
    ) {
      return "OFFER_DECISION";
    }

    if (
      title.includes("final-round") ||
      title.includes("active final round")
    ) {
      return "FINAL_ROUND";
    }

    if (
      title.includes("interview") ||
      title.includes("active interview")
    ) {
      return "INTERVIEW_EXECUTION";
    }

    if (
      title.includes("network") ||
      title.includes("referral")
    ) {
      return "NETWORKING";
    }

    if (
      title.includes("application") ||
      title.includes("opportunity") ||
      title.includes("pipeline")
    ) {
      return "PIPELINE_BUILDING";
    }

    if (action.priority === "DIRECTION") {
      return "DIRECTION";
    }

    return action.priority;
  };

  const applicationActionMemory = getApplicationActionMemory(
    input.applicationActionEvents,
    input.progressionEvents
  );

  const rankedActions = uniqueActions
    .filter(
      (action) =>
        !completedActions.some(
          (completed) =>
            completed.title === action.title &&
            completed.href === action.href
        )
    )
    .map((action, index) => {
      const evidence = getActionEvidence(
        input,
        action,
        state,
        runwayMonths
      );

      const title = normalize(action.title);
      let score = priorityBase[action.priority];

      if (evidence) {
        score += 5;
      }

      // State relevance.
      if (
        state === "JUST_LAID_OFF" &&
        action.href === "/first-72-hours"
      ) {
        score += 35;
      }

      if (
        state === "INTERVIEWING" &&
        action.href === "/interviews"
      ) {
        score += 18;
      }

      if (
        state === "FINAL_ROUND" &&
        action.href === "/interviews"
      ) {
        score += 25;
      }

      if (
        state === "OFFER" &&
        action.href === "/interviews"
      ) {
        score += 20;
      }

      if (
        state === "RECOVERED" &&
        action.href === "/dashboard"
      ) {
        score += 15;
      }

      // Financial urgency.
      if (runwayMonths !== null) {
        if (
          runwayMonths < 2 &&
          action.href === "/runway"
        ) {
          score += 30;
        } else if (
          runwayMonths < 4 &&
          action.href === "/runway"
        ) {
          score += 20;
        } else if (
          runwayMonths < 8 &&
          action.href === "/runway"
        ) {
          score += 8;
        }
      }

      // Accepted offer.
      if (pipelineComposition.acceptedOffers > 0) {
        if (title.includes("confirm your accepted offer")) {
          score += 35;
        }

        if (title.includes("compensation and decision dates")) {
          score += 18;
        }

        if (title.includes("backup opportunity")) {
          score += 10;
        }
      }

      // Active offer without acceptance.
      if (
        pipelineComposition.offers > 0 &&
        pipelineComposition.acceptedOffers === 0
      ) {
        if (title.includes("review your offer pipeline")) {
          score += 30;
        }

        if (title.includes("compensation and decision dates")) {
          score += 22;
        }

        if (action.href === "/interviews") {
          score += 10;
        }
      }

      // Final-round opportunities.
      if (pipelineComposition.finalRounds > 0) {
        if (action.href === "/interviews") {
          score += 25;
        }

        if (title.includes("final-round")) {
          score += 15;
        }
      }

      // Active interviews.
      if (pipelineComposition.activeInterviews > 0) {
        if (action.href === "/interviews") {
          score += 18;
        }

        if (
          title.includes("prepare for your next interview") ||
          title.includes("advance an active interview")
        ) {
          score += 12;
        }
      }

      // Applications with no active interviews.
      if (
        pipelineComposition.activeApplications > 0 &&
        pipelineComposition.activeInterviews === 0
      ) {
        if (
          title.includes("convert applications into conversations")
        ) {
          score += 22;
        }

        if (action.href === "/job-search") {
          score += 8;
        }
      }

      // Networking follow-ups.
      const hasNetworkFollowUp = (
        input.networkContacts ?? []
      ).some((contact) => {
        const status = normalize(contact.status);

        return (
          status !== "inactive" &&
          status !== "closed" &&
          status !== "rejected" &&
          Boolean(contact.nextAction)
        );
      });

      if (
        hasNetworkFollowUp &&
        title.includes("follow up with an active network contact")
      ) {
        score += 22;
      }

      // Recent progression.
      if (
        progressionSignal === "ADVANCING" &&
        recentProgression
      ) {
        const newStage = normalize(recentProgression.newStage);

        if (
          (newStage === "interview" || newStage === "final") &&
          action.href === "/interviews"
        ) {
          score += 18;
        }
      }

      if (progressionSignal === "SETBACK") {
        if (
          title.includes("replacement opportunity") ||
          title.includes("new referral conversation")
        ) {
          score += 20;
        }
      }

      if (progressionSignal === "CLOSED") {
        if (
          action.href === "/job-search" ||
          action.href === "/networking"
        ) {
          score += 12;
        }
      }

      // v1.25: learning-aware application action ranking.
      // Historical action memory only influences recommendations
      // once there is enough evidence to establish a pattern.
      const learnedAction = normalize(
        applicationActionMemory.action ?? ""
      );
      const currentAction = normalize(action.title);

      if (
        applicationActionMemory.confidence !== "LOW" &&
        learnedAction &&
        currentAction &&
        action.href === "/job-search"
      ) {
        const actionMatches =
          currentAction === learnedAction ||
          currentAction.includes(learnedAction) ||
          learnedAction.includes(currentAction);

        if (actionMatches) {
          if (
            applicationActionMemory.recommendation === "REPEAT"
          ) {
            score += 14;
          } else if (
            applicationActionMemory.recommendation === "MODIFY"
          ) {
            score += 4;
          } else if (
            applicationActionMemory.recommendation === "RETIRE"
          ) {
            score -= 25;
          }
        }
      }

      return {
        action,
        evidence,
        score,
        index,
        category: getActionCategory(action),
      };
    });

  const sortedActions = rankedActions.sort(
    (a, b) =>
      b.score - a.score ||
      priorityBase[b.action.priority] -
        priorityBase[a.action.priority] ||
      a.index - b.index
  );

  const selectedActions: typeof sortedActions = [];
  const selectedCategories = new Set<string>();

  // Critical financial runway is a hard constraint:
  // never allow an urgent interview/search context to completely
  // hide financial runway risk.
  if (hasCriticalRunway) {
    const financialAction = sortedActions.find(
      (item) => item.category === "FINANCIAL"
    );

    if (financialAction) {
      selectedActions.push(financialAction);
      selectedCategories.add(financialAction.category);
    }
  }

  // First pass: maximize action diversity.
  for (const item of sortedActions) {
    if (selectedActions.length >= 5) {
      break;
    }

    if (selectedCategories.has(item.category)) {
      continue;
    }

    selectedActions.push(item);
    selectedCategories.add(item.category);
  }

  // Second pass: fill remaining slots with the strongest
  // remaining actions when there are not enough categories.
  for (const item of sortedActions) {
    if (selectedActions.length >= 5) {
      break;
    }

    if (
      selectedActions.some(
        (selected) => selected.index === item.index
      )
    ) {
      continue;
    }

    selectedActions.push(item);
  }

  const finalActions = selectedActions
    .sort(
      (a, b) =>
        b.score - a.score ||
        priorityBase[b.action.priority] -
          priorityBase[a.action.priority] ||
        a.index - b.index
    )
    .slice(0, 5)
    .map(({ action, evidence }) => ({
      ...action,
      evidence,
    }));

return finalActions;
}

function getPipelineComposition(
  input: RecoveryEngineInput
): PipelineComposition {
  const applications = input.applications ?? [];
  const interviews = input.interviews ?? [];
  const networkContacts = input.networkContacts ?? [];

  // Match Dashboard application semantics:
  // active excludes Rejected, Withdrawn, and Offer.
  const activeApplications = applications.filter((item) => {
    const stage = normalize(item.stage);

    return (
      stage !== "rejected" &&
      stage !== "withdrawn" &&
      stage !== "offer"
    );
  });

  // Match Dashboard interview semantics:
  // active excludes Rejected, Withdrawn, and Accepted.
  const activeInterviews = interviews.filter((item) => {
    const stage = normalize(item.stage);

    return (
      stage !== "rejected" &&
      stage !== "withdrawn" &&
      stage !== "accepted"
    );
  });

  const applicationFinals = applications.filter(
    (item) => normalize(item.stage) === "final"
  ).length;

  const interviewFinals = interviews.filter(
    (item) => normalize(item.stage) === "final"
  ).length;

  const applicationOffers = applications.filter(
    (item) => normalize(item.stage) === "offer"
  ).length;

  const interviewOffers = interviews.filter((item) => {
    const stage = normalize(item.stage);

    return stage === "offer" || stage === "accepted";
  }).length;

  const acceptedOffers = interviews.filter(
    (item) => normalize(item.stage) === "accepted"
  ).length;

  const activeNetworkContacts = networkContacts.filter((item) => {
    const status = normalize(item.status);

    return (
      status !== "inactive" &&
      status !== "closed" &&
      status !== "rejected"
    );
  }).length;

  return {
    totalApplications: applications.length,
    activeApplications: activeApplications.length,
    activeInterviews: activeInterviews.length,
    finalRounds: applicationFinals + interviewFinals,
    offers: applicationOffers + interviewOffers,
    applicationOffers,
    interviewOffers,
    acceptedOffers,
    activeNetworkContacts,
  };
}

function getPipelineSignal(
  input: RecoveryEngineInput,
  recentProgression: RecentProgression | null,
  progressionSignal: ProgressionSignal
): PipelineSignal {
  const activeApplications = (input.applications ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const activeInterviews = (input.interviews ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const hasOfferStage = activeInterviews.some((item) => {
    const stage = normalize(item.stage);
    return stage === "offer" || stage === "accepted";
  });

  if (hasOfferStage) {
    return "OFFER_STAGE";
  }

  if (
    progressionSignal === "SETBACK" ||
    progressionSignal === "CLOSED"
  ) {
    return "SETBACK";
  }

  const activeOpportunityCount =
    activeApplications.length + activeInterviews.length;

  if (
    progressionSignal === "ADVANCING" &&
    recentProgression &&
    activeOpportunityCount > 0
  ) {
    return "BUILDING";
  }

  if (activeOpportunityCount > 0) {
    return "ACTIVE";
  }

  return "THIN";
}

function getProgressionSignal(
  progression: RecentProgression | null
): ProgressionSignal {
  if (!progression) {
    return "NEUTRAL";
  }

  const previousStage = normalize(progression.previousStage);
  const newStage = normalize(progression.newStage);

  if (newStage === "rejected") {
    return "SETBACK";
  }

  if (newStage === "withdrawn") {
    return "CLOSED";
  }

  const stageOrder = [
    "applied",
    "recruiter screen",
    "interview",
    "final",
    "offer",
    "accepted",
  ];

  const previousIndex = stageOrder.indexOf(previousStage);
  const newIndex = stageOrder.indexOf(newStage);

  if (
    previousIndex !== -1 &&
    newIndex !== -1 &&
    newIndex > previousIndex
  ) {
    return "ADVANCING";
  }

  if (
    previousIndex !== -1 &&
    newIndex !== -1 &&
    newIndex < previousIndex
  ) {
    return "SETBACK";
  }

  return "NEUTRAL";
}

function getRecoveryBottleneck(
  state: RecoveryState,
  runwayMonths: number | null,
  pipelineSignal: PipelineSignal,
  pipelineComposition: PipelineComposition
): RecoveryBottleneck {
  const criticalRunway =
    runwayMonths !== null && runwayMonths < 2;

  /*
   * v1.15 bottleneck hierarchy:
   * 1. Critical runway
   * 2. Accepted offer
   * 3. Active offer
   * 4. Final round
   * 5. Active interviews
   * 6. Application-heavy conversion gap
   * 7. Setback / rebuilding
   * 8. Thin pipeline
   * 9. Stabilizing
   */

  if (criticalRunway) {
    return {
      headline: "Financial runway is becoming the binding constraint.",
      summary:
        `You have ${runwayMonths.toFixed(1)} months of estimated runway, so financial pressure can limit how long the current recovery strategy can continue unchanged.`,
      focus:
        "Protect runway while continuing the highest-priority active opportunities.",
    };
  }

  if (pipelineComposition.acceptedOffers > 0) {
    return {
      headline: "The remaining constraint is completing the employment transition.",
      summary:
        "An offer has already been accepted, so the recovery process is no longer primarily about generating another opportunity.",
      focus:
        "Complete the transition details and update employment status when employment resumes.",
    };
  }

  if (pipelineComposition.offers > 0) {
    return {
      headline: "The active offer is unresolved.",
      summary:
        "An offer-stage opportunity exists, but the recovery cycle remains open until the decision and transition details are resolved.",
      focus:
        "Resolve compensation, timing, decision, and transition details.",
    };
  }

  if (pipelineComposition.finalRounds > 0 || state === "FINAL_ROUND") {
    return {
      headline: "The opportunity is in execution rather than discovery.",
      summary:
        "At least one opportunity has reached the final round, so generating more top-of-funnel activity is less important than executing the active opportunity well.",
      focus:
        "Maximize final-round preparation, logistics, and follow-up.",
    };
  }

  if (
    pipelineComposition.activeInterviews > 0 ||
    state === "INTERVIEWING"
  ) {
    return {
      headline: "Active interviews have not yet converted into a final round.",
      summary:
        `${pipelineComposition.activeInterviews} active interview${pipelineComposition.activeInterviews === 1 ? "" : "s"} are in progress, but the next meaningful transition has not yet been reached.`,
      focus:
        "Advance the strongest active interview toward the final round.",
    };
  }

  if (
    pipelineComposition.activeApplications >= 3 &&
    pipelineComposition.activeInterviews === 0
  ) {
    return {
      headline:
        "You have applications, but the pipeline has not converted into enough conversations.",
      summary:
        `${pipelineComposition.activeApplications} active applications are currently in the pipeline with no active interviews.`,
      focus:
        "Convert existing applications into conversations and interview opportunities.",
    };
  }

  if (pipelineSignal === "SETBACK") {
    return {
      headline: "A recent setback has reduced pipeline capacity.",
      summary:
        "A recent opportunity has left the active pipeline, so the immediate constraint is replacing the lost opportunity without losing momentum.",
      focus:
        "Rebuild pipeline capacity while preserving attention on remaining active opportunities.",
    };
  }

  if (
    pipelineComposition.activeApplications > 0 &&
    pipelineComposition.activeInterviews === 0
  ) {
    return {
      headline: "The active pipeline is still concentrated in applications.",
      summary:
        `${pipelineComposition.activeApplications} active application${pipelineComposition.activeApplications === 1 ? "" : "s"} are in progress, but none has yet produced an active interview.`,
      focus:
        "Create more conversion paths from applications into conversations.",
    };
  }

  if (state === "STABILIZING" || state === "JUST_LAID_OFF") {
    return {
      headline: "The recovery operating baseline is not fully established.",
      summary:
        "The immediate constraint is creating enough financial, directional, and search structure to move into active recovery execution.",
      focus:
        "Establish the financial baseline, target direction, and first recovery workflow.",
    };
  }

  if (
    pipelineSignal === "THIN" ||
    (pipelineComposition.activeApplications === 0 &&
      pipelineComposition.activeInterviews === 0)
  ) {
    return {
      headline: "Your active opportunity pipeline has not been established.",
      summary:
        "There are not enough active opportunities in the recovery pipeline to support downstream interview and offer transitions.",
      focus:
        "Build the first meaningful opportunity pipeline.",
    };
  }

  return {
    headline: "No single recovery bottleneck is dominant yet.",
    summary:
      "The current evidence does not indicate one constraint that clearly overrides the rest of the recovery pipeline.",
    focus:
      "Continue the current recovery plan and watch for the next meaningful pipeline change.",
  };
}

function getPipelineHealth(
  pipelineComposition: PipelineComposition
): PipelineHealth {
  const {
    activeApplications,
    activeInterviews,
    finalRounds,
    offers,
    acceptedOffers,
  } = pipelineComposition;

  const depth =
    activeApplications +
    activeInterviews +
    finalRounds +
    offers;

  const conversion =
    activeApplications > 0
      ? Number(
          (
            ((activeInterviews + finalRounds + offers + acceptedOffers) /
              activeApplications) *
            100
          ).toFixed(1)
        )
      : null;

  const progression =
    activeInterviews > 0
      ? Number(
          (
            ((finalRounds + offers + acceptedOffers) /
              activeInterviews) *
            100
          ).toFixed(1)
        )
      : null;

  let balance: PipelineHealth["balance"] = "BALANCED";

  if (
    activeApplications >= 3 &&
    activeInterviews === 0 &&
    finalRounds === 0 &&
    offers === 0
  ) {
    balance = "APPLICATION_HEAVY";
  } else if (
    activeInterviews >= 2 &&
    finalRounds === 0 &&
    offers === 0
  ) {
    balance = "INTERVIEW_HEAVY";
  } else if (offers > 0 || acceptedOffers > 0) {
    balance = "OFFER_HEAVY";
  }

  const signals: string[] = [];

  if (activeApplications > 0) {
    signals.push(
      `${activeApplications} active application${activeApplications === 1 ? "" : "s"}`
    );
  }

  if (activeInterviews > 0) {
    signals.push(
      `${activeInterviews} active interview${activeInterviews === 1 ? "" : "s"}`
    );
  }

  if (finalRounds > 0) {
    signals.push(
      `${finalRounds} final-round opportunit${finalRounds === 1 ? "y" : "ies"}`
    );
  }

  if (offers > 0) {
    signals.push(
      `${offers} offer-stage opportunit${offers === 1 ? "y" : "ies"}`
    );
  }

  if (acceptedOffers > 0) {
    signals.push(
      `${acceptedOffers} accepted offer${acceptedOffers === 1 ? "" : "s"}`
    );
  }

  if (acceptedOffers > 0 || offers > 0) {
    return {
      status: "HEALTHY",
      headline: "The pipeline has downstream opportunity depth.",
      summary:
        "The recovery pipeline contains an offer-stage or accepted opportunity, providing meaningful downstream coverage.",
      depth,
      conversion,
      progression,
      balance,
      signals,
    };
  }

  if (finalRounds > 0 || activeInterviews > 0) {
    return {
      status: "HEALTHY",
      headline: "The pipeline has active conversation depth.",
      summary:
        "The recovery pipeline has moved beyond applications into active interview-stage opportunities.",
      depth,
      conversion,
      progression,
      balance,
      signals,
    };
  }

  if (activeApplications >= 3) {
    return {
      status: "FRAGILE",
      headline: "The pipeline has volume but limited downstream depth.",
      summary:
        "There are multiple active applications, but the current pipeline has not yet produced active interview-stage opportunities.",
      depth,
      conversion,
      progression,
      balance,
      signals,
    };
  }

  if (activeApplications > 0) {
    return {
      status: "FRAGILE",
      headline: "The pipeline exists but remains thin.",
      summary:
        "There is an active application pipeline, but there is not yet enough downstream opportunity depth to provide strong coverage.",
      depth,
      conversion,
      progression,
      balance,
      signals,
    };
  }

  return {
    status: "THIN",
    headline: "The recovery pipeline has not yet been established.",
    summary:
      "There are no active applications or downstream opportunities currently providing pipeline coverage.",
    depth,
    conversion,
    progression,
    balance,
    signals,
  };
}

function getRecoveryReadiness(
  state: RecoveryState,
  pipelineComposition: PipelineComposition
): RecoveryReadiness {
  /*
   * v1.16 transition-readiness contract:
   *
   * JUST_LAID_OFF → STABILIZING
   * STABILIZING   → SEARCHING
   * SEARCHING     → INTERVIEWING
   * INTERVIEWING  → FINAL_ROUND
   * FINAL_ROUND   → OFFER
   * OFFER         → RECOVERED
   * RECOVERED     → RECOVERED
   *
   * Readiness is evidence that the next transition has been achieved.
   */

  if (state === "JUST_LAID_OFF") {
    return {
      ready: true,
      headline: "The immediate stabilization transition is ready.",
      summary:
        "The recovery process can move from the immediate post-layoff stage into active stabilization.",
      blockers: [],
      nextState: "STABILIZING",
    };
  }

  if (state === "STABILIZING") {
    if (pipelineComposition.activeApplications > 0) {
      return {
        ready: true,
        headline: "The recovery pipeline is ready to enter active search.",
        summary:
          "At least one active application is now in motion, providing evidence that the recovery process has moved beyond stabilization.",
        blockers: [],
        nextState: "SEARCHING",
      };
    }

    return {
      ready: false,
      headline: "The recovery baseline is not yet ready for active search.",
      summary:
        "The system has not yet detected an active application pipeline.",
      blockers: ["No active application pipeline."],
      nextState: "SEARCHING",
    };
  }

  if (state === "SEARCHING") {
    if (pipelineComposition.activeInterviews > 0) {
      return {
        ready: true,
        headline: "The search pipeline is ready to transition into interviews.",
        summary:
          "At least one active interview has been created from the search pipeline.",
        blockers: [],
        nextState: "INTERVIEWING",
      };
    }

    return {
      ready: false,
      headline: "The search pipeline is not yet ready for interview transition.",
      summary:
        "Active applications exist, but the pipeline has not yet produced an active interview.",
      blockers: ["No active interview opportunity."],
      nextState: "INTERVIEWING",
    };
  }

  if (state === "INTERVIEWING") {
    if (pipelineComposition.finalRounds > 0) {
      return {
        ready: true,
        headline: "The interview pipeline is ready to transition into a final round.",
        summary:
          "At least one active interview has reached the final-round stage.",
        blockers: [],
        nextState: "FINAL_ROUND",
      };
    }

    return {
      ready: false,
      headline: "The interview pipeline is not yet ready for a final round.",
      summary:
        "Active interviews exist, but no final-round opportunity has been detected.",
      blockers: ["No active final-round opportunity."],
      nextState: "FINAL_ROUND",
    };
  }

  if (state === "FINAL_ROUND") {
    if (pipelineComposition.offers > 0) {
      return {
        ready: true,
        headline: "The final-round opportunity is ready to transition into an offer.",
        summary:
          "An offer-stage opportunity has been detected following the final-round stage.",
        blockers: [],
        nextState: "OFFER",
      };
    }

    return {
      ready: false,
      headline: "The final-round opportunity is not yet ready for an offer transition.",
      summary:
        "A final-round opportunity is active, but no offer-stage opportunity has been detected.",
      blockers: ["No active offer-stage opportunity."],
      nextState: "OFFER",
    };
  }

  if (state === "OFFER") {
    if (pipelineComposition.acceptedOffers > 0) {
      return {
        ready: true,
        headline: "The recovery is ready to transition back into employment.",
        summary:
          "An offer has been accepted, satisfying the evidence required for the final recovery transition.",
        blockers: [],
        nextState: "RECOVERED",
      };
    }

    return {
      ready: false,
      headline: "The offer-stage transition is not yet complete.",
      summary:
        "An offer-stage opportunity is active, but there is not yet evidence that it has been accepted.",
      blockers: ["Offer has not yet been accepted."],
      nextState: "RECOVERED",
    };
  }

  return {
    ready: true,
    headline: "Recovery is complete.",
    summary:
      "Employment has resumed and the recovery state has reached its terminal condition.",
    blockers: [],
    nextState: "RECOVERED",
  };
}

function getRecoveryMomentum(
  progression: RecentProgression | null,
  pipelineComposition: PipelineComposition
): RecoveryMomentum {
  const recentAdvances =
    progression && getProgressionSignal(progression) === "ADVANCING"
      ? 1
      : 0;

  const recentSetbacks =
    progression && getProgressionSignal(progression) === "SETBACK"
      ? 1
      : 0;

  const recentClosures =
    progression && getProgressionSignal(progression) === "CLOSED"
      ? 1
      : 0;

  const signals: string[] = [];

  if (recentAdvances > 0) {
    signals.push(
      `${recentAdvances} recent progression signal moving forward`
    );
  }

  if (recentSetbacks > 0) {
    signals.push(
      `${recentSetbacks} recent setback signal`
    );
  }

  if (recentClosures > 0) {
    signals.push(
      `${recentClosures} recent opportunity closure`
    );
  }

  if (pipelineComposition.offers > 0 || pipelineComposition.acceptedOffers > 0) {
    signals.push("Downstream opportunity exists in the pipeline.");
  } else if (pipelineComposition.finalRounds > 0) {
    signals.push("A final-round opportunity is active.");
  } else if (pipelineComposition.activeInterviews > 0) {
    signals.push("Active interviews are currently in progress.");
  } else if (pipelineComposition.activeApplications > 0) {
    signals.push("Active applications are currently in progress.");
  }

  if (recentAdvances > 0 && recentSetbacks === 0) {
    return {
      status: "ACCELERATING",
      headline: "Recovery momentum is moving forward.",
      summary:
        "Recent progression evidence shows the recovery pipeline is advancing rather than losing capacity.",
      direction: "FORWARD",
      recentAdvances,
      recentSetbacks,
      recentClosures,
      signals,
    };
  }

  if (recentSetbacks > 0 || recentClosures > 0) {
    if (
      recentSetbacks > recentAdvances ||
      recentClosures > recentAdvances
    ) {
      return {
        status: "REVERSING",
        headline: "Recovery momentum is moving backward.",
        summary:
          "Recent pipeline evidence shows more opportunity loss than forward progression.",
        direction: "BACKWARD",
        recentAdvances,
        recentSetbacks,
        recentClosures,
        signals,
      };
    }

    return {
      status: "STALLING",
      headline: "Recovery momentum is losing pace.",
      summary:
        "Recent pipeline changes include opportunity loss, but the evidence does not yet indicate a clear reversal.",
      direction: "FLAT",
      recentAdvances,
      recentSetbacks,
      recentClosures,
      signals,
    };
  }

  if (
    pipelineComposition.offers > 0 ||
    pipelineComposition.acceptedOffers > 0 ||
    pipelineComposition.finalRounds > 0
  ) {
    return {
      status: "STEADY",
      headline: "Recovery momentum is holding at a meaningful stage.",
      summary:
        "No recent progression event was detected, but the active pipeline contains downstream opportunities.",
      direction: "FLAT",
      recentAdvances,
      recentSetbacks,
      recentClosures,
      signals,
    };
  }

  if (
    pipelineComposition.activeInterviews > 0 ||
    pipelineComposition.activeApplications > 0
  ) {
    return {
      status: "STEADY",
      headline: "Recovery momentum is currently steady.",
      summary:
        "The active pipeline is still in motion, but there is not enough recent progression evidence to classify acceleration.",
      direction: "FLAT",
      recentAdvances,
      recentSetbacks,
      recentClosures,
      signals,
    };
  }

  return {
    status: "STALLING",
    headline: "Recovery momentum is currently stalled.",
    summary:
      "There is not enough active pipeline or recent progression evidence to indicate forward movement.",
    direction: "FLAT",
    recentAdvances,
    recentSetbacks,
    recentClosures,
    signals,
  };
}

function getRecoveryOutcome(
  progression: RecentProgression | null
): RecoveryOutcome {
  if (!progression) {
    return {
      status: "NONE",
      headline: "No recent recovery outcome detected.",
      summary:
        "There is not enough recent progression evidence to classify an outcome.",
      evidence: [],
      recommendation:
        "Keep the active recovery pipeline moving and generate the next measurable progression signal.",
    };
  }

  const signal = getProgressionSignal(progression);

  if (signal === "ADVANCING") {
    return {
      status: "POSITIVE",
      headline: `${progression.company} produced a positive progression signal.`,
      summary:
        `${progression.type === "interview" ? "The interview" : "The application"} moved from ${progression.previousStage} to ${progression.newStage}.`,
      evidence: [
        `${progression.previousStage} → ${progression.newStage}`,
        `${progression.type === "interview" ? "Interview" : "Application"} progression detected`,
      ],
      recommendation:
        "Preserve the current momentum and increase preparation or follow-up appropriate to the new stage.",
    };
  }

  if (signal === "SETBACK") {
    const newStage = normalize(progression.newStage);
    const opportunityType =
      progression.type === "interview" ? "interview" : "application";

    if (newStage === "rejected") {
      return {
        status: "NEGATIVE",
        headline: `${progression.company} produced a negative progression signal.`,
        summary:
          `${opportunityType === "interview" ? "The interview" : "The application"} moved from ${progression.previousStage} to Rejected.`,
        evidence: [
          `${progression.previousStage} → Rejected`,
          `${opportunityType === "interview" ? "Interview" : "Application"} opportunity lost`,
        ],
        recommendation:
          "Replace the lost opportunity and use the setback to recalibrate where the active pipeline needs more depth.",
      };
    }

    return {
      status: "NEGATIVE",
      headline: `${progression.company} produced a backward progression signal.`,
      summary:
        `${opportunityType === "interview" ? "The interview" : "The application"} moved backward from ${progression.previousStage} to ${progression.newStage}.`,
      evidence: [
        `${progression.previousStage} → ${progression.newStage}`,
        `${opportunityType === "interview" ? "Interview" : "Application"} stage regressed`,
      ],
      recommendation:
        "Reassess the active opportunity and increase pipeline depth while addressing the cause of the backward movement.",
    };
  }

  if (signal === "CLOSED") {
    return {
      status: "NEGATIVE",
      headline: `${progression.company} produced a closed opportunity.`,
      summary:
        `${progression.type === "interview" ? "The interview" : "The application"} moved from ${progression.previousStage} to Withdrawn.`,
      evidence: [
        `${progression.previousStage} → Withdrawn`,
        `${progression.type === "interview" ? "Interview" : "Application"} opportunity closed`,
      ],
      recommendation:
        "Stop spending recovery attention on the closed path and redirect effort toward active opportunities.",
    };
  }

  return {
    status: "MIXED",
    headline: `${progression.company} produced a neutral progression signal.`,
    summary:
      `${progression.type === "interview" ? "The interview" : "The application"} changed stage, but the available evidence does not establish forward or backward movement.`,
    evidence: [
      `${progression.previousStage} → ${progression.newStage}`,
      "Stage change detected without a directional progression signal",
    ],
    recommendation:
      "Continue monitoring the opportunity until a clearer progression, setback, or closure signal appears.",
  };
}

function getRecoveryRecalibration(
  outcome: RecoveryOutcome,
  pipelineComposition: PipelineComposition
): RecoveryRecalibration {
  if (outcome.status === "NEGATIVE") {
    return {
      needed: true,
      headline: "Recovery strategy needs recalibration.",
      summary:
        "A recent opportunity was lost or closed, so the next actions should replace that capacity rather than continue as if the pipeline were unchanged.",
      reason: outcome.headline,
      nextFocus:
        pipelineComposition.activeApplications < 3
          ? "APPLICATIONS"
          : pipelineComposition.activeInterviews === 0
            ? "NETWORKING"
            : "INTERVIEWS",
    };
  }

  if (outcome.status === "POSITIVE") {
    return {
      needed: false,
      headline: "Recovery strategy is responding to positive movement.",
      summary:
        "Recent progression provides evidence that the current recovery direction is producing movement.",
      reason: outcome.headline,
      nextFocus:
        pipelineComposition.finalRounds > 0 ||
        pipelineComposition.offers > 0 ||
        pipelineComposition.acceptedOffers > 0
          ? "INTERVIEWS"
          : pipelineComposition.activeInterviews > 0
            ? "INTERVIEWS"
            : "APPLICATIONS",
    };
  }

  if (outcome.status === "MIXED") {
    return {
      needed: false,
      headline: "Recovery strategy does not need recalibration yet.",
      summary:
        "A recent stage change was detected, but the available evidence is not strong enough to justify changing the recovery direction.",
      reason: outcome.headline,
      nextFocus:
        pipelineComposition.activeInterviews > 0
          ? "INTERVIEWS"
          : pipelineComposition.activeApplications > 0
            ? "APPLICATIONS"
            : "NETWORKING",
    };
  }

  return {
    needed: false,
    headline: "No recalibration signal is available yet.",
    summary:
      "There is no recent progression outcome to justify changing the current recovery strategy.",
    reason: "No recent progression event was detected.",
    nextFocus:
      pipelineComposition.activeApplications > 0
        ? "APPLICATIONS"
        : pipelineComposition.activeInterviews > 0
          ? "INTERVIEWS"
          : "NETWORKING",
  };
}

function getRecoveryChange(
  progression: RecentProgression | null
): RecoveryChange | null {
  if (!progression) {
    return null;
  }

  const signal = getProgressionSignal(progression);
  const newStage = normalize(progression.newStage);

  if (newStage === "accepted") {
    return {
      headline: `${progression.company} moved from ${progression.previousStage} to Accepted.`,
      summary:
        "The offer has been accepted and the opportunity has moved into the transition stage.",
      implication:
        "The focus now shifts from progressing the opportunity to confirming the transition details and updating employment status when employment resumes.",
    };
  }

  if (signal === "ADVANCING") {
    return {
      headline: `${progression.company} moved from ${progression.previousStage} to ${progression.newStage}.`,
      summary:
        `${progression.type === "interview" ? "The interview" : "The application"} has advanced to a later stage in the recovery pipeline.`,
      implication:
        "The opportunity is gaining momentum, so preparation and follow-up should keep pace with the new stage.",
    };
  }

  if (signal === "SETBACK") {
    return {
      headline: `${progression.company} moved from ${progression.previousStage} to Rejected.`,
      summary:
        `${progression.type === "interview" ? "The interview" : "The application"} has left the active recovery pipeline.`,
      implication:
        "Pipeline capacity was lost, so the next priority is to capture the signal and replace the opportunity.",
    };
  }

  if (signal === "CLOSED") {
    return {
      headline: `${progression.company} moved from ${progression.previousStage} to Withdrawn.`,
      summary:
        `${progression.type === "interview" ? "The interview" : "The application"} is no longer an active recovery opportunity.`,
      implication:
        "The closed path should no longer consume recovery attention while active opportunities remain in focus.",
    };
  }

  return null;
}

function getRecentProgression(
  input: RecoveryEngineInput
): RecentProgression | null {
  const events = input.progressionEvents ?? [];

  for (const event of events) {
    if (
      event.eventType !== "application_progression" &&
      event.eventType !== "interview_progression"
    ) {
      continue;
    }

    const metadata = event.metadata;

    if (!metadata) continue;

    const company = metadata.company;
    const role = metadata.role;
    const previousStage = metadata.previousStage;
    const newStage = metadata.newStage;

    if (
      typeof company !== "string" ||
      typeof role !== "string" ||
      typeof previousStage !== "string" ||
      typeof newStage !== "string"
    ) {
      continue;
    }

    return {
      type:
        event.eventType === "application_progression"
          ? "application"
          : "interview",
      company,
      role,
      previousStage,
      newStage,
      occurredAt: event.occurredAt ?? null,
    };
  }

  return null;
}

export function calculateRecovery(
  input: RecoveryEngineInput
): RecoveryEngineResult {
  const state = getState(input);
  const runwayMonths = calculateRunway(input);
  const recentProgression = getRecentProgression(input);
  const progressionSignal = getProgressionSignal(recentProgression);
  const pipelineComposition = getPipelineComposition(input);
  const pipelineSignal = getPipelineSignal(
    input,
    recentProgression,
    progressionSignal
  );
  const situation = getRecoverySituation(
    input,
    state,
    runwayMonths,
    pipelineSignal,
    pipelineComposition,
    recentProgression
  );
  const change = getRecoveryChange(recentProgression);

  const bottleneck = getRecoveryBottleneck(
    state,
    runwayMonths,
    pipelineSignal,
    pipelineComposition
  );

  const pipelineHealth = getPipelineHealth(
    pipelineComposition
  );

  const momentum = getRecoveryMomentum(
    recentProgression,
    pipelineComposition
  );

  const outcome = getRecoveryOutcome(recentProgression);

  const recalibration = getRecoveryRecalibration(
    outcome,
    pipelineComposition
  );

  const actionEffect = getRecoveryActionEffect(
    input.completedActions ?? [],
    input.progressionEvents ?? []
  );

  const actionRecalibration = getActionRecalibration(actionEffect);

  const applicationActionEffect = getApplicationActionEffect(

    input.applicationActionEvents,

    input.progressionEvents,

  );


  const applicationActionRecalibration =
    getApplicationActionRecalibration(applicationActionEffect);



  const applicationActionMemory = getApplicationActionMemory(


    input.applicationActionEvents,


    input.progressionEvents,


  );


  const actionMemory = getActionMemory(
    input.completedActions ?? [],
    input.progressionEvents ?? []
  );

  const weeklyPlanTaskEffect = getWeeklyPlanTaskEffect(
    input.weeklyPlanTaskEvents ?? [],
    input.progressionEvents ?? []
  );

  const readiness = getRecoveryReadiness(
    state,
    pipelineComposition
  );

  return {
    state,
    applicationActionEvents:
      input.applicationActionEvents ?? [],
    applicationActionEffect,
    applicationActionRecalibration,
    applicationActionMemory,
    stateLabel: getStateLabel(state),
    stateReason: getStateReason(input, state),
    runwayMonths,
    pipelineHealth,
    momentum,
    outcome,
    recalibration,
    actionEffect,
    actionRecalibration,
    actionMemory,
    weeklyPlanTaskEffect,
    priorities: getPriorities(
      input,
      state,
      runwayMonths,
      pipelineSignal
    ),
    actions: getActions(
      input,
      state,
      runwayMonths,
      recentProgression,
      progressionSignal,
      pipelineSignal,
      pipelineComposition
    ),
    transition: getTransition(input, state),
    recentProgression,
    pipelineSignal,
    pipelineComposition,
    situation,
    change,
    bottleneck,
    readiness,
  };
}

export type ApplicationActionEffect = {
  status: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "UNKNOWN";
  headline: string;
  summary: string;
  evidence: string[];
  recommendation: string;
  applicationId: string | null;
  action: string | null;
  company: string | null;
  role: string | null;
  completedAt: string | null;
  progression: RecentProgression | null;
};

function getApplicationActionEffect(
  applicationActionEvents: RecoveryEngineInput["applicationActionEvents"],
  progressionEvents: RecoveryEngineInput["progressionEvents"],
): ApplicationActionEffect {
  const completedActions = (applicationActionEvents ?? [])
    .filter(
      (action) =>
        typeof action.completedAt === "string" &&
        action.completedAt.length > 0 &&
        typeof action.action === "string" &&
        action.action.length > 0,
    )
    .sort((a, b) => {
      const aTime = new Date(a.completedAt as string).getTime();
      const bTime = new Date(b.completedAt as string).getTime();
      return bTime - aTime;
    });

  const latestAction = completedActions[0];

  if (!latestAction) {
    return {
      status: "UNKNOWN",
      headline: "No application action outcome yet",
      summary:
        "Complete an application next action and the engine will look for subsequent pipeline movement.",
      evidence: [],
      recommendation: "Complete a tracked application next action.",
      applicationId: null,
      action: null,
      company: null,
      role: null,
      completedAt: null,
      progression: null,
    };
  }

  const completedAt = new Date(latestAction.completedAt as string);
  const fourteenDaysLater = new Date(completedAt);
  fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);

  const relatedProgression = (progressionEvents ?? [])
    .map((event) => {
      const metadata = event.metadata ?? {};

      return {
        event,
        applicationId:
          typeof metadata.applicationId === "string"
            ? metadata.applicationId
            : null,
        company:
          typeof metadata.company === "string"
            ? metadata.company
            : null,
        role:
          typeof metadata.role === "string"
            ? metadata.role
            : null,
        previousStage:
          typeof metadata.previousStage === "string"
            ? metadata.previousStage
            : "",
        newStage:
          typeof metadata.newStage === "string"
            ? metadata.newStage
            : "",
      };
    })
    .filter((item) => {
      if (
        latestAction.applicationId &&
        item.applicationId &&
        latestAction.applicationId !== item.applicationId
      ) {
        return false;
      }

      if (!item.event.occurredAt) {
        return false;
      }

      const occurredAt = new Date(item.event.occurredAt).getTime();

      return (
        occurredAt > completedAt.getTime() &&
        occurredAt <= fourteenDaysLater.getTime()
      );
    })
    .sort((a, b) => {
      const aTime = new Date(a.event.occurredAt as string).getTime();
      const bTime = new Date(b.event.occurredAt as string).getTime();
      return aTime - bTime;
    });

  const firstProgression = relatedProgression[0];

  if (!firstProgression) {
    return {
      status: "UNKNOWN",
      headline: "No pipeline movement followed the application action",
      summary:
        "The completed application action has not yet been followed by a tracked stage change within 14 days.",
      evidence: [
        latestAction.company
          ? `${latestAction.company}: ${latestAction.action}`
          : `${latestAction.action}`,
        "No subsequent application progression was recorded within 14 days.",
      ],
      recommendation:
        "Hold the action pattern until more outcome data is available.",
      applicationId: latestAction.applicationId ?? null,
      action: latestAction.action ?? null,
      company: latestAction.company ?? null,
      role: latestAction.role ?? null,
      completedAt: latestAction.completedAt ?? null,
      progression: null,
    };
  }

  const progression: RecentProgression = {
    type: "application",
    company:
      firstProgression.company ??
      latestAction.company ??
      "Unknown company",
    role:
      firstProgression.role ??
      latestAction.role ??
      "Unknown role",
    previousStage: firstProgression.previousStage,
    newStage: firstProgression.newStage,
    occurredAt: firstProgression.event.occurredAt ?? null,
  };

  const signal = getProgressionSignal(progression);

  if (signal === "ADVANCING") {
    return {
      status: "POSITIVE",
      headline: "Application action was followed by progression",
      summary:
        "A tracked application stage advanced after the completed next action.",
      evidence: [
        `${latestAction.action} was completed.`,
        `${progression.previousStage} → ${progression.newStage} followed within 14 days.`,
      ],
      recommendation:
        "Repeat this application-action pattern while continuing to measure outcomes.",
      applicationId: latestAction.applicationId ?? null,
      action: latestAction.action ?? null,
      company: latestAction.company ?? null,
      role: latestAction.role ?? null,
      completedAt: latestAction.completedAt ?? null,
      progression,
    };
  }

  if (signal === "SETBACK" || signal === "CLOSED") {
    return {
      status: "NEGATIVE",
      headline: "Application action was followed by a setback",
      summary:
        "A tracked application stage moved backward or closed after the completed next action.",
      evidence: [
        `${latestAction.action} was completed.`,
        `${progression.previousStage} → ${progression.newStage} followed within 14 days.`,
      ],
      recommendation:
        "Modify this application-action pattern and gather more outcome data before repeating it broadly.",
      applicationId: latestAction.applicationId ?? null,
      action: latestAction.action ?? null,
      company: latestAction.company ?? null,
      role: latestAction.role ?? null,
      completedAt: latestAction.completedAt ?? null,
      progression,
    };
  }

  return {
    status: "NEUTRAL",
    headline: "Application action was followed by a pipeline change",
    summary:
      "A tracked stage change followed the completed next action, but the movement was not classified as advancement or setback.",
    evidence: [
      `${latestAction.action} was completed.`,
      `${progression.previousStage} → ${progression.newStage} followed within 14 days.`,
    ],
    recommendation:
      "Hold the current pattern until additional application outcomes are available.",
    applicationId: latestAction.applicationId ?? null,
    action: latestAction.action ?? null,
    company: latestAction.company ?? null,
    role: latestAction.role ?? null,
    completedAt: latestAction.completedAt ?? null,
    progression,
  };
}

export type ApplicationActionRecalibration = {
  action: string | null;
  decision: "REPEAT" | "MODIFY" | "HOLD";
  reason: string;
  evidence: string[];
};

function getApplicationActionRecalibration(
  effect: ApplicationActionEffect,
): ApplicationActionRecalibration {
  if (effect.status === "POSITIVE") {
    return {
      action: effect.action,
      decision: "REPEAT",
      reason:
        "This application action was followed by tracked pipeline progression.",
      evidence: effect.evidence,
    };
  }

  if (effect.status === "NEGATIVE") {
    return {
      action: effect.action,
      decision: "MODIFY",
      reason:
        "This application action was followed by a tracked setback or closure.",
      evidence: effect.evidence,
    };
  }

  return {
    action: effect.action,
    decision: "HOLD",
    reason:
      effect.status === "UNKNOWN"
        ? "There is not enough downstream outcome data to change the current pattern."
        : "The downstream pipeline signal is not strong enough to change the current pattern.",
    evidence: effect.evidence,
  };
}

export type ApplicationActionMemory = {
  action: string | null;
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

function getApplicationActionMemory(
  applicationActionEvents: RecoveryEngineInput["applicationActionEvents"],
  progressionEvents: RecoveryEngineInput["progressionEvents"],
): ApplicationActionMemory {
  const actions = (applicationActionEvents ?? [])
    .filter(
      (action) =>
        typeof action.action === "string" &&
        action.action.length > 0 &&
        typeof action.completedAt === "string" &&
        action.completedAt.length > 0,
    )
    .sort((a, b) => {
      const aTime = new Date(a.completedAt as string).getTime();
      const bTime = new Date(b.completedAt as string).getTime();
      return bTime - aTime;
    });

  const targetAction = actions[0]?.action ?? null;

  if (!targetAction) {
    return {
      action: null,
      instances: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      unknown: 0,
      positiveRate: null,
      negativeRate: null,
      confidence: "LOW",
      recommendation: "HOLD",
      evidence: [],
    };
  }

  const matchingActions = actions.filter(
    (action) => action.action === targetAction,
  );

  let positive = 0;
  let negative = 0;
  let neutral = 0;
  let unknown = 0;

  const evidence: string[] = [];

  for (const action of matchingActions) {
    const effect = getApplicationActionEffect(
      [action],
      progressionEvents,
    );

    if (effect.status === "POSITIVE") {
      positive += 1;
    } else if (effect.status === "NEGATIVE") {
      negative += 1;
    } else if (effect.status === "NEUTRAL") {
      neutral += 1;
    } else {
      unknown += 1;
    }

    if (effect.progression) {
      evidence.push(
        `${effect.company ?? "Application"}: ${effect.action} was followed by ${effect.progression.previousStage} → ${effect.progression.newStage}.`,
      );
    } else {
      evidence.push(
        `${effect.company ?? "Application"}: ${effect.action} has no tracked downstream progression yet.`,
      );
    }
  }

  const instances = matchingActions.length;
  const evaluated = positive + negative + neutral;

  const positiveRate =
    evaluated > 0 ? positive / evaluated : null;

  const negativeRate =
    evaluated > 0 ? negative / evaluated : null;

  let confidence: ApplicationActionMemory["confidence"] = "LOW";

  if (evaluated >= 5) {
    confidence = "HIGH";
  } else if (evaluated >= 3) {
    confidence = "MEDIUM";
  }

  let recommendation: ApplicationActionMemory["recommendation"] =
    "HOLD";

  if (
    evaluated >= 3 &&
    positive >= 2 &&
    positiveRate !== null &&
    positiveRate >= 0.67
  ) {
    recommendation = "REPEAT";
  } else if (
    evaluated >= 3 &&
    negative >= 2 &&
    negativeRate !== null &&
    negativeRate >= 0.67
  ) {
    recommendation = "RETIRE";
  } else if (
    evaluated >= 3 &&
    positive > 0 &&
    negative > 0
  ) {
    recommendation = "MODIFY";
  }

  return {
    action: targetAction,
    instances,
    positive,
    negative,
    neutral,
    unknown,
    positiveRate,
    negativeRate,
    confidence,
    recommendation,
    evidence,
  };
}

