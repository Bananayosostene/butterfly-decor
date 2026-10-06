/**
 * Wedding planning "courses". Each plan fits a different amount of time before the wedding and
 * is split into phases; the course walks the couple through them one step at a time.
 *
 * UI-only for now: this content lives in code and progress is kept in the browser. When the
 * backend is added, plans can move to the database and progress to the user's account.
 */

export type PlanPhase = {
  /** When this phase happens, counted back from the wedding day. */
  period: string;
  title: string;
  summary: string;
  activities: string[];
};

export type WeddingPlan = {
  slug: string;
  /** Short label on the timeline tabs. */
  tab: string;
  title: string;
  duration: string;
  /** Who this plan suits. */
  bestFor: string;
  description: string;
  /** What the couple must already have or be ready for, so they can judge if it is possible. */
  requirements: string[];
  phases: PlanPhase[];
};

export const WEDDING_PLANS: WeddingPlan[] = [
  {
    slug: "12-months",
    tab: "12 months",
    title: "The Relaxed Plan",
    duration: "12 months or more",
    bestFor: "Couples who want time to save, compare and enjoy the journey.",
    description:
      "The standard preparation time. You have room to save money, book the best vendors early and prepare both families without pressure.",
    requirements: [
      "A wedding date at least 12 months away",
      "A monthly amount you can both save",
      "Time for pre-marital counselling",
    ],
    phases: [
      {
        period: "12–10 months before",
        title: "Decide and tell the families",
        summary: "Agree on the big questions as a couple, then bring both families in.",
        activities: [
          "Talk about values, children, money and where you will live",
          "Agree on a rough date and the size of the wedding",
          "Plan the first family visit (gufata irembo)",
          "Start pre-marital counselling or choose a mentor couple",
        ],
      },
      {
        period: "9–7 months before",
        title: "Budget and committee",
        summary: "Turn wishes into numbers and gather the people who will help.",
        activities: [
          "Set the total budget and who contributes what",
          "Write the guest list for both families",
          "Form a wedding committee with a trusted treasurer",
          "Set the dates for Gusaba, civil and religious ceremonies",
        ],
      },
      {
        period: "6–4 months before",
        title: "Book vendors and style",
        summary: "Good vendors are booked months ahead. Lock them in now.",
        activities: [
          "Choose your colours and decoration style",
          "Book the venue, decor, catering and photography",
          "Choose and fit the bridal gown and the groom's suit",
          "Confirm documents with your Sector office",
        ],
      },
      {
        period: "3–1 months before",
        title: "Invitations and final details",
        summary: "Everything is chosen; now confirm, pay and hand over.",
        activities: [
          "Send invitations and track who is coming",
          "Hold the Gusaba no Gukwa ceremony",
          "Write the programme for the day with timings",
          "Name a day coordinator and confirm every vendor",
        ],
      },
    ],
  },
  {
    slug: "6-months",
    tab: "6 months",
    title: "The Balanced Plan",
    duration: "6 to 9 months",
    bestFor: "Couples with some savings who can make decisions together quickly.",
    description:
      "Enough time for every ceremony if you decide quickly. Booking vendors comes early, so you need part of the budget ready from the start.",
    requirements: [
      "A wedding date 6 to 9 months away",
      "At least a third of the budget already available",
      "Both families informed and supportive",
    ],
    phases: [
      {
        period: "Month 1",
        title: "Agree, budget and book the date",
        summary: "The first month sets everything: decisions, money and dates.",
        activities: [
          "Agree on the date, budget and guest numbers",
          "Visit the families and choose spokespeople",
          "Form the committee and name a treasurer",
          "Book the venue before anything else",
        ],
      },
      {
        period: "Months 2–3",
        title: "Vendors, outfits and documents",
        summary: "Book the people and prepare the papers.",
        activities: [
          "Book decor, catering, photography and sound",
          "Choose outfits and start fittings",
          "Confirm civil ceremony documents and book the date",
          "Start church preparation classes",
        ],
      },
      {
        period: "Months 4–5",
        title: "Ceremonies and invitations",
        summary: "The family ceremony happens and the guests are invited.",
        activities: [
          "Hold the Gusaba no Gukwa ceremony",
          "Design and send invitations",
          "Agree outfits for bridesmaids and groomsmen",
          "Pay vendor deposits and keep the receipts",
        ],
      },
      {
        period: "Final month",
        title: "Confirm and rest",
        summary: "Hand over the details so you can be present on the day.",
        activities: [
          "Write the programme with timings",
          "Confirm every vendor one week before",
          "Prepare final payments in labelled envelopes",
          "Plan the Gutwikurura with both families",
        ],
      },
    ],
  },
  {
    slug: "3-4-months",
    tab: "3–4 months",
    title: "The Focused Plan",
    duration: "3 to 4 months",
    bestFor: "Couples who are decided, have most of the budget and want a simpler wedding.",
    description:
      "Possible, but only with quick decisions and a ready budget. Keep the guest list and the number of events small, and decide once.",
    requirements: [
      "Most of the budget available now",
      "Families already agree to the marriage",
      "Willingness to keep the wedding simple",
      "One or two hours every week for planning together",
    ],
    phases: [
      {
        period: "Weeks 1–3",
        title: "Decide everything once",
        summary: "No time to revisit choices: decide, write it down and move on.",
        activities: [
          "Fix the date, budget and guest list in one sitting",
          "Meet both families and agree on the ceremonies",
          "Book the venue and the civil ceremony date",
          "Choose a small committee you fully trust",
        ],
      },
      {
        period: "Weeks 4–8",
        title: "Book and fit",
        summary: "Take vendors who are available rather than waiting for a favourite.",
        activities: [
          "Book decor, catering and photography",
          "Rent or buy outfits and do one fitting",
          "Hold a simple Gusaba ceremony",
          "Send invitations (digital is fastest)",
        ],
      },
      {
        period: "Weeks 9–12",
        title: "Confirm and hand over",
        summary: "Lock the plan and let your coordinator take the questions.",
        activities: [
          "Write the programme for the day",
          "Confirm vendors and final payments",
          "Brief your day coordinator",
          "Rest in the final week",
        ],
      },
    ],
  },
  {
    slug: "1-2-months",
    tab: "1–2 months",
    title: "The Express Plan",
    duration: "1 to 2 months",
    bestFor: "Small weddings where the budget is ready and the families already agree.",
    description:
      "Very tight. It works for a small wedding with the money in hand. Expect fewer choices of vendor and date, and accept help.",
    requirements: [
      "The full budget available now",
      "A small guest list",
      "Civil ceremony documents already in order",
      "A planner or a very committed committee",
    ],
    phases: [
      {
        period: "Week 1",
        title: "Lock the essentials",
        summary: "Date, place, money and papers, all in the first week.",
        activities: [
          "Confirm the date with your Sector office and church",
          "Book any available venue that fits your guests",
          "Agree the budget and give the treasurer the money",
          "Tell the families the date and the plan",
        ],
      },
      {
        period: "Weeks 2–4",
        title: "Book what is available",
        summary: "Speed matters more than perfection now.",
        activities: [
          "Book decor, food and a photographer",
          "Rent outfits that fit without alterations",
          "Send digital invitations",
          "Hold a short family introduction",
        ],
      },
      {
        period: "Final weeks",
        title: "Confirm and breathe",
        summary: "Check everything once, then trust your team.",
        activities: [
          "Write a simple programme",
          "Confirm vendors and pay what is due",
          "Give all phone numbers to your coordinator",
          "Sleep and eat well before the day",
        ],
      },
    ],
  },
];

