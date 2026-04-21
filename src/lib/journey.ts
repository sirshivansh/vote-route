export type GoalId =
  | "register"
  | "eligibility"
  | "learn"
  | "voting-day";

export type StepStatus = "upcoming" | "current" | "done";

export interface JourneyStep {
  id: string;
  phase: "Prepare" | "Register" | "Verify" | "Vote";
  title: string;
  shortDesc: string;
  longDesc: string;
  estimate: string;
  deadline?: string;
  action?: { label: string; href?: string };
  checklist?: string[];
}

export interface Goal {
  id: GoalId;
  emoji: string;
  title: string;
  subtitle: string;
}

export const GOALS: Goal[] = [
  {
    id: "register",
    emoji: "🗳️",
    title: "I want to register to vote",
    subtitle: "First-time voter? Start your journey here.",
  },
  {
    id: "eligibility",
    emoji: "✅",
    title: "Check my eligibility",
    subtitle: "Find out if you can vote in the next election.",
  },
  {
    id: "learn",
    emoji: "📘",
    title: "Learn the election process",
    subtitle: "Understand each phase from filing to counting.",
  },
  {
    id: "voting-day",
    emoji: "📍",
    title: "Voting day steps",
    subtitle: "What to do, bring, and expect on election day.",
  },
];

export const FIRST_TIME_VOTER_JOURNEY: JourneyStep[] = [
  {
    id: "s1",
    phase: "Prepare",
    title: "Confirm you are eligible",
    shortDesc: "Check the basic requirements to vote.",
    longDesc:
      "You need to be a citizen, 18 years or older on the qualifying date, and a resident of the constituency where you want to register.",
    estimate: "2 min",
    checklist: [
      "I am a citizen",
      "I am 18+ on the qualifying date",
      "I have a residential address",
    ],
    action: { label: "I meet these criteria" },
  },
  {
    id: "s2",
    phase: "Prepare",
    title: "Gather your documents",
    shortDesc: "Collect proof of identity, age and address.",
    longDesc:
      "Most registrations need: a photo, an age proof (birth certificate, school certificate, passport), and an address proof (utility bill, rental agreement, bank statement).",
    estimate: "15 min",
    checklist: [
      "Recent passport-size photo (digital)",
      "Age proof",
      "Address proof",
    ],
    action: { label: "Documents ready" },
  },
  {
    id: "s3",
    phase: "Register",
    title: "Fill the voter registration form",
    shortDesc: "Submit Form 6 (or your country's equivalent) online.",
    longDesc:
      "Go to the official voter portal, create an account, and complete the new-voter form. Double-check spelling of your name and address — these will appear on your voter ID.",
    estimate: "20 min",
    deadline: "At least 30 days before the election",
    action: { label: "Open voter portal", href: "https://voters.eci.gov.in/" },
  },
  {
    id: "s4",
    phase: "Register",
    title: "Upload your documents",
    shortDesc: "Attach photo, age proof, and address proof.",
    longDesc:
      "Files should be clear, under the size limit (usually 2 MB), and in the accepted formats (JPG / PDF). Blurred uploads are the #1 reason for rejection.",
    estimate: "10 min",
    action: { label: "Mark as uploaded" },
  },
  {
    id: "s5",
    phase: "Verify",
    title: "Track your application",
    shortDesc: "Use your reference number to check status.",
    longDesc:
      "After submission you'll receive a reference ID. Verification by a Booth Level Officer (BLO) usually takes 2–4 weeks. You may receive a home visit or phone call.",
    estimate: "Ongoing",
    action: { label: "Check status" },
  },
  {
    id: "s6",
    phase: "Verify",
    title: "Receive your Voter ID",
    shortDesc: "Download the e-EPIC or wait for the physical card.",
    longDesc:
      "Once approved, you can download a digital Voter ID immediately. The physical card arrives by post in 4–6 weeks.",
    estimate: "5 min",
    action: { label: "Download e-EPIC" },
  },
  {
    id: "s7",
    phase: "Vote",
    title: "Find your polling booth",
    shortDesc: "Locate your assigned polling station.",
    longDesc:
      "Search by Voter ID or name on the official portal a few days before the election. Save the location and plan your travel.",
    estimate: "5 min",
    deadline: "1 week before election day",
    action: { label: "Find my booth" },
  },
  {
    id: "s8",
    phase: "Vote",
    title: "Vote on election day",
    shortDesc: "Bring your Voter ID and cast your vote.",
    longDesc:
      "Reach the booth during polling hours. Carry your Voter ID or any approved photo ID. Officials will verify, ink your finger, and guide you to the EVM. Press the button next to your candidate, confirm via VVPAT, and you're done!",
    estimate: "30–60 min",
    deadline: "Election day",
    checklist: [
      "Voter ID / approved photo ID",
      "Know your booth address",
      "Polling hours noted",
    ],
    action: { label: "I voted! 🎉" },
  },
];

export const PHASES = ["Prepare", "Register", "Verify", "Vote"] as const;
