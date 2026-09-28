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
};

export type RecoveryEngineInput = {
  recoveryTiming?: string | null;
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
  }>;

  interviews?: Array<{
    stage?: string | null;
  }>;

  companies?: Array<{
    status?: string | null;
  }>;

  networkContacts?: Array<{
    status?: string | null;
  }>;
};

export type RecoveryEngineResult = {
  state: RecoveryState;
  stateLabel: string;
  stateReason: string;
  runwayMonths: number | null;
  priorities: RecoveryPriority[];
  actions: RecoveryAction[];
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
    (input.otherIncome ?? 0) + (input.benefits ?? 0);

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
  const careerStage = normalize(input.careerStage);
  const applicationCount = input.applications?.length ?? 0;
  const interviewCount = input.interviews?.length ?? 0;

  const hasOffer =
    careerStage === "offers" ||
    careerStage === "offer" ||
    input.interviews?.some((item) => {
      const stage = normalize(item.stage);
      return stage === "offer" || stage === "accepted";
    });

  if (hasOffer) {
    return "OFFER";
  }

  const hasFinalRound =
    careerStage === "finals" ||
    input.interviews?.some(
      (item) => normalize(item.stage) === "final"
    );

  if (hasFinalRound) {
    return "FINAL_ROUND";
  }

  if (interviewCount > 0 || careerStage === "interviews") {
    return "INTERVIEWING";
  }

  if (applicationCount > 0 || careerStage === "applying") {
    return "SEARCHING";
  }

  if (
    normalize(input.recoveryTiming) === "this week" ||
    normalize(input.recoveryTiming) === "week"
  ) {
    return "JUST_LAID_OFF";
  }

  return "STABILIZING";
}

function getPriorities(
  input: RecoveryEngineInput,
  state: RecoveryState,
  runwayMonths: number | null
): RecoveryPriority[] {
  const priorities: RecoveryPriority[] = [];

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
    priorities.push("APPLICATIONS");
    priorities.push("NETWORKING");
  }

  if (
    state === "INTERVIEWING" ||
    state === "FINAL_ROUND"
  ) {
    priorities.push("INTERVIEWS");
    priorities.push("NETWORKING");
  }

  if (state === "OFFER") {
    priorities.push("INTERVIEWS");
    priorities.push("FINANCIAL");
  }

  const focus = normalize(input.primaryFocus);

  if (focus.includes("financial") && !priorities.includes("FINANCIAL")) {
    priorities.unshift("FINANCIAL");
  }

  if (focus.includes("network") && !priorities.includes("NETWORKING")) {
    priorities.unshift("NETWORKING");
  }

  if (focus.includes("interview") && !priorities.includes("INTERVIEWS")) {
    priorities.unshift("INTERVIEWS");
  }

  if (
    focus.includes("application") &&
    !priorities.includes("APPLICATIONS")
  ) {
    priorities.unshift("APPLICATIONS");
  }

  const fallback: RecoveryPriority[] = [
    "APPLICATIONS",
    "NETWORKING",
    "FINANCIAL",
    "INTERVIEWS",
    "DIRECTION",
  ];

  for (const priority of fallback) {
    if (!priorities.includes(priority)) {
      priorities.push(priority);
    }
  }

  return priorities.slice(0, 3);
}

