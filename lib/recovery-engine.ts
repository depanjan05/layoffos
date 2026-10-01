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

export type RecoveryActionExplanation = {
  why: string;
  signals: string[];
  decision: string;
};

export type RecoveryDecisionSelectionContext = {
  pass: "CRITICAL_RUNWAY" | "DIVERSITY" | "RANKED_FILL" | "NOT_SELECTED";
  reason: string;
  competingCandidate?: string;
  competingScore?: number;
};

export type RecoveryDecisionCandidate = {
  title: string;
  href: string;
  priority: RecoveryPriority;
  category: string;
  basePriority: number;
  adjustments: Array<{
    label: string;
    delta: number;
  }>;
  finalScore: number;
  rank: number;
  selection: "SELECTED" | "NOT_SELECTED";
  selectionReason: string;
  selectionContext: RecoveryDecisionSelectionContext;
};

export type RecoveryDecision = {
  decision: string;
  objective: string;
  evidence: string[];
  constraints: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type RecoveryStrategy = {
  strategy: string;
  objective: string;
  approach: string[];
  guardrails: string[];
  successSignals: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type RecoveryExecutionPlan = {
  objective: string;
  sequence: string[];
  immediateAction: string;
  supportingActions: string[];
  avoidActions: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
};


export type RecoveryActionDecisionTrace = {
  basePriority: number;
  adjustments: Array<{
    label: string;
    delta: number;
  }>;
  finalScore: number;
  rank: number;
  selection: "SELECTED" | "NOT_SELECTED";
  selectionReason: string;
  alternatives: RecoveryDecisionCandidate[];
};

export type RecoveryAction = {
  title: string;
  reason: string;
  href: string;
  priority: RecoveryPriority;
  evidence?: string;
  explanation?: RecoveryActionExplanation;
  decisionTrace?: RecoveryActionDecisionTrace;
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

export type RecoveryOutcomeIntelligence = {
  direction: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  impact: "HIGH" | "MEDIUM" | "LOW";
  implication: string;
  evidence: string[];
};

export type RecoveryOutcome = {
  status: "POSITIVE" | "MIXED" | "NEGATIVE" | "NONE";
  headline: string;
  summary: string;
  evidence: string[];
  recommendation: string;
};

export type RecoveryLearning = {
  pattern: string;
  learning: string;
  evidence: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type RecoveryRecalibration = {
  trigger: string;
  signal: string;
  decisionStatus: "HOLD" | "REASSESS";
  strategyStatus: "HOLD" | "REASSESS";
  learningEffect: "SUPPORTS" | "CHALLENGES" | "INSUFFICIENT";
  executionEffect: "SUPPORTS" | "CHALLENGES" | "INSUFFICIENT";
  nextStep: string;
  rationale: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type RecoveryCycleState = {
  status: "CONTINUE" | "REASSESS" | "RESET";
  reason: string;
  source: RecoveryRecalibration["decisionStatus"] | "PERSISTENCE_RESET";
};

export type RecoveryCycleMemory = {
  previousStatus: RecoveryCycleState["status"] | null;
  currentStatus: RecoveryCycleState["status"];
  carriedForward: boolean;
  rationale: string;
};

export type RecoveryCycleTransition = {
  from: RecoveryCycleState["status"] | null;
  to: RecoveryCycleState["status"];
  transition:
    | "INITIAL"
    | "UNCHANGED"
    | "PROGRESSED"
    | "REGRESSED"
    | "RESET";
  changed: boolean;
  rationale: string;
};

export type RecoveryCycleTransitionMemory = {
  previousTransition: RecoveryCycleTransition["transition"] | null;
  currentTransition: RecoveryCycleTransition["transition"];
  repeated: boolean;
  rationale: string;
};

export type RecoveryCycleTransitionPatternPersistence = {
  pattern: RecoveryCycleTransitionPattern["pattern"];
  occurrences: number;
  persistent: boolean;
  rationale: string;
};
export type RecoveryCycleTransitionPatternResponse = {
  pattern: RecoveryCycleTransitionPattern["pattern"];
  persistent: boolean;
  response: "NONE" | "CONTINUE" | "REASSESS" | "RESET";
  rationale: string;
};

export type RecoveryCycleTransitionPatternConsequence = {
  response: RecoveryCycleTransitionPatternResponse["response"];
  consequence: "NONE" | "MAINTAIN" | "REASSESS" | "RESET";
  rationale: string;
};

export type RecoveryCycleTransitionPatternConsequenceMemory = {
  previousConsequence:
    | RecoveryCycleTransitionPatternConsequence["consequence"]
    | null;
  currentConsequence:
    RecoveryCycleTransitionPatternConsequence["consequence"];
  repeated: boolean;
  rationale: string;
};

export type RecoveryCycleTransitionPatternConsequencePersistence = {
  consequence:
    RecoveryCycleTransitionPatternConsequence["consequence"];
  occurrences: number;
  persistent: boolean;
  rationale: string;
};

export type RecoveryCycleTransitionPatternConsequenceResponse = {
  consequence:
    RecoveryCycleTransitionPatternConsequence["consequence"];
  persistent: boolean;
  response: "NONE" | "MAINTAIN" | "REASSESS" | "RESET";
  rationale: string;
};

export type RecoveryCycleTransitionPatternConsequenceResponseMemory = {
  previousResponse:
    | RecoveryCycleTransitionPatternConsequenceResponse["response"]
    | null;
  currentResponse:
    RecoveryCycleTransitionPatternConsequenceResponse["response"];
  repeated: boolean;
  rationale: string;
};

export type RecoveryCycleTransitionPatternConsequenceResponsePersistence = {
  response:
    RecoveryCycleTransitionPatternConsequenceResponse["response"];
  occurrences: number;
  persistent: boolean;
  rationale: string;
};

export type RecoveryCycleTransitionPatternConsequenceResponseConsequence = {
  response:
    RecoveryCycleTransitionPatternConsequenceResponse["response"];
  consequence: "NONE" | "MAINTAIN" | "REASSESS" | "RESET";
  rationale: string;
};

export type RecoveryCycleTransitionPatternConsequenceResponseConsequenceMemory = {
  previousConsequence:
    | RecoveryCycleTransitionPatternConsequenceResponseConsequence["consequence"]
    | null;
  currentConsequence:
    RecoveryCycleTransitionPatternConsequenceResponseConsequence["consequence"];
  repeated: boolean;
  rationale: string;
};

export function getRecoveryCycleTransitionPatternConsequenceResponseConsequenceMemory(
  previousConsequence:
    | RecoveryCycleTransitionPatternConsequenceResponseConsequence["consequence"]
    | null
    | undefined,
  currentConsequence:
    RecoveryCycleTransitionPatternConsequenceResponseConsequence["consequence"],
): RecoveryCycleTransitionPatternConsequenceResponseConsequenceMemory {
  const previous = previousConsequence ?? null;

  if (previous === null) {
    return {
      previousConsequence: null,
      currentConsequence,
      repeated: false,
      rationale:
        "No previous recovery cycle transition pattern consequence response consequence is available, so the current consequence establishes the initial consequence context.",
    };
  }

  if (previous === currentConsequence) {
    return {
      previousConsequence: previous,
      currentConsequence,
      repeated: true,
      rationale:
        `The previous recovery cycle transition pattern consequence response consequence was ${previous}, and the current consequence is also ${currentConsequence}, so the consequence is carried forward.`,
    };
  }

  return {
    previousConsequence: previous,
    currentConsequence,
    repeated: false,
    rationale:
      `The previous recovery cycle transition pattern consequence response consequence was ${previous}, but the current consequence is ${currentConsequence}, so the consequence has changed.`,
  };
}



export type RecoveryCycleTransitionPatternMemory = {
  previousPattern: RecoveryCycleTransitionPattern["pattern"] | null;
  currentPattern: RecoveryCycleTransitionPattern["pattern"];
  repeated: boolean;
  rationale: string;
};

export type RecoveryCycleTransitionPattern = {
  transition: RecoveryCycleTransition["transition"];
  occurrences: number;
  repeated: boolean;
  pattern: "NONE" | "REPEATING" | "PERSISTENT";
  rationale: string;
};

export type RecoveryDirection = {
  direction:
    | "CONTINUE"
    | "INTENSIFY"
    | "SHIFT"
    | "REBUILD"
    | "CLOSEOUT";
  rationale: string;
  evidence: string[];
  source:
    | "RECOVERY"
    | "ADVANCEMENT"
    | "SETBACK"
    | "CLOSURE"
    | "INSUFFICIENT";
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type RecoveryDirectionMemory = {
  changed: boolean;
  previousDirection: RecoveryDirection["direction"] | null;
  currentDirection: RecoveryDirection["direction"];
  source: RecoveryDirection["source"];
  rationale: string;
  evidence: string[];
  confidence: RecoveryDirection["confidence"];
};


export type RecoveryDirectionStability = {
  status: "INITIAL" | "STABLE" | "CHANGED" | "RESET";
  previousDirection: RecoveryDirection["direction"] | null;
  currentDirection: RecoveryDirection["direction"];
  rationale: string;
  confidence: RecoveryDirection["confidence"];
};

export type RecoveryDirectionPersistence = {
  direction: RecoveryDirection["direction"];
  consecutiveCycles: number;
  status: "NEW" | "PERSISTING" | "RESET";
  rationale: string;
  confidence: RecoveryDirection["confidence"];
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
  previousRecoveryDirection?: RecoveryDirection["direction"] | null;
  previousRecoveryDirectionCycles?: number;
  previousRecoveryCycleState?: RecoveryCycleState | null;
  previousRecoveryCycleTransition?:
    | RecoveryCycleTransition["transition"]
    | null;
  previousRecoveryCycleTransitionPattern?: RecoveryCycleTransitionPattern | null;
  previousRecoveryCycleTransitionPatternConsequence?:
    | RecoveryCycleTransitionPatternConsequence["consequence"]
    | null;
  previousRecoveryCycleTransitionPatternConsequencePersistence?:
    | RecoveryCycleTransitionPatternConsequencePersistence
    | null;
  previousRecoveryCycleTransitionPatternConsequenceResponse?:
    | RecoveryCycleTransitionPatternConsequenceResponse["response"]
    | null;
  previousRecoveryCycleTransitionPatternConsequenceResponseMemory?:
    | RecoveryCycleTransitionPatternConsequenceResponseMemory
    | null;
  previousRecoveryCycleTransitionPatternConsequenceResponsePersistence?:
    | RecoveryCycleTransitionPatternConsequenceResponsePersistence
    | null;
  previousRecoveryCycleTransitionPatternConsequenceResponseConsequence?:
    | RecoveryCycleTransitionPatternConsequenceResponseConsequence["consequence"]
    | null;
  previousRecoveryCycleTransitionPatternConsequenceResponseConsequenceMemory?:
    | RecoveryCycleTransitionPatternConsequenceResponseConsequenceMemory
    | null;
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

export function getWeeklyPlanTaskEffect(
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


export function getActionMemory(
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
  outcomeIntelligence: RecoveryOutcomeIntelligence;
  learning: RecoveryLearning;
  recalibration: RecoveryRecalibration;
  actionEffect: RecoveryActionEffect;
  actionRecalibration: ActionRecalibration;
  actionMemory: ActionMemory;
  weeklyPlanTaskEffect: WeeklyPlanTaskEffect;
  priorities: RecoveryPriority[];
  recoveryDecision: RecoveryDecision;
  recoveryStrategy: RecoveryStrategy;
  recoveryExecutionPlan: RecoveryExecutionPlan;
  executionActions: RecoveryExecutionAction[];
  recoveryRecalibration: RecoveryRecalibration;
  recoveryCycleState: RecoveryCycleState;
  recoveryCycleMemory: RecoveryCycleMemory;
  recoveryCycleTransition: RecoveryCycleTransition;
  recoveryCycleTransitionMemory: RecoveryCycleTransitionMemory;
  recoveryCycleTransitionPattern: RecoveryCycleTransitionPattern;
  recoveryCycleTransitionPatternMemory: RecoveryCycleTransitionPatternMemory;
  recoveryCycleTransitionPatternPersistence: RecoveryCycleTransitionPatternPersistence;
  recoveryCycleTransitionPatternResponse: RecoveryCycleTransitionPatternResponse;
  recoveryCycleTransitionPatternConsequence: RecoveryCycleTransitionPatternConsequence;
  recoveryCycleTransitionPatternConsequenceMemory:
    RecoveryCycleTransitionPatternConsequenceMemory;
  recoveryCycleTransitionPatternConsequencePersistence:
    RecoveryCycleTransitionPatternConsequencePersistence;
  recoveryCycleTransitionPatternConsequenceResponse:
    RecoveryCycleTransitionPatternConsequenceResponse;
  recoveryCycleTransitionPatternConsequenceResponseMemory:
    RecoveryCycleTransitionPatternConsequenceResponseMemory;
  recoveryCycleTransitionPatternConsequenceResponsePersistence:
    RecoveryCycleTransitionPatternConsequenceResponsePersistence;
  recoveryCycleTransitionPatternConsequenceResponseConsequence:
    RecoveryCycleTransitionPatternConsequenceResponseConsequence;
    recoveryCycleTransitionPatternConsequenceResponseConsequenceMemory:
    RecoveryCycleTransitionPatternConsequenceResponseConsequenceMemory;
recoveryDirection: RecoveryDirection;
  recoveryDirectionMemory: RecoveryDirectionMemory;
  recoveryDirectionStability: RecoveryDirectionStability;
  recoveryDirectionPersistence: RecoveryDirectionPersistence;
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

export function getState(input: RecoveryEngineInput): RecoveryState {
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

function getActionExplanation(
  input: RecoveryEngineInput,
  action: RecoveryAction,
  state: RecoveryState,
  runwayMonths: number | null,
  pipelineSignal: PipelineSignal,
  pipelineComposition: PipelineComposition,
  evidence?: string
): RecoveryActionExplanation {
  const bottleneck = getRecoveryBottleneck(
    state,
    runwayMonths,
    pipelineSignal,
    pipelineComposition
  );

  const title = normalize(action.title);

  const activeInterviews = pipelineComposition.activeInterviews;
  const finalRounds = pipelineComposition.finalRounds;
  const activeApplications = pipelineComposition.activeApplications;
  const offers = pipelineComposition.offers;
  const acceptedOffers = pipelineComposition.acceptedOffers;
  const activeNetworkContacts = pipelineComposition.activeNetworkContacts;

  let why: string;
  let decision: string;
  let signals: string[] = [];

  if (title.includes("final-round talking points")) {
    why =
      finalRounds > 0
        ? `A final-round opportunity is active, so preparation is now more important than adding more pipeline volume.`
        : `The recovery plan is prioritizing interview execution and preparation.`;

    decision =
      "Prioritize execution of the strongest downstream opportunity.";

    signals = [
      `${finalRounds} final-round opportunit${finalRounds === 1 ? "y" : "ies"}`,
      "FINAL ROUND recovery state",
      "Final-round execution bottleneck",
    ];
  } else if (title.includes("final-round follow-up")) {
    why =
      "Your final-round record already has a follow-up or next action that needs attention.";

    decision =
      "Close the next communication step before moving attention elsewhere.";

    signals = [
      `${finalRounds} final-round opportunit${finalRounds === 1 ? "y" : "ies"}`,
      "Follow-up or next action recorded",
      "FINAL ROUND recovery state",
    ];
  } else if (title.includes("final-round logistics")) {
    why =
      "A final-round opportunity is active, making logistics and timing immediately important.";

    decision =
      "Remove execution friction from the strongest downstream opportunity.";

    signals = [
      `${finalRounds} final-round opportunit${finalRounds === 1 ? "y" : "ies"}`,
      "FINAL ROUND recovery state",
      "Execution bottleneck",
    ];
  } else if (title.includes("advance an active interview")) {
    why =
      activeInterviews > 0
        ? `You have ${activeInterviews} active interview${
            activeInterviews === 1 ? "" : "s"
          } and no final round yet, so the next interview action is the clearest path forward.`
        : "Interview execution is the current downstream recovery focus.";

    decision =
      "Move the strongest active interview toward the next pipeline stage.";

    signals = [
      `${activeInterviews} active interview${activeInterviews === 1 ? "" : "s"}`,
      "No final round yet",
      "INTERVIEWING recovery state",
    ];
  } else if (title.includes("prepare for your next interview")) {
    why =
      "An active interview opportunity needs preparation while the opportunity is still moving through the pipeline.";

    decision =
      "Protect the strongest active interview from avoidable execution gaps.";

    signals = [
      `${activeInterviews} active interview${activeInterviews === 1 ? "" : "s"}`,
      "Interview-stage opportunity",
      "INTERVIEWING recovery state",
    ];
  } else if (title.includes("review your interview follow-ups")) {
    why =
      "At least one active interview already has a follow-up or next action recorded.";

    decision =
      "Complete the outstanding interview action before adding unnecessary activity.";

    signals = [
      `${activeInterviews} active interview${activeInterviews === 1 ? "" : "s"}`,
      "Follow-up or next action recorded",
      "INTERVIEWING recovery state",
    ];
  } else if (title.includes("convert applications into conversations")) {
    why =
      activeApplications > 0
        ? `You have ${activeApplications} active application${
            activeApplications === 1 ? "" : "s"
          } but no active interview, so conversion is currently more valuable than simply adding volume.`
        : "The current recovery plan needs stronger application-to-conversation conversion.";

    decision =
      "Turn existing applications into conversations before expanding volume.";

    signals = [
      `${activeApplications} active application${
        activeApplications === 1 ? "" : "s"
      }`,
      "No active interviews",
      "APPLICATION_HEAVY pipeline",
    ];
  } else if (title.includes("review your active application pipeline")) {
    why =
      "Existing applications still need movement while the recovery pipeline is being managed.";

    decision =
      "Keep active opportunities moving instead of allowing applications to become passive entries.";

    signals = [
      `${activeApplications} active application${
        activeApplications === 1 ? "" : "s"
      }`,
      "Active application pipeline",
      state.replaceAll("_", " ") + " recovery state",
    ];
  } else if (
    title.includes("add your first target application") ||
    title.includes("add your next target application") ||
    title.includes("add a new target opportunity")
  ) {
    why =
      "The active search pipeline needs another concrete opportunity to create forward movement.";

    decision =
      "Create a specific opportunity rather than leaving the search pipeline empty.";

    signals = [
      "No downstream interview opportunity",
      "Search pipeline needs depth",
      state.replaceAll("_", " ") + " recovery state",
    ];
  } else if (title.includes("follow up with an active network contact")) {
    why =
      "You already have a networking follow-up recorded, so there is an immediate warm path that can be advanced.";

    decision =
      "Use the existing relationship before creating another cold path.";

    signals = [
      `${activeNetworkContacts} active network contact${
        activeNetworkContacts === 1 ? "" : "s"
      }`,
      "Active network follow-up",
      "NETWORKING priority",
    ];
  } else if (title.includes("turn a network contact into an opportunity")) {
    why =
      "You have active network relationships but no active application or interview pipeline.";

    decision =
      "Convert a warm relationship into a concrete opportunity.";

    signals = [
      `${activeNetworkContacts} active network contact${
        activeNetworkContacts === 1 ? "" : "s"
      }`,
      "No active application or interview pipeline",
      "NETWORKING priority",
    ];
  } else if (
    title.includes("start a referral conversation") ||
    title.includes("create a new networking path") ||
    title.includes("reopen a warm referral path")
  ) {
    why =
      "A warm networking path can add another opportunity while the current pipeline remains unresolved.";

    decision =
      "Create another path into the opportunity pipeline without relying only on applications.";

    signals = [
      "Networking path available",
      "Pipeline needs additional capacity",
      "NETWORKING priority",
    ];
  } else if (
    title.includes("review your financial runway") ||
    action.href === "/runway"
  ) {
    why =
      runwayMonths !== null && runwayMonths < 4
        ? `Your estimated runway is ${runwayMonths.toFixed(
            1
          )} months, so financial visibility is an immediate recovery constraint.`
        : "Financial visibility keeps the recovery strategy grounded in the time available.";

    decision =
      "Keep financial runway visible while making recovery decisions.";

    signals = [
      runwayMonths !== null
        ? `${runwayMonths.toFixed(1)} months of estimated runway`
        : "Runway data available",
      "FINANCIAL priority",
      "Recovery time horizon",
    ];
  } else if (title.includes("keep one backup opportunity moving")) {
    why =
      offers > 0 || acceptedOffers > 0
        ? "An offer-stage opportunity is active, but keeping another path moving protects against an unresolved outcome."
        : "The recovery pipeline benefits from maintaining another active path alongside the strongest opportunity.";

    decision =
      "Protect pipeline continuity while the strongest opportunity remains unresolved.";

    signals = [
      offers > 0
        ? `${offers} offer-stage opportunit${offers === 1 ? "y" : "ies"}`
        : acceptedOffers > 0
          ? `${acceptedOffers} accepted offer${
              acceptedOffers === 1 ? "" : "s"
            }`
          : "Active downstream opportunity",
      "Backup pipeline recommended",
      state.replaceAll("_", " ") + " recovery state",
    ];
  } else if (title.includes("confirm your accepted offer")) {
    why =
      "An offer has already been accepted, so the recovery process is now about completing the employment transition.";

    decision =
      "Close the remaining transition details instead of treating the search as the primary task.";

    signals = [
      `${acceptedOffers} accepted offer${acceptedOffers === 1 ? "" : "s"}`,
      "OFFER recovery state",
      "Transition completion",
    ];
  } else if (
    title.includes("review your active offer") ||
    title.includes("review your offer pipeline")
  ) {
    why =
      "An offer-stage opportunity is active but has not yet completed the decision and transition process.";

    decision =
      "Resolve the active offer before treating the recovery pipeline as complete.";

    signals = [
      `${offers} offer-stage opportunit${offers === 1 ? "y" : "ies"}`,
      "Active offer decision",
      "OFFER recovery state",
    ];
  } else if (title.includes("review compensation and decision dates")) {
    why =
      "An offer-stage process makes compensation and timing materially important to the next decision.";

    decision =
      "Make the financial and timing implications explicit before the next transition.";

    signals = [
      offers > 0
        ? `${offers} offer-stage opportunit${offers === 1 ? "y" : "ies"}`
        : "Offer-stage decision",
      "Compensation and timing",
      "OFFER priority",
    ];
  } else if (
    title.includes("identify 3 replacement target roles") ||
    title.includes("replacement target")
  ) {
    why =
      "A recent opportunity setback reduced pipeline capacity, so replacement opportunities are needed to restore coverage.";

    decision =
      "Replace lost pipeline capacity with concrete target opportunities.";

    signals = [
      "Recent setback signal",
      "Pipeline capacity reduced",
      "APPLICATIONS priority",
    ];
  } else if (title.includes("complete your first 72 hours")) {
    why =
      "The immediate post-layoff workflow has not yet been fully established.";

    decision =
      "Stabilize the basic recovery operating system before adding unnecessary activity.";

    signals = [
      "JUST LAID OFF recovery state",
      "Immediate recovery workflow",
      "Stabilization required",
    ];
  } else if (title.includes("confirm your financial runway")) {
    why =
      "Knowing the actual runway gives every subsequent recovery decision a realistic time horizon.";

    decision =
      "Establish the financial baseline before optimizing the search.";

    signals = [
      "Immediate post-layoff stage",
      "Financial baseline missing",
      "FINANCIAL priority",
    ];
  } else if (title.includes("build your target company list")) {
    why =
      "A defined target-company set turns a broad search into a concrete opportunity pipeline.";

    decision =
      "Create a focused target universe for the next search actions.";

    signals = [
      "Target company pipeline",
      "Search direction",
      "APPLICATIONS priority",
    ];
  } else if (state === "RECOVERED") {
    why =
      "Employment status indicates that the recovery process has reached its closeout stage.";

    decision =
      "Close the recovery loop and preserve the useful record.";

    signals = [
      "RECOVERED state",
      "Employment resumed",
      "Recovery closeout",
    ];
  } else {
    why = `The current recovery evidence points toward ${bottleneck.focus.toLowerCase()}.`;

    decision =
      action.priority === "INTERVIEWS"
        ? "Interview execution is the current downstream recovery focus."
        : action.priority === "APPLICATIONS"
          ? "Building or converting the opportunity pipeline is the current search focus."
          : action.priority === "NETWORKING"
            ? "Networking is being used as an additional path into the opportunity pipeline."
            : action.priority === "FINANCIAL"
              ? "Financial visibility is being prioritized because runway can constrain the recovery strategy."
              : "This action supports the current recovery operating structure.";

    signals = [
      bottleneck.headline,
      `${state.replaceAll("_", " ")} recovery state`,
    ];

    if (evidence) {
      signals.unshift(evidence);
    }
  }

  return {
    why,
    signals: [...new Set(signals)].filter(Boolean).slice(0, 3),
    decision,
  };
}

function getBaseRecoveryDecision(
  input: RecoveryEngineInput,
  state: RecoveryState,
  runwayMonths: number | null,
  recentProgression: RecentProgression | null,
  progressionSignal: ProgressionSignal,
  pipelineSignal: PipelineSignal,
  pipelineComposition: PipelineComposition,
  recoveryDirection?: RecoveryDirection,
): RecoveryDecision {
  if (recoveryDirection?.direction === "CLOSEOUT") {
    return {
      decision: "Close out recovery",
      objective:
        "Complete the transition into stable employment and preserve the recovery gains.",
      evidence: recoveryDirection.evidence,
      constraints: [],
      confidence: recoveryDirection.confidence,
    };
  }

  if (recoveryDirection?.direction === "REBUILD") {
    return {
      decision: "Rebuild the recovery pipeline",
      objective:
        "Replace lost opportunity capacity and restore sufficient qualified recovery pipeline.",
      evidence: recoveryDirection.evidence,
      constraints: [],
      confidence: recoveryDirection.confidence,
    };
  }

  if (recoveryDirection?.direction === "SHIFT") {
    return {
      decision:
        pipelineComposition.activeApplications > 0 ||
        pipelineComposition.activeInterviews > 0
          ? "Prioritize application conversion"
          : "Build recovery pipeline",
      objective:
        "Change the current recovery path in response to evidence that weakened the previous direction.",
      evidence: recoveryDirection.evidence,
      constraints: [],
      confidence: recoveryDirection.confidence,
    };
  }

  if (recoveryDirection?.direction === "INTENSIFY") {
    return {
      decision:
        state === "OFFER"
          ? "Prioritize offer execution"
          : state === "FINAL_ROUND"
            ? "Prioritize final-round progression"
            : "Prioritize interview progression",
      objective:
        "Concentrate recovery effort on the active opportunity showing meaningful progression.",
      evidence: recoveryDirection.evidence,
      constraints: [],
      confidence: recoveryDirection.confidence,
    };
  }

  const evidence: string[] = [];
  const constraints: string[] = [];

  const hasAcceptedOffer =
    pipelineComposition.acceptedOffers > 0;

  const hasOffer =
    pipelineComposition.offers > 0;

  const hasFinalRound =
    pipelineComposition.finalRounds > 0;

  const hasActiveInterviews =
    pipelineComposition.activeInterviews > 0;

  const hasActiveApplications =
    pipelineComposition.activeApplications > 0;

  const hasCriticalRunway =
    runwayMonths !== null && runwayMonths < 2;

  const hasLimitedRunway =
    runwayMonths !== null &&
    runwayMonths >= 2 &&
    runwayMonths < 4;

  const isApplicationConversionContext =
    hasActiveApplications &&
    pipelineComposition.activeInterviews === 0 &&
    pipelineComposition.finalRounds === 0 &&
    pipelineComposition.offers === 0;

  if (state === "RECOVERED") {
    evidence.push("Recovery state is RECOVERED");

    return {
      decision: "Close out recovery",
      objective:
        "Complete the transition into stable employment and preserve the recovery gains.",
      evidence,
      constraints,
      confidence: "HIGH",
    };
  }

  if (hasAcceptedOffer || hasOffer || state === "OFFER") {
    evidence.push("An active offer-stage recovery opportunity exists");

    if (hasAcceptedOffer) {
      evidence.push("An accepted offer is present");
    }

    if (hasOffer) {
      evidence.push("An offer-stage opportunity is present");
    }

    if (runwayMonths !== null) {
      evidence.push(
        `Runway is ${runwayMonths} month${runwayMonths === 1 ? "" : "s"}`,
      );
    }

    constraints.push(
      "Recommendation capacity should remain focused on completing the active recovery transition.",
    );

    return {
      decision: "Prioritize offer execution",
      objective:
        "Convert the strongest active offer opportunity into a completed recovery transition.",
      evidence: [...new Set(evidence)],
      constraints,
      confidence: "HIGH",
    };
  }

  if (hasCriticalRunway) {
    evidence.push("Runway is below two months");

    if (hasActiveInterviews) {
      evidence.push("Active interview opportunities still exist");
    }

    if (hasActiveApplications) {
      evidence.push("Active application opportunities still exist");
    }

    constraints.push(
      "Financial runway is a critical recovery constraint.",
    );

    constraints.push(
      "The recovery strategy must preserve the shortest viable path back to employment.",
    );

    return {
      decision: "Stabilize runway while maintaining recovery momentum",
      objective:
        "Protect financial runway while preserving the shortest viable path back to employment.",
      evidence: [...new Set(evidence)],
      constraints: [...new Set(constraints)],
      confidence: "HIGH",
    };
  }

  if (hasFinalRound || state === "FINAL_ROUND") {
    evidence.push("A final-round recovery opportunity exists");

    if (recentProgression && progressionSignal === "ADVANCING") {
      evidence.push(
        `Recent progression advanced at ${recentProgression.company}`,
      );
    }

    constraints.push(
      "Near-term interview execution takes precedence over broad pipeline expansion.",
    );

    return {
      decision: "Prioritize final-round progression",
      objective:
        "Convert the strongest late-stage opportunity into the next recovery transition.",
      evidence: [...new Set(evidence)],
      constraints,
      confidence: "HIGH",
    };
  }

  if (hasActiveInterviews || state === "INTERVIEWING") {
    evidence.push("Active interview opportunities exist");

    if (pipelineComposition.finalRounds > 0) {
      evidence.push("The pipeline contains a final-round opportunity");
    }

    constraints.push(
      "Interview progression should be protected before broad application volume is increased.",
    );

    return {
      decision: "Prioritize interview progression",
      objective:
        "Move active interview opportunities toward final rounds or offers.",
      evidence: [...new Set(evidence)],
      constraints,
      confidence: "HIGH",
    };
  }

  if (progressionSignal === "SETBACK" || progressionSignal === "CLOSED") {
    evidence.push(
      progressionSignal === "SETBACK"
        ? "The latest tracked opportunity produced a setback"
        : "The latest tracked opportunity was closed",
    );

    if (recentProgression) {
      evidence.push(
        `${recentProgression.company} is the latest tracked opportunity change`,
      );
    }

    if (hasLimitedRunway) {
      evidence.push("Runway is below four months");

      constraints.push(
        "Limited runway reduces tolerance for an extended search without measurable pipeline progress.",
      );
    }

    return {
      decision: "Rebuild the recovery pipeline",
      objective:
        "Replace lost opportunity capacity while learning from the latest pipeline change.",
      evidence: [...new Set(evidence)],
      constraints: [...new Set(constraints)],
      confidence: "MEDIUM",
    };
  }

  if (isApplicationConversionContext) {
    evidence.push(
      `${pipelineComposition.activeApplications} active application${pipelineComposition.activeApplications === 1 ? "" : "s"} in the pipeline`,
    );

    evidence.push(
      "Active applications have not yet produced downstream interview opportunities",
    );

    if (pipelineSignal === "ACTIVE") {
      evidence.push("The recovery pipeline is active");
    }

    constraints.push(
      "Additional application volume should not replace efforts to convert existing applications into conversations.",
    );

    return {
      decision: "Prioritize application conversion",
      objective:
        "Turn existing application volume into active conversations and downstream opportunities.",
      evidence: [...new Set(evidence)],
      constraints,
      confidence: "HIGH",
    };
  }

  if (hasActiveApplications) {
    evidence.push(
      `${pipelineComposition.activeApplications} active application${pipelineComposition.activeApplications === 1 ? "" : "s"} in the pipeline`,
    );

    return {
      decision: "Maintain active job search",
      objective:
        "Keep qualified opportunities moving while strengthening downstream pipeline depth.",
      evidence: [...new Set(evidence)],
      constraints,
      confidence: "MEDIUM",
    };
  }

  if (hasLimitedRunway) {
    evidence.push("Runway is below four months");

    constraints.push(
      "Limited runway reduces tolerance for an extended search without measurable pipeline progress.",
    );
  }

  if (pipelineSignal === "BUILDING") {
    evidence.push("The recovery pipeline is being built");
  }

  if (pipelineSignal === "THIN") {
    evidence.push("The recovery pipeline is thin");
  }

  evidence.push("No downstream recovery opportunity is currently active");

  return {
    decision: "Build recovery pipeline",
    objective:
      "Create enough qualified opportunities to move the recovery process into active progression.",
    evidence: [...new Set(evidence)],
    constraints: [...new Set(constraints)],
    confidence: "MEDIUM",
  };
}

export function getRecoveryDecision(
  input: RecoveryEngineInput,
  state: RecoveryState,
  runwayMonths: number | null,
  recentProgression: RecentProgression | null,
  progressionSignal: ProgressionSignal,
  pipelineSignal: PipelineSignal,
  pipelineComposition: PipelineComposition,
  recoveryDirection?: RecoveryDirection,
  recoveryDirectionPersistence?: RecoveryDirectionPersistence,
): RecoveryDecision {
  const decision = getBaseRecoveryDecision(
    input,
    state,
    runwayMonths,
    recentProgression,
    progressionSignal,
    pipelineSignal,
    pipelineComposition,
    recoveryDirection,
  );

  if (
    recoveryDirection === undefined ||
    recoveryDirectionPersistence === undefined
  ) {
    return decision;
  }

  if (recoveryDirectionPersistence.status === "PERSISTING") {
    return {
      ...decision,
      evidence: [
        ...decision.evidence,
        `Recovery direction ${recoveryDirection.direction} has persisted for ${recoveryDirectionPersistence.consecutiveCycles} consecutive cycles.`,
      ],
    };
  }

  if (recoveryDirectionPersistence.status === "RESET") {
    return {
      ...decision,
      evidence: [
        ...decision.evidence,
        "Recovery direction persistence was reset, so the current decision should be evaluated against the newly established path.",
      ],
    };
  }

  return {
    ...decision,
    evidence: [
      ...decision.evidence,
      "The current recovery direction is newly established and does not yet have persistence across cycles.",
    ],
  };
}


function getBaseRecoveryStrategy(
  decision: RecoveryDecision,
): RecoveryStrategy {
  switch (decision.decision) {
    case "Close out recovery":
      return {
        strategy: "Complete the recovery transition",
        objective:
          "Finish the transition into stable employment while preserving the gains already made.",
        approach: [
          "Complete outstanding transition steps",
          "Confirm the employment transition is fully operational",
          "Protect the financial and professional gains created by the recovery",
        ],
        guardrails: [
          "Do not treat recovery as complete until the transition is operationally stable.",
        ],
        successSignals: [
          "Employment transition is completed",
          "Outstanding recovery tasks are closed",
          "Financial and professional stability is preserved",
        ],
        confidence: decision.confidence,
      };

    case "Prioritize offer execution":
      return {
        strategy: "Convert the strongest offer opportunity into completed employment",
        objective:
          "Move the active offer-stage opportunity through the remaining steps required for a completed recovery transition.",
        approach: [
          "Complete outstanding offer and decision steps",
          "Resolve open questions or blockers on the active offer",
          "Maintain appropriate backup coverage until the transition is secure",
        ],
        guardrails: [
          "Do not allow broad pipeline activity to displace critical offer execution.",
        ],
        successSignals: [
          "Offer decision is completed",
          "Required transition steps are completed",
          "Employment status moves toward recovered",
        ],
        confidence: decision.confidence,
      };

    case "Stabilize runway while maintaining recovery momentum":
      return {
        strategy: "Protect runway while preserving the shortest viable recovery path",
        objective:
          "Reduce financial pressure without abandoning the strongest active recovery opportunities.",
        approach: [
          "Protect immediate financial runway",
          "Prioritize active opportunities with the shortest path to progression",
          "Continue only the recovery activities that preserve meaningful momentum",
        ],
        guardrails: [
          "Do not trade away near-term recovery opportunities solely for additional search volume.",
          "Financial stabilization must remain compatible with continued recovery progress.",
        ],
        successSignals: [
          "Runway pressure is reduced or stabilized",
          "Active opportunities continue progressing",
          "Recovery momentum is preserved",
        ],
        confidence: decision.confidence,
      };

    case "Prioritize final-round progression":
      return {
        strategy: "Concentrate effort on final-round execution",
        objective:
          "Convert the strongest late-stage opportunity into the next recovery transition.",
        approach: [
          "Prepare specifically for the final-round requirements",
          "Complete targeted follow-up with the opportunity",
          "Remove avoidable blockers between final round and offer",
        ],
        guardrails: [
          "Do not let broad application volume dilute final-round preparation.",
        ],
        successSignals: [
          "Final-round opportunity advances",
          "Decision-stage activity increases",
          "An offer or equivalent downstream transition is created",
        ],
        confidence: decision.confidence,
      };

    case "Prioritize interview progression":
      return {
        strategy: "Convert active interviews into late-stage opportunities",
        objective:
          "Move active interview opportunities toward final rounds or offers.",
        approach: [
          "Prepare for the next interview stage",
          "Follow up on active interview opportunities",
          "Prioritize opportunities showing meaningful progression signals",
        ],
        guardrails: [
          "Protect interview execution before materially increasing broad application volume.",
        ],
        successSignals: [
          "Interviews advance to later stages",
          "Follow-up produces concrete next steps",
          "Final-round or offer-stage opportunities emerge",
        ],
        confidence: decision.confidence,
      };

    case "Rebuild the recovery pipeline":
      return {
        strategy: "Replace lost opportunity capacity",
        objective:
          "Restore enough qualified pipeline depth to compensate for the latest setback or closure.",
        approach: [
          "Replace recently lost opportunity capacity",
          "Rebuild qualified applications and conversations",
          "Learn from the latest pipeline change when selecting replacement opportunities",
        ],
        guardrails: [
          "Do not respond to a setback with undifferentiated volume alone.",
          "Replacement opportunities should remain aligned with the recovery objective.",
        ],
        successSignals: [
          "New qualified opportunities enter the pipeline",
          "Application and conversation volume recovers",
          "A new downstream progression signal appears",
        ],
        confidence: decision.confidence,
      };

    case "Prioritize application conversion":
      return {
        strategy: "Convert existing application volume into conversations",
        objective:
          "Turn existing application activity into active conversations and downstream opportunities before materially increasing volume.",
        approach: [
          "Follow up on the strongest existing applications",
          "Identify applications that can be converted into conversations",
          "Use relevant warm or human touchpoints where available",
        ],
        guardrails: [
          "Do not compensate for weak conversion by simply increasing application volume.",
          "Existing application opportunities should receive conversion attention before broad expansion.",
        ],
        successSignals: [
          "Applications begin producing conversations",
          "Interview opportunities emerge from existing application volume",
          "Application-to-conversation conversion improves",
        ],
        confidence: decision.confidence,
      };

    case "Maintain active job search":
      return {
        strategy: "Maintain qualified search activity while strengthening downstream depth",
        objective:
          "Keep active opportunities moving while improving the depth and quality of the recovery pipeline.",
        approach: [
          "Continue qualified applications",
          "Strengthen downstream opportunities from the existing pipeline",
          "Monitor progression rather than optimizing for application count alone",
        ],
        guardrails: [
          "Do not let search volume replace progression through existing opportunities.",
        ],
        successSignals: [
          "Active opportunities continue progressing",
          "Downstream pipeline depth increases",
          "New interviews or later-stage opportunities emerge",
        ],
        confidence: decision.confidence,
      };

    case "Build recovery pipeline":
      return {
        strategy: "Establish sufficient qualified recovery pipeline",
        objective:
          "Create enough qualified opportunities to move the recovery process into active progression.",
        approach: [
          "Create new qualified application opportunities",
          "Build relevant networking and referral paths",
          "Prioritize opportunities with credible progression potential",
        ],
        guardrails: [
          "Do not optimize for raw activity without qualified opportunity creation.",
          "Balance application creation with relationship and progression paths.",
        ],
        successSignals: [
          "Qualified opportunities enter the pipeline",
          "The pipeline moves beyond a thin state",
          "First downstream conversations or interviews emerge",
        ],
        confidence: decision.confidence,
      };

    default:
      return {
        strategy: "Maintain recovery momentum",
        objective:
          "Continue the recovery process while gathering enough evidence for the next strategic decision.",
        approach: [
          "Continue the highest-value recovery activities",
          "Track meaningful pipeline changes",
        ],
        guardrails: [
          "Avoid unnecessary expansion until the recovery signal becomes clearer.",
        ],
        successSignals: [
          "A clearer downstream recovery signal emerges",
        ],
        confidence: "LOW",
      };
  }
}


export function getRecoveryStrategy(
  decision: RecoveryDecision,
  recoveryDirection?: RecoveryDirection,
  recoveryDirectionPersistence?: RecoveryDirectionPersistence,
): RecoveryStrategy {
  const baseStrategy = getBaseRecoveryStrategy(decision);

  if (recoveryDirection === undefined) {
    return baseStrategy;
  }

  let strategy: RecoveryStrategy = baseStrategy;

  switch (recoveryDirection.direction) {
    case "CLOSEOUT":
      strategy = {
        ...baseStrategy,
        guardrails: [
          ...baseStrategy.guardrails,
          "Closeout direction: do not expand recovery activity unless the transition becomes unstable.",
        ],
      };
      break;

    case "REBUILD":
      strategy = {
        ...baseStrategy,
        guardrails: [
          ...baseStrategy.guardrails,
          "Rebuild direction: replace lost opportunity capacity before relying on the existing pipeline.",
        ],
      };
      break;

    case "SHIFT":
      strategy = {
        ...baseStrategy,
        guardrails: [
          ...baseStrategy.guardrails,
          "Shift direction: change the recovery approach before increasing activity volume.",
        ],
      };
      break;

    case "INTENSIFY":
      strategy = {
        ...baseStrategy,
        guardrails: [
          ...baseStrategy.guardrails,
          "Intensify direction: concentrate effort on the active recovery opportunity before expanding search.",
        ],
      };
      break;

    case "CONTINUE":
      strategy = baseStrategy;
      break;

    default:
      strategy = baseStrategy;
      break;
  }

  if (recoveryDirectionPersistence === undefined) {
    return strategy;
  }

  if (recoveryDirectionPersistence.status === "PERSISTING") {
    return {
      ...strategy,
      guardrails: [
        ...strategy.guardrails,
        `Persistence-aware strategy: preserve the ${recoveryDirection.direction} direction while it remains supported across ${recoveryDirectionPersistence.consecutiveCycles} consecutive cycles.`,
      ],
    };
  }

  if (recoveryDirectionPersistence.status === "RESET") {
    return {
      ...strategy,
      guardrails: [
        ...strategy.guardrails,
        "Persistence-aware strategy: treat the current direction as a reset path and do not carry forward assumptions from the previous direction.",
      ],
    };
  }

  return {
    ...strategy,
    guardrails: [
      ...strategy.guardrails,
      "Persistence-aware strategy: treat the current direction as newly established and avoid expanding the strategy solely on the basis of one cycle.",
    ],
  };
}


function getBaseRecoveryExecutionPlan(
  decision: RecoveryDecision,
  strategy: RecoveryStrategy,
): RecoveryExecutionPlan {
  switch (decision.decision) {
    case "Close out recovery":
      return {
        objective: strategy.objective,
        sequence: [
          "Complete outstanding transition steps",
          "Confirm the employment transition is fully operational",
          "Protect the financial and professional gains created by the recovery",
        ],
        immediateAction:
          "Complete the highest-priority outstanding transition step",
        supportingActions: [
          "Confirm the employment transition is fully operational",
          "Close remaining recovery tasks",
          "Protect the gains created by the recovery",
        ],
        avoidActions: [
          "Do not treat recovery as complete before the transition is operationally stable.",
        ],
        confidence: strategy.confidence,
      };

    case "Prioritize offer execution":
      return {
        objective: strategy.objective,
        sequence: [
          "Complete outstanding offer and decision steps",
          "Resolve open questions or blockers on the active offer",
          "Maintain appropriate backup coverage until the transition is secure",
        ],
        immediateAction:
          "Complete the next outstanding offer or decision step",
        supportingActions: [
          "Resolve open offer questions or blockers",
          "Confirm decision dates and transition requirements",
          "Keep appropriate backup coverage moving",
        ],
        avoidActions: [
          "Do not let broad pipeline activity displace critical offer execution.",
        ],
        confidence: strategy.confidence,
      };

    case "Stabilize runway while maintaining recovery momentum":
      return {
        objective: strategy.objective,
        sequence: [
          "Protect immediate financial runway",
          "Prioritize active opportunities with the shortest path to progression",
          "Continue only recovery activities that preserve meaningful momentum",
        ],
        immediateAction:
          "Review and protect immediate financial runway",
        supportingActions: [
          "Prioritize the strongest active recovery opportunity",
          "Continue high-value progression activity",
          "Reduce recovery activity that does not preserve meaningful momentum",
        ],
        avoidActions: [
          "Do not trade away near-term recovery opportunities solely for additional search volume.",
        ],
        confidence: strategy.confidence,
      };

    case "Prioritize final-round progression":
      return {
        objective: strategy.objective,
        sequence: [
          "Prepare specifically for the final-round requirements",
          "Complete targeted follow-up with the opportunity",
          "Remove avoidable blockers between final round and offer",
        ],
        immediateAction:
          "Prepare for the next final-round requirement",
        supportingActions: [
          "Complete targeted final-round follow-up",
          "Identify and remove avoidable blockers",
          "Protect the final-round opportunity from unrelated search activity",
        ],
        avoidActions: [
          "Do not let broad application volume dilute final-round preparation.",
        ],
        confidence: strategy.confidence,
      };

    case "Prioritize interview progression":
      return {
        objective: strategy.objective,
        sequence: [
          "Prepare for the next interview stage",
          "Follow up on active interview opportunities",
          "Prioritize opportunities showing meaningful progression signals",
        ],
        immediateAction:
          "Prepare for the next active interview stage",
        supportingActions: [
          "Complete follow-up on active interviews",
          "Identify opportunities showing progression",
          "Move qualified interviews toward later stages",
        ],
        avoidActions: [
          "Do not materially increase broad application volume before protecting interview execution.",
        ],
        confidence: strategy.confidence,
      };

    case "Rebuild the recovery pipeline":
      return {
        objective: strategy.objective,
        sequence: [
          "Replace recently lost opportunity capacity",
          "Rebuild qualified applications and conversations",
          "Learn from the latest pipeline change when selecting replacement opportunities",
        ],
        immediateAction:
          "Create the first qualified replacement opportunity",
        supportingActions: [
          "Replace lost pipeline capacity",
          "Rebuild qualified application and conversation paths",
          "Use the latest setback or closure as selection evidence",
        ],
        avoidActions: [
          "Do not respond to a setback with undifferentiated volume alone.",
        ],
        confidence: strategy.confidence,
      };

    case "Prioritize application conversion":
      return {
        objective: strategy.objective,
        sequence: [
          "Follow up on the strongest existing applications",
          "Identify applications that can be converted into conversations",
          "Use relevant warm or human touchpoints where available",
        ],
        immediateAction:
          "Follow up on the strongest existing application",
        supportingActions: [
          "Identify applications with conversion potential",
          "Use relevant human or warm touchpoints",
          "Track whether applications produce conversations",
        ],
        avoidActions: [
          "Do not compensate for weak conversion by simply increasing application volume.",
        ],
        confidence: strategy.confidence,
      };

    case "Maintain active job search":
      return {
        objective: strategy.objective,
        sequence: [
          "Continue qualified applications",
          "Strengthen downstream opportunities from the existing pipeline",
          "Monitor progression rather than optimizing for application count alone",
        ],
        immediateAction:
          "Advance the strongest qualified active opportunity",
        supportingActions: [
          "Continue qualified search activity",
          "Strengthen downstream opportunities",
          "Track progression through the pipeline",
        ],
        avoidActions: [
          "Do not let search volume replace progression through existing opportunities.",
        ],
        confidence: strategy.confidence,
      };

    case "Build recovery pipeline":
      return {
        objective: strategy.objective,
        sequence: [
          "Create new qualified application opportunities",
          "Build relevant networking and referral paths",
          "Prioritize opportunities with credible progression potential",
        ],
        immediateAction:
          "Create the first qualified recovery opportunity",
        supportingActions: [
          "Build new qualified applications",
          "Create relevant networking and referral paths",
          "Prioritize opportunities with credible progression potential",
        ],
        avoidActions: [
          "Do not optimize for raw activity without qualified opportunity creation.",
        ],
        confidence: strategy.confidence,
      };

    default:
      return {
        objective: strategy.objective,
        sequence: [
          "Continue the highest-value recovery activities",
          "Track meaningful pipeline changes",
        ],
        immediateAction:
          "Continue the highest-value recovery activity",
        supportingActions: [
          "Track meaningful pipeline changes",
        ],
        avoidActions: [
          "Avoid unnecessary expansion until the recovery signal becomes clearer.",
        ],
        confidence: "LOW",
      };
  }
}

export function getRecoveryExecutionPlan(
  decision: RecoveryDecision,
  strategy: RecoveryStrategy,
  recoveryDirection?: RecoveryDirection,
  recoveryDirectionPersistence?: RecoveryDirectionPersistence,
): RecoveryExecutionPlan {
  const basePlan = getBaseRecoveryExecutionPlan(decision, strategy);

  if (recoveryDirection === undefined) {
    return basePlan;
  }

  let plan: RecoveryExecutionPlan = basePlan;

  switch (recoveryDirection.direction) {
    case "CLOSEOUT":
      plan = {
        ...basePlan,
        avoidActions: [
          ...basePlan.avoidActions,
          "Closeout direction: do not expand recovery activity unless the transition becomes unstable.",
        ],
      };
      break;

    case "REBUILD":
      plan = {
        ...basePlan,
        avoidActions: [
          ...basePlan.avoidActions,
          "Rebuild direction: replace lost opportunity capacity before relying on the remaining pipeline.",
        ],
      };
      break;

    case "SHIFT":
      plan = {
        ...basePlan,
        avoidActions: [
          ...basePlan.avoidActions,
          "Shift direction: change the recovery approach before increasing activity volume.",
        ],
      };
      break;

    case "INTENSIFY":
      plan = {
        ...basePlan,
        avoidActions: [
          ...basePlan.avoidActions,
          "Intensify direction: concentrate effort on the active recovery opportunity before expanding search.",
        ],
      };
      break;

    case "CONTINUE":
      plan = basePlan;
      break;

    default:
      plan = basePlan;
      break;
  }

  if (recoveryDirectionPersistence === undefined) {
    return plan;
  }

  if (recoveryDirectionPersistence.status === "PERSISTING") {
    return {
      ...plan,
      avoidActions: [
        ...plan.avoidActions,
        `Persistence-aware execution: preserve the ${recoveryDirection.direction} direction while it remains supported across ${recoveryDirectionPersistence.consecutiveCycles} consecutive cycles.`,
      ],
    };
  }

  if (recoveryDirectionPersistence.status === "RESET") {
    return {
      ...plan,
      avoidActions: [
        ...plan.avoidActions,
        "Persistence-aware execution: treat the current direction as a reset path and do not carry forward execution assumptions from the previous direction.",
      ],
    };
  }

  return {
    ...plan,
    avoidActions: [
      ...plan.avoidActions,
      "Persistence-aware execution: treat the current direction as newly established and avoid expanding execution solely on the basis of one cycle.",
    ],
  };
}

export type RecoveryExecutionAction = {
  step: string;
  action: RecoveryAction | null;
};

const EXECUTION_ACTION_MAP: Record<string, string[]> = {
  "Complete outstanding transition steps": [
    "Confirm your accepted offer details",
    "Review your recovery data",
  ],
  "Confirm the employment transition is fully operational": [
    "Confirm your accepted offer details",
    "Review your recovery data",
  ],
  "Protect the financial and professional gains created by the recovery": [
    "Review your financial position",
    "Review your financial runway",
  ],

  "Complete outstanding offer and decision steps": [
    "Review your offer pipeline",
    "Review your active offer",
    "Confirm your accepted offer details",
  ],
  "Resolve open questions or blockers on the active offer": [
    "Review your active offer",
    "Review compensation and decision dates",
  ],
  "Maintain appropriate backup coverage until the transition is secure": [
    "Keep one backup opportunity moving",
  ],

  "Protect immediate financial runway": [
    "Review your financial position",
    "Review your financial runway",
    "Confirm your financial runway",
  ],
  "Prioritize active opportunities with the shortest path to progression": [
    "Review your active application pipeline",
    "Advance an active interview",
    "Review your active offer",
  ],
  "Continue only recovery activities that preserve meaningful momentum": [
    "Review this week's recovery plan",
  ],

  "Prepare specifically for the final-round requirements": [
    "Prepare your final-round talking points",
  ],
  "Complete targeted follow-up with the opportunity": [
    "Send your final-round follow-up",
    "Review your interview follow-ups",
    "Track your interview follow-up",
    "Plan your final-round follow-up",
  ],
  "Remove avoidable blockers between final round and offer": [
    "Confirm final-round logistics",
    "Review your interview follow-ups",
  ],

  "Prepare for the next interview stage": [
    "Prepare for your next interview",
  ],
  "Follow up on active interview opportunities": [
    "Review your interview follow-ups",
    "Track your interview follow-up",
    "Advance an active interview",
  ],
  "Prioritize opportunities showing meaningful progression signals": [
    "Advance an active interview",
    "Review your active application pipeline",
  ],

  "Replace recently lost opportunity capacity": [
    "Identify 3 replacement target roles",
    "Add a new target opportunity",
  ],
  "Rebuild qualified applications and conversations": [
    "Add a new target opportunity",
    "Convert applications into conversations",
  ],
  "Learn from the latest pipeline change when selecting replacement opportunities": [
    "Review what changed in the closed opportunity",
  ],

  "Follow up on the strongest existing applications": [
    "Review your active application pipeline",
    "Convert applications into conversations",
  ],
  "Identify applications that can be converted into conversations": [
    "Convert applications into conversations",
  ],
  "Use relevant warm or human touchpoints where available": [
    "Follow up with an active network contact",
    "Review your active network",
    "Reopen a warm referral path",
  ],

  "Continue qualified applications": [
    "Review your active application pipeline",
    "Add your first target application",
    "Add a new target opportunity",
  ],
  "Strengthen downstream opportunities from the existing pipeline": [
    "Review your active application pipeline",
    "Advance an active interview",
    "Review your active network",
  ],
  "Monitor progression rather than optimizing for application count alone": [
    "Review this week's recovery plan",
  ],

  "Create new qualified application opportunities": [
    "Add a new target opportunity",
    "Add your first target application",
  ],
  "Build relevant networking and referral paths": [
    "Create a new networking path",
    "Start a referral conversation",
    "Reopen a warm referral path",
  ],
  "Prioritize opportunities with credible progression potential": [
    "Review your active application pipeline",
    "Add a new target opportunity",
  ],
};

export function getRecoveryLearning(
  outcome: RecoveryOutcome,
  outcomeIntelligence: RecoveryOutcomeIntelligence,
  progressionSignal: string,
): RecoveryLearning {
  const confidence =
    outcomeIntelligence.impact === "HIGH"
      ? "HIGH"
      : outcomeIntelligence.impact === "MEDIUM"
        ? "MEDIUM"
        : "LOW";

  if (
    outcome.status === "POSITIVE" ||
    progressionSignal === "ADVANCING"
  ) {
    return {
      pattern: "Meaningful recovery progression is being generated.",
      learning:
        "The current recovery approach is producing evidence of downstream movement. Preserve the direction while continuing execution.",
      evidence: outcome.evidence,
      confidence,
    };
  }

  if (
    outcome.status === "NEGATIVE" ||
    progressionSignal === "SETBACK" ||
    progressionSignal === "CLOSED"
  ) {
    return {
      pattern:
        progressionSignal === "CLOSED"
          ? "Recovery opportunity capacity was lost."
          : "Recovery progression weakened or moved backward.",
      learning:
        progressionSignal === "CLOSED"
          ? "The current recovery path has lost available opportunity capacity. Future decisions should account for the reduced pipeline."
          : "The latest recovery evidence weakens the current direction. Treat the signal as learning before expanding the same activity.",
      evidence: outcome.evidence,
      confidence,
    };
  }

  return {
    pattern: "No material directional recovery pattern is visible.",
    learning:
      "The available outcome evidence is insufficient to establish a new recovery lesson. Continue the current approach until a stronger signal appears.",
    evidence: outcome.evidence,
    confidence,
  };
}

function getRecoveryExecutionEffect(
  actionEffect: RecoveryActionEffect,
): RecoveryRecalibration["executionEffect"] {
  if (actionEffect.status === "POSITIVE") {
    return "SUPPORTS";
  }

  if (actionEffect.status === "NEGATIVE") {
    return "CHALLENGES";
  }

  return "INSUFFICIENT";
}

export function getRecoveryCycleState(
  recalibration: RecoveryRecalibration,
  recoveryDirectionPersistence?: RecoveryDirectionPersistence,
): RecoveryCycleState {
  if (recoveryDirectionPersistence?.status === "RESET") {
    return {
      status: "RESET",
      reason:
        "The recovery direction was reset, so the next recovery cycle must discard assumptions carried forward from the previous direction.",
      source: "PERSISTENCE_RESET",
    };
  }

  if (
    recalibration.decisionStatus === "REASSESS" ||
    recalibration.strategyStatus === "REASSESS"
  ) {
    return {
      status: "REASSESS",
      reason:
        "The latest recovery evidence requires the next cycle to reassess the current decision and strategy.",
      source: "REASSESS",
    };
  }

  return {
    status: "CONTINUE",
    reason:
      recoveryDirectionPersistence?.status === "PERSISTING"
        ? `The current recovery direction remains supported across ${recoveryDirectionPersistence.consecutiveCycles} consecutive cycles, so the next cycle should continue the established path.`
        : "The current recovery decision and strategy remain supported, so the next cycle should continue the established path.",
    source: "HOLD",
  };
}

export function getRecoveryCycleMemory(
  previousCycleState: RecoveryCycleState | null | undefined,
  currentCycleState: RecoveryCycleState,
): RecoveryCycleMemory {
  const previousStatus = previousCycleState?.status ?? null;

  if (previousStatus === null) {
    return {
      previousStatus: null,
      currentStatus: currentCycleState.status,
      carriedForward: false,
      rationale:
        "No previous recovery cycle state is available, so this cycle establishes the current recovery cycle context.",
    };
  }

  if (previousStatus === currentCycleState.status) {
    return {
      previousStatus,
      currentStatus: currentCycleState.status,
      carriedForward: true,
      rationale:
        `The previous recovery cycle was ${previousStatus}, and the current cycle remains ${currentCycleState.status}, so the cycle state continues with the same context.`,
    };
  }

  return {
    previousStatus,
    currentStatus: currentCycleState.status,
    carriedForward: false,
    rationale:
      `The previous recovery cycle was ${previousStatus}, but the current cycle is ${currentCycleState.status}, so the current evidence takes precedence and the cycle context changes.`,
  };
}

export function getRecoveryCycleTransition(
  previousCycleState: RecoveryCycleState | null | undefined,
  currentCycleState: RecoveryCycleState,
): RecoveryCycleTransition {
  const from = previousCycleState?.status ?? null;
  const to = currentCycleState.status;

  if (from === null) {
    return {
      from: null,
      to,
      transition: "INITIAL",
      changed: true,
      rationale:
        "This is the first available recovery cycle, so the current cycle establishes the initial recovery context.",
    };
  }

  if (from === to) {
    return {
      from,
      to,
      transition: "UNCHANGED",
      changed: false,
      rationale:
        `The previous recovery cycle was ${from}, and the current cycle remains ${to}, so the recovery cycle context is unchanged.`,
    };
  }

  if (to === "RESET") {
    return {
      from,
      to,
      transition: "RESET",
      changed: true,
      rationale:
        `The previous recovery cycle was ${from}, but the current cycle is RESET, so assumptions carried forward from the previous cycle must be discarded.`,
    };
  }

  if (
    (from === "REASSESS" && to === "CONTINUE") ||
    (from === "RESET" && to === "CONTINUE")
  ) {
    return {
      from,
      to,
      transition: "PROGRESSED",
      changed: true,
      rationale:
        `The recovery cycle moved from ${from} to ${to}, indicating that the current evidence supports continuing the recovery path after the previous cycle state.`,
    };
  }

  return {
    from,
    to,
    transition: "REGRESSED",
    changed: true,
    rationale:
      `The recovery cycle moved from ${from} to ${to}, indicating that the current evidence requires more caution than the previous cycle state.`,
  };
}

export function getRecoveryCycleTransitionMemory(
  previousTransition: RecoveryCycleTransition["transition"] | null | undefined,
  currentTransition: RecoveryCycleTransition["transition"],
): RecoveryCycleTransitionMemory {
  const previous = previousTransition ?? null;

  if (previous === null) {
    return {
      previousTransition: null,
      currentTransition,
      repeated: false,
      rationale:
        "No previous recovery cycle transition is available, so the current transition establishes the initial transition context.",
    };
  }

  if (previous === currentTransition) {
    return {
      previousTransition: previous,
      currentTransition,
      repeated: true,
      rationale:
        `The previous recovery cycle transition was ${previous}, and the current transition is also ${currentTransition}, so the transition pattern is repeated.`,
    };
  }

  return {
    previousTransition: previous,
    currentTransition,
    repeated: false,
    rationale:
      `The previous recovery cycle transition was ${previous}, but the current transition is ${currentTransition}, so the transition pattern has changed.`,
  };
}

export function getRecoveryCycleTransitionPattern(
  previousPattern: RecoveryCycleTransitionPattern | null | undefined,
  currentTransition: RecoveryCycleTransition["transition"],
): RecoveryCycleTransitionPattern {
  const previous = previousPattern ?? null;

  if (previous === null || previous.transition !== currentTransition) {
    return {
      transition: currentTransition,
      occurrences: 1,
      repeated: false,
      pattern: "NONE",
      rationale:
        previous === null
          ? "No previous recovery cycle transition pattern is available, so the current transition establishes the initial pattern context."
          : `The previous transition pattern was ${previous.transition}, but the current transition is ${currentTransition}, so the occurrence count resets for the new transition.`,
    };
  }

  const occurrences = previous.occurrences + 1;
  const pattern =
    occurrences >= 3
      ? "PERSISTENT"
      : occurrences >= 2
        ? "REPEATING"
        : "NONE";

  return {
    transition: currentTransition,
    occurrences,
    repeated: occurrences >= 2,
    pattern,
    rationale:
      pattern === "PERSISTENT"
        ? `The recovery cycle transition ${currentTransition} has now occurred ${occurrences} consecutive times, so the transition pattern is persistent.`
        : `The recovery cycle transition ${currentTransition} has now occurred ${occurrences} consecutive times, so the transition pattern is repeating.`,
  };
}

export function getRecoveryCycleTransitionPatternMemory(
  previousPattern:
    | RecoveryCycleTransitionPattern["pattern"]
    | null
    | undefined,
  currentPattern: RecoveryCycleTransitionPattern["pattern"],
): RecoveryCycleTransitionPatternMemory {
  const previous = previousPattern ?? null;

  if (previous === null) {
    return {
      previousPattern: null,
      currentPattern,
      repeated: false,
      rationale:
        "No previous recovery cycle transition pattern is available, so the current pattern establishes the initial pattern context.",
    };
  }

  if (previous === currentPattern) {
    return {
      previousPattern: previous,
      currentPattern,
      repeated: true,
      rationale:
        `The previous recovery cycle transition pattern was ${previous}, and the current pattern is also ${currentPattern}, so the pattern is carried forward.`,
    };
  }

  return {
    previousPattern: previous,
    currentPattern,
    repeated: false,
    rationale:
      `The previous recovery cycle transition pattern was ${previous}, but the current pattern is ${currentPattern}, so the pattern has changed.`,
  };
}

export function getRecoveryCycleTransitionPatternConsequence(
  response: RecoveryCycleTransitionPatternResponse,
): RecoveryCycleTransitionPatternConsequence {
  if (response.response === "CONTINUE") {
    return {
      response: response.response,
      consequence: "MAINTAIN",
      rationale:
        "The recovery cycle response is CONTINUE, so the current recovery approach is maintained.",
    };
  }

  if (response.response === "REASSESS") {
    return {
      response: response.response,
      consequence: "REASSESS",
      rationale:
        "The recovery cycle response is REASSESS, so the current recovery approach requires reassessment.",
    };
  }

  if (response.response === "RESET") {
    return {
      response: response.response,
      consequence: "RESET",
      rationale:
        "The recovery cycle response is RESET, so the current recovery approach is reset.",
    };
  }

  return {
    response: response.response,
    consequence: "NONE",
    rationale:
      "The recovery cycle response is NONE, so no recovery cycle consequence is triggered.",
  };
}


export function getRecoveryCycleTransitionPatternConsequenceMemory(
  previousConsequence:
    | RecoveryCycleTransitionPatternConsequence["consequence"]
    | null
    | undefined,
  currentConsequence:
    RecoveryCycleTransitionPatternConsequence["consequence"],
): RecoveryCycleTransitionPatternConsequenceMemory {
  const previous = previousConsequence ?? null;

  if (previous === null) {
    return {
      previousConsequence: null,
      currentConsequence,
      repeated: false,
      rationale:
        "No previous recovery cycle transition pattern consequence is available, so the current consequence establishes the initial consequence context.",
    };
  }

  if (previous === currentConsequence) {
    return {
      previousConsequence: previous,
      currentConsequence,
      repeated: true,
      rationale:
        `The previous recovery cycle transition pattern consequence was ${previous}, and the current consequence is also ${currentConsequence}, so the consequence is carried forward.`,
    };
  }

  return {
    previousConsequence: previous,
    currentConsequence,
    repeated: false,
    rationale:
      `The previous recovery cycle transition pattern consequence was ${previous}, but the current consequence is ${currentConsequence}, so the consequence has changed.`,
  };
}


export function getRecoveryCycleTransitionPatternConsequencePersistence(
  previousPersistence:
    | RecoveryCycleTransitionPatternConsequencePersistence
    | null
    | undefined,
  currentConsequence:
    RecoveryCycleTransitionPatternConsequence["consequence"],
): RecoveryCycleTransitionPatternConsequencePersistence {
  const previous = previousPersistence ?? null;

  if (previous === null || previous.consequence !== currentConsequence) {
    return {
      consequence: currentConsequence,
      occurrences: 1,
      persistent: false,
      rationale:
        previous === null
          ? "No previous recovery cycle transition pattern consequence persistence is available, so the current consequence establishes the initial persistence context."
          : `The previous recovery cycle transition pattern consequence was ${previous.consequence}, but the current consequence is ${currentConsequence}, so persistence resets for the new consequence.`,
    };
  }

  const occurrences = previous.occurrences + 1;
  const persistent = occurrences >= 3;

  return {
    consequence: currentConsequence,
    occurrences,
    persistent,
    rationale: persistent
      ? `The recovery cycle transition pattern consequence ${currentConsequence} has persisted for ${occurrences} consecutive evaluations, so the consequence is persistent.`
      : `The recovery cycle transition pattern consequence ${currentConsequence} has now been observed for ${occurrences} consecutive evaluations, but persistence has not yet been established.`,
  };
}


export function getRecoveryCycleTransitionPatternConsequenceResponse(
  persistence: RecoveryCycleTransitionPatternConsequencePersistence,
): RecoveryCycleTransitionPatternConsequenceResponse {
  const { consequence, persistent } = persistence;

  if (!persistent) {
    return {
      consequence,
      persistent,
      response: "NONE",
      rationale:
        `The recovery cycle transition pattern consequence ${consequence} has not yet established persistence, so no response is triggered.`,
    };
  }

  if (consequence === "MAINTAIN") {
    return {
      consequence,
      persistent,
      response: "MAINTAIN",
      rationale:
        `The recovery cycle transition pattern consequence ${consequence} is persistent, so the current recovery approach is maintained.`,
    };
  }

  if (consequence === "REASSESS") {
    return {
      consequence,
      persistent,
      response: "REASSESS",
      rationale:
        `The recovery cycle transition pattern consequence ${consequence} is persistent, so the current recovery approach requires reassessment.`,
    };
  }

  if (consequence === "RESET") {
    return {
      consequence,
      persistent,
      response: "RESET",
      rationale:
        `The recovery cycle transition pattern consequence ${consequence} is persistent, so the current recovery approach is reset.`,
    };
  }

  return {
    consequence,
    persistent,
    response: "NONE",
    rationale:
      `The recovery cycle transition pattern consequence ${consequence} is persistent, but it does not require a response change.`,
  };
}


export function getRecoveryCycleTransitionPatternConsequenceResponseMemory(
  previousResponse:
    | RecoveryCycleTransitionPatternConsequenceResponse["response"]
    | null
    | undefined,
  currentResponse:
    RecoveryCycleTransitionPatternConsequenceResponse["response"],
): RecoveryCycleTransitionPatternConsequenceResponseMemory {
  const previous = previousResponse ?? null;

  if (previous === null) {
    return {
      previousResponse: null,
      currentResponse,
      repeated: false,
      rationale:
        "No previous recovery cycle transition pattern consequence response is available, so the current response establishes the initial response context.",
    };
  }

  if (previous === currentResponse) {
    return {
      previousResponse: previous,
      currentResponse,
      repeated: true,
      rationale:
        `The previous recovery cycle transition pattern consequence response was ${previous}, and the current response is also ${currentResponse}, so the response is carried forward.`,
    };
  }

  return {
    previousResponse: previous,
    currentResponse,
    repeated: false,
    rationale:
      `The previous recovery cycle transition pattern consequence response was ${previous}, but the current response is ${currentResponse}, so the response has changed.`,
  };
}


export function getRecoveryCycleTransitionPatternConsequenceResponsePersistence(
  previousPersistence:
    | RecoveryCycleTransitionPatternConsequenceResponsePersistence
    | null
    | undefined,
  currentResponse:
    RecoveryCycleTransitionPatternConsequenceResponse["response"],
): RecoveryCycleTransitionPatternConsequenceResponsePersistence {
  const previous = previousPersistence ?? null;

  if (previous === null || previous.response !== currentResponse) {
    return {
      response: currentResponse,
      occurrences: 1,
      persistent: false,
      rationale:
        previous === null
          ? "No previous recovery cycle transition pattern consequence response persistence is available, so the current response establishes the initial persistence context."
          : `The previous recovery cycle transition pattern consequence response was ${previous.response}, but the current response is ${currentResponse}, so persistence resets for the new response.`,
    };
  }

  const occurrences = previous.occurrences + 1;
  const persistent = occurrences >= 3;

  return {
    response: currentResponse,
    occurrences,
    persistent,
    rationale: persistent
      ? `The recovery cycle transition pattern consequence response ${currentResponse} has persisted for ${occurrences} consecutive evaluations, so the response is persistent.`
      : `The recovery cycle transition pattern consequence response ${currentResponse} has now been observed for ${occurrences} consecutive evaluations, but persistence has not yet been established.`,
  };
}


export function getRecoveryCycleTransitionPatternConsequenceResponseConsequence(
  response:
    RecoveryCycleTransitionPatternConsequenceResponse,
): RecoveryCycleTransitionPatternConsequenceResponseConsequence {
  if (response.response === "MAINTAIN") {
    return {
      response: response.response,
      consequence: "MAINTAIN",
      rationale:
        "The recovery cycle transition pattern consequence response is MAINTAIN, so the current recovery approach remains maintained.",
    };
  }

  if (response.response === "REASSESS") {
    return {
      response: response.response,
      consequence: "REASSESS",
      rationale:
        "The recovery cycle transition pattern consequence response is REASSESS, so the current recovery approach requires reassessment.",
    };
  }

  if (response.response === "RESET") {
    return {
      response: response.response,
      consequence: "RESET",
      rationale:
        "The recovery cycle transition pattern consequence response is RESET, so the current recovery approach is reset.",
    };
  }

  return {
    response: response.response,
    consequence: "NONE",
    rationale:
      "The recovery cycle transition pattern consequence response is NONE, so no recovery cycle consequence is triggered.",
  };
}

export function getRecoveryCycleTransitionPatternResponse(
  persistence: RecoveryCycleTransitionPatternPersistence,
): RecoveryCycleTransitionPatternResponse {
  const { pattern, persistent } = persistence;

  if (!persistent) {
    return {
      pattern,
      persistent,
      response: "NONE",
      rationale:
        `The recovery cycle transition pattern ${pattern} has not yet established persistence, so no response is triggered.`,
    };
  }

  if (pattern === "REPEATING") {
    return {
      pattern,
      persistent,
      response: "CONTINUE",
      rationale:
        `The recovery cycle transition pattern ${pattern} is persistent, so the current recovery cycle response continues without forcing reassessment.`,
    };
  }

  if (pattern === "PERSISTENT") {
    return {
      pattern,
      persistent,
      response: "REASSESS",
      rationale:
        `The recovery cycle transition pattern ${pattern} is persistent, so the recovery cycle should be reassessed against the accumulated evidence.`,
    };
  }

  return {
    pattern,
    persistent,
    response: "NONE",
    rationale:
      `The recovery cycle transition pattern ${pattern} is persistent, but it does not require a response change.`,
  };
}

export function getRecoveryCycleTransitionPatternPersistence(
  previousPersistence:
    | RecoveryCycleTransitionPatternPersistence
    | null
    | undefined,
  currentPattern: RecoveryCycleTransitionPattern["pattern"],
): RecoveryCycleTransitionPatternPersistence {
  const previous = previousPersistence ?? null;

  if (previous === null || previous.pattern !== currentPattern) {
    return {
      pattern: currentPattern,
      occurrences: 1,
      persistent: false,
      rationale:
        previous === null
          ? "No previous recovery cycle transition pattern persistence is available, so the current pattern establishes the initial persistence context."
          : `The previous recovery cycle transition pattern was ${previous.pattern}, but the current pattern is ${currentPattern}, so persistence resets for the new pattern.`,
    };
  }

  const occurrences = previous.occurrences + 1;
  const persistent = occurrences >= 3;

  return {
    pattern: currentPattern,
    occurrences,
    persistent,
    rationale: persistent
      ? `The recovery cycle transition pattern ${currentPattern} has persisted for ${occurrences} consecutive evaluations, so the pattern is persistent.`
      : `The recovery cycle transition pattern ${currentPattern} has now been observed for ${occurrences} consecutive evaluations, but persistence has not yet been established.`,
  };
}



export function getRecoveryRecalibration(
  state: RecoveryState,
  progressionSignal: string,
  decision: RecoveryDecision,
  strategy: RecoveryStrategy,
  plan: RecoveryExecutionPlan,
  actions: RecoveryAction[],
  learning: RecoveryLearning = {
    pattern: "No material directional recovery pattern is visible.",
    learning:
      "The available outcome evidence is insufficient to establish a new recovery lesson.",
    evidence: [],
    confidence: "LOW",
  },
  executionEffect: RecoveryActionEffect = {
    status: "UNKNOWN",
    headline: "",
    summary: "",
    evidence: [],
    recommendation: "",
  },
  recoveryDirectionPersistence?: RecoveryDirectionPersistence,
): RecoveryRecalibration {
  const nextAction =
    plan.sequence
      .map((step) => EXECUTION_ACTION_MAP[step] ?? [])
      .flatMap((titles) => titles)
      .map((title) => actions.find((action) => action.title === title) ?? null)
      .find((action): action is RecoveryAction => action !== null) ?? null;

  const nextStep = nextAction?.title ?? plan.immediateAction;

  const resolvedExecutionEffect =
    getRecoveryExecutionEffect(executionEffect);

  const learningEffect: RecoveryRecalibration["learningEffect"] =
    learning.confidence === "LOW"
      ? "INSUFFICIENT"
      : progressionSignal === "SETBACK" ||
          progressionSignal === "CLOSED"
        ? "CHALLENGES"
        : "SUPPORTS";

  const persistenceRationale =
    recoveryDirectionPersistence === undefined
      ? null
      : recoveryDirectionPersistence.status === "PERSISTING"
        ? `Persistence-aware recalibration: hold the current recovery direction because it remains supported across ${recoveryDirectionPersistence.consecutiveCycles} consecutive cycles.`
        : recoveryDirectionPersistence.status === "RESET"
          ? "Persistence-aware recalibration: reassess the current recovery direction and discard assumptions carried forward from the previous direction."
          : "Persistence-aware recalibration: avoid premature reassessment because the current recovery direction has only been established for one cycle.";

  if (state === "RECOVERED") {
    return {
      trigger: "Recovery state changed to recovered",
      signal: "Employment recovery is now operational.",
      decisionStatus: "HOLD",
      strategyStatus: "HOLD",
      learningEffect,
      executionEffect: resolvedExecutionEffect,
      nextStep,
      rationale: [
        "The recovery decision remains aligned with the current recovered state.",
        "Execution should focus on completing the transition and protecting the gains created by recovery.",
        ...(persistenceRationale ? [persistenceRationale] : []),
      ],
      confidence: decision.confidence,
    };
  }

  if (
    progressionSignal === "SETBACK" ||
    progressionSignal === "CLOSED"
  ) {
    return {
      trigger: "Pipeline signal changed materially",
      signal:
        progressionSignal === "SETBACK"
          ? "An active recovery opportunity moved backward."
          : "An active recovery opportunity was closed.",
      decisionStatus: "REASSESS",
      strategyStatus: "REASSESS",
      learningEffect,
      executionEffect: resolvedExecutionEffect,
      nextStep,
      rationale: [
        "The latest pipeline signal changes the evidence supporting the current recovery direction.",
        "The recovery decision and strategy should be reassessed before expanding activity.",
        ...(persistenceRationale ? [persistenceRationale] : []),
      ],
      confidence: "HIGH",
    };
  }

  if (progressionSignal === "ADVANCING") {
    return {
      trigger: "Pipeline signal improved",
      signal: "An active recovery opportunity is progressing.",
      decisionStatus: "HOLD",
      strategyStatus: "HOLD",
      learningEffect,
      executionEffect: resolvedExecutionEffect,
      nextStep,
      rationale: [
        "The latest progression signal supports the current recovery direction.",
        "Continue executing the current strategy while protecting the active opportunity.",
        ...(persistenceRationale ? [persistenceRationale] : []),
      ],
      confidence: decision.confidence,
    };
  }

  return {
    trigger: "Current recovery signal reviewed",
    signal: "No material pipeline change requires a new recovery direction.",
    decisionStatus: "HOLD",
    strategyStatus: "HOLD",
    learningEffect,
    executionEffect: resolvedExecutionEffect,
    nextStep,
    rationale: [
      "The current recovery decision remains supported by available evidence.",
      "Continue the existing execution plan until a meaningful signal changes.",
      ...(persistenceRationale ? [persistenceRationale] : []),
    ],
    confidence:
      decision.confidence === "LOW"
        ? "LOW"
        : strategy.confidence,
  };
}
export function getExecutionActions(
  plan: RecoveryExecutionPlan,
  actions: RecoveryAction[],
  recoveryDirectionPersistence?: RecoveryDirectionPersistence,
): RecoveryExecutionAction[] {
  const executionActions = plan.sequence.map((step) => {
    const candidates = EXECUTION_ACTION_MAP[step] ?? [];

    const action =
      candidates
        .map((title) =>
          actions.find((candidate) => candidate.title === title) ?? null
        )
        .find((candidate): candidate is RecoveryAction => candidate !== null) ??
      null;

    return {
      step,
      action,
    };
  });

  if (recoveryDirectionPersistence === undefined) {
    return executionActions;
  }

  if (recoveryDirectionPersistence.status === "PERSISTING") {
    return executionActions.map((item) => ({
      ...item,
      step: `${item.step} | Persistence-aware execution actions: preserve the established recovery direction across ${recoveryDirectionPersistence.consecutiveCycles} consecutive cycles.`,
    }));
  }

  if (recoveryDirectionPersistence.status === "RESET") {
    return executionActions.map((item) => ({
      ...item,
      step: `${item.step} | Persistence-aware execution actions: treat the current direction as a reset path and do not carry forward prior execution assumptions.`,
    }));
  }

  return executionActions.map((item) => ({
    ...item,
    step: `${item.step} | Persistence-aware execution actions: treat the current direction as newly established and avoid expanding execution solely from one cycle.`,
  }));
}

export function getActions(
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
      const basePriority = priorityBase[action.priority];
      let score = basePriority;
      const adjustments: Array<{ label: string; delta: number }> = [];

      const addScore = (label: string, delta: number) => {
        score += delta;
        adjustments.push({ label, delta });
      };

      if (evidence) {
        addScore("Evidence", 5);
      }

      // State relevance.
      if (
        state === "JUST_LAID_OFF" &&
        action.href === "/first-72-hours"
      ) {
        addScore("JUST_LAID_OFF state", 35);
      }
      if (
        state === "INTERVIEWING" &&
        action.href === "/interviews"
      ) {
        addScore("INTERVIEWING state", 18);
      }
      if (
        state === "FINAL_ROUND" &&
        action.href === "/interviews"
      ) {
        addScore("FINAL_ROUND state", 25);
      }
      if (
        state === "OFFER" &&
        action.href === "/interviews"
      ) {
        addScore("OFFER state", 20);
      }
      if (
        state === "RECOVERED" &&
        action.href === "/dashboard"
      ) {
        addScore("RECOVERED state", 15);
      }

      // Financial urgency.
      if (runwayMonths !== null) {
        if (
          runwayMonths < 2 &&
          action.href === "/runway"
        ) {
          addScore("Critical runway", 30);
        } else if (
          runwayMonths < 4 &&
          action.href === "/runway"
        ) {
          addScore("Low runway", 20);
        } else if (
          runwayMonths < 8 &&
          action.href === "/runway"
        ) {
          addScore("Limited runway", 8);
        }
      }

      // Accepted offer.
      if (pipelineComposition.acceptedOffers > 0) {
        if (title.includes("confirm your accepted offer")) {
          addScore("Accepted offer confirmation", 35);
        }
        if (title.includes("compensation and decision dates")) {
          addScore("Accepted offer decision dates", 18);
        }
        if (title.includes("backup opportunity")) {
          addScore("Accepted offer backup opportunity", 10);
        }
      }

      // Active offer without acceptance.
      if (
        pipelineComposition.offers > 0 &&
        pipelineComposition.acceptedOffers === 0
      ) {
        if (title.includes("review your offer pipeline")) {
          addScore("Active offer pipeline", 30);
        }
        if (title.includes("compensation and decision dates")) {
          addScore("Active offer decision dates", 22);
        }
        if (action.href === "/interviews") {
          addScore("Active offer interview path", 10);
        }
      }

      // Final-round opportunities.
      if (pipelineComposition.finalRounds > 0) {
        if (action.href === "/interviews") {
          addScore("Final-round interview path", 25);
        }
        if (title.includes("final-round")) {
          addScore("Final-round action match", 15);
        }
      }

      // Active interviews.
      if (pipelineComposition.activeInterviews > 0) {
        if (action.href === "/interviews") {
          addScore("Active interview path", 18);
        }
        if (
          title.includes("prepare for your next interview") ||
          title.includes("advance an active interview")
        ) {
          addScore("Active interview action match", 12);
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
          addScore("Application conversion action", 22);
        }
        if (action.href === "/job-search") {
          addScore("Job-search path", 8);
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
        addScore("Active network follow-up", 22);
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
          addScore("Recent advancement to interview", 18);
        }
      }

      if (progressionSignal === "SETBACK") {
        if (
          title.includes("replacement opportunity") ||
          title.includes("new referral conversation")
        ) {
          addScore("Setback replacement path", 20);
        }
      }

      if (progressionSignal === "CLOSED") {
        if (
          action.href === "/job-search" ||
          action.href === "/networking"
        ) {
          addScore("Closed opportunity recovery path", 12);
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
            addScore("Learned action: REPEAT", 14);
          } else if (
            applicationActionMemory.recommendation === "MODIFY"
          ) {
            addScore("Learned action: MODIFY", 4);
          } else if (
            applicationActionMemory.recommendation === "RETIRE"
          ) {
            addScore("Learned action: RETIRE", -25);
          }
        }
      }

      return {
        action,
        evidence,
        score,
        index,
        category: getActionCategory(action),
        basePriority,
        adjustments,
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
  const selectionReasons = new Map<
    number,
    string
  >();

  const selectionContexts = new Map<
    number,
    RecoveryDecisionSelectionContext
  >();

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
      selectionReasons.set(
        financialAction.index,
        "Selected by critical-runway constraint"
      );

      selectionContexts.set(financialAction.index, {
        pass: "CRITICAL_RUNWAY",
        reason: "Selected by critical-runway constraint",
      });
    }
  }

  // First pass: maximize action diversity.
  for (const item of sortedActions) {
    if (selectedActions.length >= 5) {
      break;
    }

    if (selectedCategories.has(item.category)) {
      const competingCandidate = selectedActions.find(
        (selected) => selected.category === item.category
      );

      selectionContexts.set(item.index, {
        pass: "NOT_SELECTED",
        reason:
          "Not selected because a stronger candidate already represented this category",
        ...(competingCandidate
          ? {
              competingCandidate: competingCandidate.action.title,
              competingScore: competingCandidate.score,
            }
          : {}),
      });

      continue;
    }

    selectedActions.push(item);
    selectedCategories.add(item.category);

    if (!selectionReasons.has(item.index)) {
      selectionReasons.set(
        item.index,
        "Selected during category-diversity pass"
      );
    }

    selectionContexts.set(item.index, {
      pass: "DIVERSITY",
      reason: "Selected during category-diversity pass",
    });
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

    if (!selectionReasons.has(item.index)) {
      selectionReasons.set(
        item.index,
        "Selected during ranked fill pass"
      );
    }

    selectionContexts.set(item.index, {
      pass: "RANKED_FILL",
      reason: "Selected during ranked fill pass",
    });
  }

  // v1.37: materialize the complete candidate decision surface
  // after the existing selection algorithm has finished.
  //
  // This is deliberately downstream of scoring and selection so
  // recommendation behavior remains unchanged.
  const selectedIndexes = new Set(
    selectedActions.map((item) => item.index)
  );

  const candidateRanks = new Map<number, number>();

  sortedActions.forEach((item, index) => {
    candidateRanks.set(item.index, index + 1);
  });

  const candidateTraces: RecoveryDecisionCandidate[] =
    sortedActions.map((item) => {
      const isSelected = selectedIndexes.has(item.index);

      if (isSelected) {
        const context = selectionContexts.get(item.index) ?? {
          pass: "RANKED_FILL" as const,
          reason: "Selected for recovery recommendation",
        };

        return {
          title: item.action.title,
          href: item.action.href,
          priority: item.action.priority,
          category: item.category,
          basePriority: item.basePriority,
          adjustments: item.adjustments,
          finalScore: item.score,
          rank: candidateRanks.get(item.index) ?? 0,
          selection: "SELECTED" as const,
          selectionReason: context.reason,
          selectionContext: context,
        };
      }

      const selectionContext: RecoveryDecisionSelectionContext =
        selectionContexts.get(item.index) ?? {
          pass: "NOT_SELECTED",
          reason:
            "Not selected because stronger candidates filled the available recommendation slots",
        };

      return {
        title: item.action.title,
        href: item.action.href,
        priority: item.action.priority,
        category: item.category,
        basePriority: item.basePriority,
        adjustments: item.adjustments,
        finalScore: item.score,
        rank: candidateRanks.get(item.index) ?? 0,
        selection: "NOT_SELECTED" as const,
        selectionReason: selectionContext.reason,
        selectionContext,
      };
    });

  const finalActions = selectedActions
    .sort(
      (a, b) =>
        b.score - a.score ||
        priorityBase[b.action.priority] -
          priorityBase[a.action.priority] ||
        a.index - b.index
    )
    .slice(0, 5)
    .map(({ action, evidence, basePriority, adjustments, score, index }) => ({
      ...action,
      evidence,
      explanation: getActionExplanation(
        input,
        action,
        state,
        runwayMonths,
        pipelineSignal,
        pipelineComposition,
        evidence
      ),
      decisionTrace: {
        basePriority,
        adjustments,
        finalScore: score,
        rank: candidateRanks.get(index) ?? 0,
        selection: "SELECTED" as const,
        selectionReason:
          selectionReasons.get(index) ??
          "Selected for recovery recommendation",
        selectionContext:
          selectionContexts.get(index) ?? {
            pass: "RANKED_FILL" as const,
            reason: "Selected for recovery recommendation",
          },
        alternatives: candidateTraces.filter(
          (candidate) =>
            candidate.selection === "NOT_SELECTED"
        ),
      },
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

export function getProgressionSignal(
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

export function getPipelineHealth(
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

export function getRecoveryOutcomeIntelligence(
  outcome: RecoveryOutcome,
  progressionSignal: string,
): RecoveryOutcomeIntelligence {
  if (outcome.status === "POSITIVE" || progressionSignal === "ADVANCING") {
    return {
      direction: "POSITIVE",
      impact: "MEDIUM",
      implication:
        "The latest outcome supports the current recovery direction and provides evidence to continue execution.",
      evidence: outcome.evidence,
    };
  }

  if (
    outcome.status === "NEGATIVE" ||
    progressionSignal === "SETBACK" ||
    progressionSignal === "CLOSED"
  ) {
    const isClosed = progressionSignal === "CLOSED";

    return {
      direction: "NEGATIVE",
      impact: isClosed ? "HIGH" : "MEDIUM",
      implication: isClosed
        ? "The recovery pipeline lost an opportunity, reducing available recovery capacity and increasing the need to reassess the current path."
        : "The latest outcome weakens the evidence supporting the current recovery direction and should be evaluated before expanding activity.",
      evidence: outcome.evidence,
    };
  }

  return {
    direction: "NEUTRAL",
    impact: "LOW",
    implication:
      "The latest outcome does not provide enough directional evidence to change the current recovery approach.",
    evidence: outcome.evidence,
  };
}

export function getRecoveryOutcome(
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

export function getRecoveryDirection(
  state: RecoveryState,
  progressionSignal: string,
  outcomeIntelligence: RecoveryOutcomeIntelligence,
  learning: RecoveryLearning,
  recalibration?: RecoveryRecalibration,
  actionEffect: RecoveryActionEffect = {
    status: "UNKNOWN",
    headline: "",
    summary: "",
    evidence: [],
    recommendation: "",
  },
): RecoveryDirection {
  if (state === "RECOVERED") {
    return {
      direction: "CLOSEOUT",
      rationale:
        "Employment recovery is operational, so the recovery system should transition from search activity to closeout and stabilization.",
      evidence: [
        "Recovery state is RECOVERED.",
        "The active recovery loop no longer requires pipeline expansion.",
      ],
      source: "RECOVERY",
      confidence: "HIGH",
    };
  }

  if (progressionSignal === "CLOSED") {
    return {
      direction: "REBUILD",
      rationale:
        "The latest recovery opportunity closed, reducing available pipeline capacity and requiring replacement recovery capacity.",
      evidence: outcomeIntelligence.evidence,
      source: "CLOSURE",
      confidence: "HIGH",
    };
  }

  if (progressionSignal === "SETBACK") {
    return {
      direction: "SHIFT",
      rationale:
        "The latest recovery evidence weakened the current path, so the system should change direction before repeating the same pattern at greater volume.",
      evidence: [
        ...outcomeIntelligence.evidence,
        learning.learning,
      ],
      source: "SETBACK",
      confidence:
        learning.confidence === "HIGH" ||
        outcomeIntelligence.impact === "HIGH"
          ? "HIGH"
          : "MEDIUM",
    };
  }

  if (actionEffect.status === "NEGATIVE") {
    return {
      direction: "SHIFT",
      rationale:
        "The latest completed recovery action was followed by negative evidence, so the recovery approach should change before repeating the same action or increasing activity.",
      evidence: actionEffect.evidence,
      source: "SETBACK",
      confidence: "HIGH",
    };
  }

  if (progressionSignal === "ADVANCING") {
    const lateStageState =
      state === "INTERVIEWING" ||
      state === "FINAL_ROUND" ||
      state === "OFFER";

    if (
      lateStageState &&
      learning.confidence !== "LOW"
    ) {
      return {
        direction: "INTENSIFY",
        rationale:
          "The recovery pipeline is progressing and the latest learning supports the current path, so effort should concentrate on converting the active opportunity.",
        evidence: [
          ...outcomeIntelligence.evidence,
          learning.learning,
        ],
        source: "ADVANCEMENT",
        confidence: learning.confidence,
      };
    }

    return {
      direction: "CONTINUE",
      rationale:
        "The latest recovery evidence supports the current direction, so execution should continue without introducing a new recovery path.",
      evidence: [
        ...outcomeIntelligence.evidence,
        learning.learning,
      ],
      source: "ADVANCEMENT",
      confidence:
        learning.confidence === "LOW"
          ? "MEDIUM"
          : learning.confidence,
    };
  }

  return {
    direction: "CONTINUE",
    rationale:
      "The available recovery evidence is insufficient to justify a directional change, so the current recovery path should continue until a stronger signal appears.",
    evidence: learning.evidence,
    source: "INSUFFICIENT",
    confidence: "LOW",
  };
}

export function getRecoveryDirectionMemory(
  previousDirection: RecoveryDirection["direction"] | null,
  currentDirection: RecoveryDirection,
): RecoveryDirectionMemory {
  const changed =
    previousDirection !== null &&
    previousDirection !== currentDirection.direction;

  return {
    changed,
    previousDirection,
    currentDirection: currentDirection.direction,
    source: currentDirection.source,
    rationale: changed
      ? currentDirection.rationale
      : "The recovery direction has not changed from the available previous direction.",
    evidence: currentDirection.evidence,
    confidence: currentDirection.confidence,
  };
}

export function getRecoveryDirectionStability(
  memory: RecoveryDirectionMemory,
): RecoveryDirectionStability {
  if (memory.previousDirection === null) {
    return {
      status: "INITIAL",
      previousDirection: null,
      currentDirection: memory.currentDirection,
      rationale:
        "No previous recovery direction is available, so this is the initial directional state.",
      confidence: memory.confidence,
    };
  }

  if (!memory.changed) {
    return {
      status: "STABLE",
      previousDirection: memory.previousDirection,
      currentDirection: memory.currentDirection,
      rationale:
        "The recovery direction is unchanged from the available previous direction.",
      confidence: memory.confidence,
    };
  }

  const resetDirections = new Set<RecoveryDirection["direction"]>([
    "CLOSEOUT",
    "REBUILD",
  ]);

  const isReset =
    resetDirections.has(memory.previousDirection) ||
    resetDirections.has(memory.currentDirection);

  return {
    status: isReset ? "RESET" : "CHANGED",
    previousDirection: memory.previousDirection,
    currentDirection: memory.currentDirection,
    rationale: isReset
      ? "The recovery direction crossed a materially different recovery path, so the previous directional state should be treated as reset."
      : "The recovery direction changed from the available previous direction.",
    confidence: memory.confidence,
  };
}

export function getRecoveryDirectionPersistence(
  stability: RecoveryDirectionStability,
  previousRecoveryDirectionCycles?: number,
): RecoveryDirectionPersistence {
  const previousCycles = Math.max(
    0,
    Math.floor(previousRecoveryDirectionCycles ?? 0),
  );

  if (stability.status === "STABLE") {
    return {
      direction: stability.currentDirection,
      consecutiveCycles: previousCycles + 1,
      status: "PERSISTING",
      rationale:
        "The recovery direction is unchanged, so its persistence continues across recovery cycles.",
      confidence: stability.confidence,
    };
  }

  if (stability.status === "RESET") {
    return {
      direction: stability.currentDirection,
      consecutiveCycles: 1,
      status: "RESET",
      rationale:
        "The recovery direction crossed a materially different path, so directional persistence has been reset.",
      confidence: stability.confidence,
    };
  }

  return {
    direction: stability.currentDirection,
    consecutiveCycles: 1,
    status: "NEW",
    rationale:
      stability.status === "INITIAL"
        ? "This is the first available recovery direction, so persistence begins at one cycle."
        : "The recovery direction changed, so persistence starts again from one cycle.",
    confidence: stability.confidence,
  };
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
  const outcomeIntelligence = getRecoveryOutcomeIntelligence(
    outcome,
    progressionSignal,
  );

  const recoveryLearning = getRecoveryLearning(
    outcome,
    outcomeIntelligence,
    progressionSignal,
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

  const recoveryDirection = getRecoveryDirection(
    state,
    progressionSignal,
    outcomeIntelligence,
    recoveryLearning,
    undefined,
    actionEffect,
  );

  const recoveryDirectionMemory = getRecoveryDirectionMemory(
    input.previousRecoveryDirection ?? null,
    recoveryDirection,
  );

  const recoveryDirectionStability = getRecoveryDirectionStability(
    recoveryDirectionMemory,
  );

  const recoveryDirectionPersistence =
    getRecoveryDirectionPersistence(
      recoveryDirectionStability,
      input.previousRecoveryDirectionCycles,
    );


  const recoveryDecision = getRecoveryDecision(
    input,
    state,
    runwayMonths,
    recentProgression,
    progressionSignal,
    pipelineSignal,
    pipelineComposition,
    recoveryDirection,
    recoveryDirectionPersistence,
  );

  const recoveryStrategy = getRecoveryStrategy(
    recoveryDecision,
    recoveryDirection,
    recoveryDirectionPersistence,
  );

  const recoveryExecutionPlan = getRecoveryExecutionPlan(
    recoveryDecision,
    recoveryStrategy,
    recoveryDirection,
    recoveryDirectionPersistence,
  );

  const actions = getActions(
    input,
    state,
    runwayMonths,
    recentProgression,
    progressionSignal,
    pipelineSignal,
    pipelineComposition
  );

  const executionActions = getExecutionActions(
    recoveryExecutionPlan,
    actions,
    recoveryDirectionPersistence
  );

  const recoveryRecalibration = getRecoveryRecalibration(
    state,
    progressionSignal,
    recoveryDecision,
    recoveryStrategy,
    recoveryExecutionPlan,
    actions,
    recoveryLearning,
    actionEffect,
    recoveryDirectionPersistence,
  );


  const recoveryCycleState = getRecoveryCycleState(
    recoveryRecalibration,
    recoveryDirectionPersistence,
  );

  const recoveryCycleMemory = getRecoveryCycleMemory(
    input.previousRecoveryCycleState,
    recoveryCycleState,
  );

  const recoveryCycleTransition = getRecoveryCycleTransition(
    input.previousRecoveryCycleState,
    recoveryCycleState,
  );

  const recoveryCycleTransitionMemory =
    getRecoveryCycleTransitionMemory(
      input.previousRecoveryCycleTransition,
      recoveryCycleTransition.transition,
    );

  const recoveryCycleTransitionPattern =
    getRecoveryCycleTransitionPattern(
      input.previousRecoveryCycleTransitionPattern,
      recoveryCycleTransition.transition,
    );

  const recoveryCycleTransitionPatternMemory =
    getRecoveryCycleTransitionPatternMemory(
      input.previousRecoveryCycleTransitionPattern?.pattern,
      recoveryCycleTransitionPattern.pattern,
    );

  const previousPatternPersistence =
    input.previousRecoveryCycleTransitionPattern
      ? {
          pattern: input.previousRecoveryCycleTransitionPattern.pattern,
          occurrences: input.previousRecoveryCycleTransitionPattern.occurrences,
          persistent:
            input.previousRecoveryCycleTransitionPattern.occurrences >= 3,
          rationale:
            input.previousRecoveryCycleTransitionPattern.rationale,
        }
      : null;

  const recoveryCycleTransitionPatternPersistence =
    getRecoveryCycleTransitionPatternPersistence(
      previousPatternPersistence,
      recoveryCycleTransitionPattern.pattern,
    );


  const recoveryCycleTransitionPatternResponse =
    getRecoveryCycleTransitionPatternResponse(
      recoveryCycleTransitionPatternPersistence,
    );


  const recoveryCycleTransitionPatternConsequence =
    getRecoveryCycleTransitionPatternConsequence(
      recoveryCycleTransitionPatternResponse,
    );

  const recoveryCycleTransitionPatternConsequenceMemory =
    getRecoveryCycleTransitionPatternConsequenceMemory(
      input.previousRecoveryCycleTransitionPatternConsequence,
      recoveryCycleTransitionPatternConsequence.consequence,
    );

  const recoveryCycleTransitionPatternConsequencePersistence =
    getRecoveryCycleTransitionPatternConsequencePersistence(
      input.previousRecoveryCycleTransitionPatternConsequencePersistence,
      recoveryCycleTransitionPatternConsequence.consequence,
    );

  const recoveryCycleTransitionPatternConsequenceResponse =
    getRecoveryCycleTransitionPatternConsequenceResponse(
      recoveryCycleTransitionPatternConsequencePersistence,
    );

  const recoveryCycleTransitionPatternConsequenceResponseMemory =
    getRecoveryCycleTransitionPatternConsequenceResponseMemory(
      input.previousRecoveryCycleTransitionPatternConsequenceResponse,
      recoveryCycleTransitionPatternConsequenceResponse.response,
    );

  const recoveryCycleTransitionPatternConsequenceResponsePersistence =
    getRecoveryCycleTransitionPatternConsequenceResponsePersistence(
      input.previousRecoveryCycleTransitionPatternConsequenceResponsePersistence,
      recoveryCycleTransitionPatternConsequenceResponse.response,
    );

  const recoveryCycleTransitionPatternConsequenceResponseConsequence =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequence(
      recoveryCycleTransitionPatternConsequenceResponse,
    );

  const recoveryCycleTransitionPatternConsequenceResponseConsequenceMemory =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceMemory(
      input.previousRecoveryCycleTransitionPatternConsequenceResponseConsequence,
      recoveryCycleTransitionPatternConsequenceResponseConsequence.consequence,
    );

  return {
    recoveryCycleTransitionPatternConsequenceResponseConsequence,
        recoveryCycleTransitionPatternConsequenceResponseConsequenceMemory,
recoveryCycleTransitionPatternConsequenceResponsePersistence,
    recoveryCycleTransitionPatternConsequenceResponseMemory,
    recoveryCycleTransitionPatternConsequenceResponse,
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
    outcomeIntelligence,
    learning: recoveryLearning,
    recalibration: recoveryRecalibration,
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
    recoveryDecision,
    recoveryStrategy,
    recoveryExecutionPlan,
    executionActions,
    recoveryRecalibration,
    recoveryCycleState,
    recoveryCycleMemory,
    recoveryCycleTransition,
    recoveryCycleTransitionMemory,
    recoveryCycleTransitionPattern,
    recoveryCycleTransitionPatternMemory,
    recoveryCycleTransitionPatternPersistence,
    recoveryCycleTransitionPatternResponse,
    recoveryCycleTransitionPatternConsequence,
    recoveryCycleTransitionPatternConsequenceMemory,
    recoveryCycleTransitionPatternConsequencePersistence,
    recoveryDirection,
    recoveryDirectionMemory,
    recoveryDirectionStability,
    recoveryDirectionPersistence,
    actions,
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

export function getApplicationActionMemory(
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