export function getWeddingPlan(slug: string) {
  return WEDDING_PLANS.find((p) => p.slug === slug);
}

// ── Course steps ─────────────────────────────────────────────────────────────────────

export type CourseStep =
  | { id: string; kind: "intro"; title: string; text: string; points: string[] }
  | { id: string; kind: "video"; title: string; text: string; videoTitle: string; videoUrl?: string }
  | { id: string; kind: "choice"; title: string; text: string; question: string; options: string[] }
  | { id: string; kind: "checklist"; title: string; text: string; period: string; activities: string[] }
  | { id: string; kind: "finish"; title: string; text: string };

/** The steps of a plan's course: introduction, a short lesson, a choice, each phase, the finish. */
export function courseSteps(plan: WeddingPlan): CourseStep[] {
  return [
    {
      id: "intro",
      kind: "intro",
      title: "Introduction",
      text: `Welcome to ${plan.title}. You have ${plan.duration.toLowerCase()} — here is what this plan asks of you before you start.`,
      points: plan.requirements,
    },
    {
      id: "lesson",
      kind: "video",
      title: "Using the time you have",
      text: "A short lesson on how to behave as a couple in the time that remains: deciding together, speaking to your families with one voice, and protecting your peace.",
      videoTitle: "How to work as a team while planning",
    },
    {
      id: "ceremonies",
      kind: "choice",
      title: "Your ceremonies",
      text: "Choose the ceremonies you will hold. Your plan focuses on what you pick.",
      question: "Which ceremonies are part of your wedding?",
      options: ["Gufata irembo (first visit)", "Gusaba no Gukwa (introduction)", "Civil ceremony", "Religious ceremony", "Reception", "Gutwikurura"],
    },
    ...plan.phases.map((phase, i) => ({
      id: `phase-${i + 1}`,
      kind: "checklist" as const,
      title: phase.title,
      text: phase.summary,
      period: phase.period,
      activities: phase.activities,
    })),
    {
      id: "finish",
      kind: "finish",
      title: "You are ready",
      text: "You have gone through every phase of your plan. Keep coming back to tick activities off as you complete them.",
    },
  ];
}
