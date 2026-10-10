/**
 * Short wedding timelines shown under the planning sheet. Kept deliberately brief: one line per
 * step, so a couple sees at a glance what to do and when.
 */

export type PlanStep = {
  /** When, counted back from the wedding day. */
  when: string;
  /** What to do, in a few words. */
  what: string;
};

export type WeddingPlan = {
  slug: string;
  /** How much time is left, e.g. "12 months". */
  time: string;
  /** Who it suits, in a few words. */
  note: string;
  steps: PlanStep[];
};

export const WEDDING_PLANS: WeddingPlan[] = [
  {
    slug: "12-months",
    time: "12 months",
    note: "Time to save and choose",
    steps: [
      { when: "12–10 months", what: "Tell the families, pick the date" },
      { when: "9–7 months", what: "Set the budget and the committee" },
      { when: "6–4 months", what: "Book venue, decor and outfits" },
      { when: "3–1 months", what: "Invitations, Gusaba, final check" },
    ],
  },
  {
    slug: "6-months",
    time: "6 months",
    note: "Part of the budget ready",
    steps: [
      { when: "Month 1", what: "Date, budget, book the venue" },
      { when: "Months 2–3", what: "Book decor, outfits and photos" },
      { when: "Months 4–5", what: "Gusaba and invitations" },
      { when: "Last month", what: "Confirm vendors and payments" },
    ],
  },
  {
    slug: "3-months",
    time: "3 months",
    note: "Budget ready, simple wedding",
    steps: [
      { when: "Weeks 1–3", what: "Date, guest list, venue" },
      { when: "Weeks 4–8", what: "Decor, outfits, Gusaba" },
      { when: "Weeks 9–12", what: "Invitations and final check" },
    ],
  },
];