function getActions(
  input: RecoveryEngineInput,
  state: RecoveryState,
  runwayMonths: number | null,
  priorities: RecoveryPriority[]
): RecoveryAction[] {
  const actions: RecoveryAction[] = [];

  const add = (
    title: string,
    reason: string,
    href: string,
    priority: RecoveryPriority
  ) => {
    if (!actions.some((action) => action.title === title)) {
      actions.push({ title, reason, href, priority });
    }
  };

  const finalRoundInterviews =
    input.interviews?.filter(
      (item) => normalize(item.stage) === "final"
    ).length ?? 0;

  const offerInterviews =
    input.interviews?.filter((item) => {
      const stage = normalize(item.stage);
      return stage === "offer" || stage === "accepted";
    }).length ?? 0;

  const activeApplications =
    input.applications?.filter((item) => {
      const stage = normalize(item.stage);
      return stage !== "rejected";
    }).length ?? 0;

  const networkContacts =
    input.networkContacts?.filter((item) => {
      const status = normalize(item.status);
      return status !== "closed" && status !== "inactive";
    }).length ?? 0;

  /*
   * The engine deliberately creates distinct actions.
   * One action = one concrete type of work.
   */

  if (state === "FINAL_ROUND") {
    add(
      finalRoundInterviews > 0
        ? "Prepare for your final-round interview"
        : "Review your final-round opportunity",
      "A final-round opportunity is active, so interview preparation should take priority over broad search activity.",
      "/interviews",
      "INTERVIEWS"
    );

    add(
      "Complete outstanding interview follow-ups",
      "Final-round opportunities are time-sensitive, so open follow-ups should not sit unresolved.",
      "/interviews",
      "INTERVIEWS"
    );

    if (networkContacts > 0) {
      add(
        "Contact your strongest referral opportunity",
        "Use your existing network to strengthen an active opportunity rather than sending broad outreach.",
        "/networking",
        "NETWORKING"
      );
    } else {
      add(
        "Add your first referral conversation",
        "A focused referral conversation creates another path alongside the interview pipeline.",
        "/networking",
        "NETWORKING"
      );
    }

    if (activeApplications > 0) {
      add(
        "Review your active application pipeline",
        "Keep existing opportunities moving while your strongest opportunity is in the final round.",
        "/job-search",
        "APPLICATIONS"
      );
    } else {
      add(
        "Add your next target application",
        "Keep the pipeline from becoming dependent on a single opportunity.",
        "/job-search",
        "APPLICATIONS"
      );
    }
  }

  if (state === "INTERVIEWING") {
    add(
      "Prepare for your next interview",
      "Your current stage makes interview preparation the most time-sensitive search activity.",
      "/interviews",
      "INTERVIEWS"
    );

    add(
      "Complete outstanding interview follow-ups",
      "Prompt follow-up keeps active interview processes moving.",
      "/interviews",
      "INTERVIEWS"
    );

    add(
      networkContacts > 0
        ? "Contact your strongest referral opportunity"
        : "Add your first referral conversation",
      "Use networking to create additional paths into relevant opportunities.",
      "/networking",
      "NETWORKING"
    );

    add(
      activeApplications > 0
        ? "Review your active application pipeline"
        : "Add your next target application",
      "Maintain enough pipeline activity to avoid depending on one interview process.",
      "/job-search",
      "APPLICATIONS"
    );

    if (runwayMonths !== null && runwayMonths < 4) {
      add(
        "Review your financial runway",
        "Your runway is below four months, so financial planning needs attention alongside the interview pipeline.",
        "/runway",
        "FINANCIAL"
      );
    }
  }

  if (state === "SEARCHING" || state === "STABILIZING") {
    if (runwayMonths !== null && runwayMonths < 4) {
      add(
        "Review your financial runway",
        "Your runway is below four months, so cash preservation needs immediate attention.",
        "/runway",
        "FINANCIAL"
      );
    }

    add(
      activeApplications > 0
        ? "Review your active application pipeline"
        : "Add your first target application",
      "Keep the job-search pipeline moving with a concrete application action.",
      "/job-search",
      "APPLICATIONS"
    );

    add(
      networkContacts > 0
        ? "Contact your strongest referral opportunity"
        : "Add your first referral conversation",
      "Direct conversations and referrals can complement application volume.",
      "/networking",
      "NETWORKING"
    );

    add(
      "Review your weekly recovery plan",
      "Use the plan to turn broad recovery goals into concrete work for this week.",
      "/plan",
      "DIRECTION"
    );

    if (state === "STABILIZING") {
      add(
        "Complete your first 72 hours",
        "Immediate administrative and financial tasks should be handled before expanding the search.",
        "/first-72-hours",
        "DIRECTION"
      );
    }
  }

  if (state === "JUST_LAID_OFF") {
    add(
      "Complete your first 72 hours",
      "You are early in the recovery process, so immediate administrative and financial tasks come first.",
      "/first-72-hours",
      "DIRECTION"
    );

    add(
      "Review your financial runway",
      "Knowing exactly how long your current resources last gives you a concrete planning horizon.",
      "/runway",
      "FINANCIAL"
    );

    add(
      "Build your first target list",
      "A focused target-company list gives the job search a clear starting point.",
      "/companies",
      "APPLICATIONS"
    );

    add(
      "Add your first networking contacts",
      "Early conversations can open opportunities before you rely heavily on applications.",
      "/networking",
      "NETWORKING"
    );

    add(
      "Set this week's recovery plan",
      "A short weekly plan prevents the first week after a layoff from becoming unstructured.",
      "/plan",
      "DIRECTION"
    );
  }

  if (state === "OFFER") {
    add(
      "Review your offer pipeline",
      "An offer changes the immediate priority from broad search activity to evaluation and decision-making.",
      "/interviews",
      "INTERVIEWS"
    );

    add(
      "Review compensation and decision dates",
      "Keep the practical details of the offer process visible before making a decision.",
      "/interviews",
      "INTERVIEWS"
    );

    add(
      "Review your financial position",
      "Compare the opportunity against your current runway and financial needs.",
      "/runway",
      "FINANCIAL"
    );

    add(
      "Keep your strongest backup opportunity warm",
      "Maintaining one active alternative can reduce unnecessary dependence on a single outcome.",
      "/networking",
      "NETWORKING"
    );
  }

  if (state === "RECOVERED") {
    add(
      "Review your recovery data",
      "Capture where you ended up so the recovery journey remains useful as a record.",
      "/data",
      "DIRECTION"
    );

    add(
      "Archive completed job-search activity",
      "Keep the active pipeline focused on opportunities that still require action.",
      "/job-search",
      "APPLICATIONS"
    );
  }

  /*
   * Safety net: every state gets useful work even if the state-specific
   * rules above did not fill all five slots.
   */

  const fallbackActions: RecoveryAction[] = [
    {
      title: "Review your weekly recovery plan",
      reason:
        "Use your current plan to identify the next concrete action for this week.",
      href: "/plan",
      priority: "DIRECTION",
    },
    {
      title: "Review your financial runway",
      reason:
        "Keep your financial planning current while your employment situation changes.",
      href: "/runway",
      priority: "FINANCIAL",
    },
    {
      title: "Review your target companies",
      reason:
        "Keep your target-company list focused and actionable.",
      href: "/companies",
      priority: "APPLICATIONS",
    },
  ];

  for (const action of fallbackActions) {
    if (actions.length >= 5) break;

    if (!actions.some((item) => item.title === action.title)) {
      actions.push(action);
    }
  }

  /*
   * Ensure the final list respects the engine's priority ordering.
   * Within a priority, preserve the concrete action order above.
   */

  const priorityOrder = new Map(
    priorities.map((priority, index) => [priority, index])
  );

  return actions
    .sort(
      (a, b) =>
        (priorityOrder.get(a.priority) ?? 99) -
        (priorityOrder.get(b.priority) ?? 99)
    )
    .slice(0, 5);
}

