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
  runwayMonths: number | null
): RecoveryAction[] {
  const actions: RecoveryAction[] = [];

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

  if (state === "STABILIZING" || state === "SEARCHING") {
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
      title: "Prepare for your final-round interview",
      reason:
        "A final-round opportunity makes interview preparation and follow-up time-sensitive.",
      href: "/interviews",
      priority: "INTERVIEWS",
    });

    actions.push({
      title:
        interviewsNeedingAttention.length > 0
          ? "Review your final-round follow-ups"
          : "Track your final-round follow-up",
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
    actions.push(
      {
        title: "Review your offer pipeline",
        reason:
          "Keep the offer, decision timeline, and next steps clearly tracked.",
        href: "/interviews",
        priority: "INTERVIEWS",
      },
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

  const priorityOrder: Record<RecoveryPriority, number> = {
    FINANCIAL: 1,
    INTERVIEWS: 2,
    APPLICATIONS: 3,
    NETWORKING: 4,
    DIRECTION: 5,
  };

  const completedActions = input.completedActions ?? [];

  return actions
    .filter(
      (action) =>
        !completedActions.some(
          (completed) =>
            completed.title === action.title &&
            completed.href === action.href
        )
    )
    .sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority]
    )
    .slice(0, 5)
    .map((action) => ({
      ...action,
      evidence: getActionEvidence(
        input,
        action,
        state,
        runwayMonths
      ),
    }));
}

function getStateLabel(state: RecoveryState) {
  const labels: Record<RecoveryState, string> = {
    JUST_LAID_OFF: "Just laid off",
    STABILIZING: "Stabilizing",
    SEARCHING: "Actively searching",
    INTERVIEWING: "Interviewing",
    FINAL_ROUND: "Final round",
    OFFER: "Offer stage",
    RECOVERED: "Recovered",
  };

  return labels[state];
}

function getStateReason(
  state: RecoveryState,
  input: RecoveryEngineInput
) {
  const activeApplications = (input.applications ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const activeInterviews = (input.interviews ?? []).filter((item) => {
    const stage = normalize(item.stage);
    return stage !== "rejected" && stage !== "withdrawn";
  });

  const reasons: Record<RecoveryState, string> = {
    JUST_LAID_OFF:
      "You appear to be in the immediate post-layoff period, so stabilization and setup come first.",
    STABILIZING:
      "Your recovery data does not yet show an active application or interview pipeline, so the next step is to establish one.",
    SEARCHING:
      `You have ${activeApplications.length} active application${activeApplications.length === 1 ? "" : "s"} in motion, so the focus is consistent search execution.`,
    INTERVIEWING:
      `You have ${activeInterviews.length} active interview${activeInterviews.length === 1 ? "" : "s"}, making preparation and follow-up important.`,
    FINAL_ROUND:
      "You have a final-round opportunity, making interview execution and follow-up time-sensitive.",
    OFFER:
      "You have reached an offer-stage opportunity, so the focus shifts toward decision quality, timing, and financial implications.",
    RECOVERED:
      "Your profile indicates that employment has resumed, so the recovery workflow can transition into closeout and reassessment.",
  };

  return reasons[state];
}

export function calculateRecovery(
  input: RecoveryEngineInput
): RecoveryEngineResult {
  const runwayMonths = calculateRunway(input);
  const state = getState(input);

  return {
    state,
    stateLabel: getStateLabel(state),
    stateReason: getStateReason(state, input),
    runwayMonths,
    priorities: getPriorities(input, state, runwayMonths),
    actions: getActions(input, state, runwayMonths),
  };
}