export function calculateRecovery(
  input: RecoveryEngineInput
): RecoveryEngineResult {
  const runwayMonths = calculateRunway(input);
  const state = getState(input);

  const priorities = getPriorities(
    input,
    state,
    runwayMonths
  );

  const actions = getActions(
    input,
    state,
    runwayMonths,
    priorities
  );

  const stateLabels: Record<RecoveryState, string> = {
    JUST_LAID_OFF: "Just laid off",
    STABILIZING: "Stabilizing",
    SEARCHING: "Actively searching",
    INTERVIEWING: "Interviewing",
    FINAL_ROUND: "Final round",
    OFFER: "Offer stage",
    RECOVERED: "Recovered",
  };

  const stateReasons: Record<RecoveryState, string> = {
    JUST_LAID_OFF:
      "You're early in the recovery process, so immediate stabilization comes first.",
    STABILIZING:
      "Your recovery profile does not yet show an active interview or application pipeline.",
    SEARCHING:
      "You have an active job-search pipeline but no current interview or final-round signal.",
    INTERVIEWING:
      "Your current pipeline includes interviews, so preparation and follow-up become more important.",
    FINAL_ROUND:
      "You have a final-round opportunity, making interview execution and follow-up time-sensitive.",
    OFFER:
      "Your pipeline includes an offer-stage opportunity.",
    RECOVERED:
      "Your recovery process indicates that you have reached a recovered state.",
  };

  return {
    state,
    stateLabel: stateLabels[state],
    stateReason: stateReasons[state],
    runwayMonths,
    priorities,
    actions,
  };
}
