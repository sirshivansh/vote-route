export type GoalId = "register" | "eligibility" | "learn" | "voting-day";

export interface StepFaq {
  q: string;
  a: string;
}

export interface JourneyStep {
  id: string;
  phase: "Prepare" | "Register" | "Verify" | "Vote";
  title: string; // human, warm
  shortDesc: string;
  longDesc: string;
  estimate: string;
  deadline?: string;
  weight: number; // contribution to readiness (sum = 100)
  consequence?: string; // "what happens if I skip this step?"
  why?: string; // "why is this important?"
  documents?: string[];
  action?: { label: string; href?: string };
  checklist?: string[];
  faqs?: StepFaq[];
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
    title: "Register to vote",
    subtitle: "First time? We'll walk you through every step.",
  },
  {
    id: "eligibility",
    emoji: "✅",
    title: "Check eligibility",
    subtitle: "See if you can vote in the next election.",
  },
  {
    id: "learn",
    emoji: "📘",
    title: "Learn the process",
    subtitle: "Understand each phase, in plain English.",
  },
  {
    id: "voting-day",
    emoji: "📍",
    title: "Voting day guide",
    subtitle: "What to bring, where to go, what to expect.",
  },
];

export const FIRST_TIME_VOTER_JOURNEY: JourneyStep[] = [
  {
    id: "s1",
    phase: "Prepare",
    title: "Let's check if you're eligible ✨",
    shortDesc: "A quick 30-second confirmation before we start.",
    longDesc:
      "To vote in India, you need to be an Indian citizen, 18+ on the qualifying date (1st January of the year), and a resident of the constituency where you want to register.",
    estimate: "2 min",
    weight: 8,
    why: "Confirming eligibility upfront prevents wasted weeks on a form that will be rejected. It also tells us which sub-flow to show you (overseas voter, service voter, regular).",
    consequence:
      "Skipping this means you might fill the form only to be rejected later — and lose 3-4 weeks.",
    checklist: [
      "I'm an Indian citizen",
      "I'll be 18+ on 1st January",
      "I have a residential address",
    ],
    faqs: [
      {
        q: "I turn 18 next month — am I eligible?",
        a: "Eligibility is set on the qualifying date (1 January of the year). If you turn 18 after 1 January, you'll usually be eligible from the next revision cycle — but you can pre-register now.",
      },
      {
        q: "I'm an Indian citizen living abroad. Can I vote?",
        a: "Yes — overseas Indian citizens can register as 'overseas electors' using Form 6A and vote in person at their home constituency.",
      },
    ],
    action: { label: "Yes, I qualify" },
  },
  {
    id: "s2",
    phase: "Prepare",
    title: "Gather your 3 essentials 📂",
    shortDesc: "A photo, an age proof, and an address proof.",
    longDesc:
      "Have these ready as clear photos or PDFs (under 2 MB each). Blurred uploads are the #1 reason applications get rejected — take a fresh photo in good light.",
    estimate: "15 min",
    weight: 10,
    why: "Having documents ready before you open the form means you won't time out mid-application. Blurry or oversized files account for ~40% of rejections.",
    consequence:
      "Missing or blurry documents = rejection. You'll have to start the form all over again.",
    documents: [
      "Recent passport-size photo (digital, clear face, plain background)",
      "Age proof — birth certificate, 10th marksheet, passport, or PAN",
      "Address proof — utility bill, rental agreement, bank statement, or Aadhaar",
    ],
    checklist: [
      "Recent passport-size photo (digital, clear face)",
      "Age proof — birth certificate / 10th marksheet / passport",
      "Address proof — utility bill / rental agreement / bank statement",
    ],
    faqs: [
      {
        q: "My address proof is in my parent's name. Is that ok?",
        a: "Yes — for voters living with family, a relative's address proof is accepted along with a self-declaration.",
      },
      {
        q: "Can I use a selfie as my photo?",
        a: "It must be passport-style: front-facing, plain background, both ears visible, no filters. Most phones can take this if you ask someone else to click it.",
      },
    ],
    action: { label: "I've got everything ready" },
  },
  {
    id: "s3",
    phase: "Register",
    title: "Let's get you officially registered 🪪",
    shortDesc: "Submit Form 6 on the official ECI voter portal.",
    longDesc:
      "Head to the Election Commission's voter portal, create an account, and complete Form 6 (the new-voter form). Type your name and address exactly as they appear on your documents — these will be printed on your Voter ID.",
    estimate: "20 min",
    deadline: "At least 30 days before election day",
    weight: 18,
    why: "Form 6 is the legal new-voter application. Without it filed and accepted, your name will not appear on the electoral roll — and you cannot vote.",
    consequence:
      "If you miss the 30-day cutoff, you won't appear on the roll — and you can't vote in the next election.",
    faqs: [
      {
        q: "What if I make a typo in my name?",
        a: "Submit Form 8 (correction) right after — it's free and usually approved within a week.",
      },
    ],
    action: { label: "Open the voter portal", href: "https://voters.eci.gov.in/" },
  },
  {
    id: "s4",
    phase: "Register",
    title: "Upload your documents the right way 📤",
    shortDesc: "Attach photo + age proof + address proof.",
    longDesc:
      "Each file must be under 2 MB and in JPG or PDF format. Tip: take photos against a plain wall in daylight — no glare, no shadow, all 4 corners visible.",
    estimate: "10 min",
    weight: 12,
    why: "Document scans are the BLO's primary verification tool. Clear scans = faster approval; bad scans = rejection or repeat visits.",
    consequence:
      "Wrong format or unreadable files = automatic rejection by the BLO during verification.",
    action: { label: "Mark uploads as done" },
  },
  {
    id: "s5",
    phase: "Verify",
    title: "Track your application 🔎",
    shortDesc: "Use your reference number to follow progress.",
    longDesc:
      "After submission you'll get a reference ID. Verification by a Booth Level Officer (BLO) usually takes 2–4 weeks. The BLO may visit your home or call to confirm details — keep your phone reachable.",
    estimate: "Ongoing",
    weight: 10,
    why: "Application status is silent by default. Tracking lets you respond quickly if the BLO needs anything — most rejections happen because applicants miss a single follow-up.",
    consequence:
      "If you ignore the BLO call/visit, your application can be marked 'unverified' and rejected silently.",
    action: { label: "Mark as tracked" },
  },
  {
    id: "s6",
    phase: "Verify",
    title: "Your Voter ID is ready 🎟️",
    shortDesc: "Download the digital e-EPIC instantly.",
    longDesc:
      "Once approved, you can download a digital Voter ID (e-EPIC) right away. The physical card arrives by post in 4–6 weeks, but the e-EPIC works just as well at the booth.",
    estimate: "5 min",
    weight: 12,
    why: "The e-EPIC is a legally valid digital Voter ID. Downloading it gives you proof immediately — no need to wait for the physical card.",
    consequence:
      "Without an e-EPIC or alternate photo ID on polling day, the officer can turn you away.",
    action: { label: "Download e-EPIC" },
  },
  {
    id: "s7",
    phase: "Vote",
    title: "Find your polling booth 📍",
    shortDesc: "Locate your assigned station before election day.",
    longDesc:
      "Search by Voter ID or name on the ECI portal a week before the election. Save the address, plan your route, and check polling hours (usually 7 AM – 6 PM).",
    estimate: "5 min",
    deadline: "1 week before election day",
    weight: 12,
    why: "Booths are assigned, not chosen. Knowing yours in advance prevents day-of confusion and lets you plan transport.",
    consequence:
      "Showing up at the wrong booth = no vote. Polling stations don't redirect you mid-day.",
    action: { label: "Find my booth" },
  },
  {
    id: "s8",
    phase: "Vote",
    title: "Cast your vote — you've got this! 🗳️",
    shortDesc: "Bring your Voter ID and make history.",
    longDesc:
      "Reach the booth during polling hours. The officer checks your ID, inks your finger, and guides you to the EVM. Press the button next to your candidate, watch for the VVPAT slip (it shows your vote for 7 seconds), and you're done. Take your inked-finger selfie outside!",
    estimate: "30–60 min",
    deadline: "Election day",
    weight: 18,
    why: "This is the actual vote — the moment everything else has been preparing you for.",
    consequence:
      "Skip this and the entire journey resets to zero — no shortcuts to having voted.",
    checklist: [
      "Voter ID or any ECI-approved photo ID",
      "Booth address saved on phone",
      "Polling hours noted (typically 7 AM – 6 PM)",
    ],
    faqs: [
      {
        q: "What if my name isn't on the roll at the booth?",
        a: "Ask the Presiding Officer for a 'tendered ballot' — you may still be allowed to vote on paper if you can show valid ID.",
      },
      {
        q: "Can I take my phone inside?",
        a: "No — phones, cameras, and bags are not allowed inside the polling booth. Leave them with someone outside.",
      },
    ],
    action: { label: "I voted! 🎉" },
  },
];

export const PHASES = ["Prepare", "Register", "Verify", "Vote"] as const;

export function calcReadiness(completedIds: string[], steps: JourneyStep[]): number {
  const total = steps.reduce((sum, s) => sum + s.weight, 0);
  const earned = steps
    .filter((s) => completedIds.includes(s.id))
    .reduce((sum, s) => sum + s.weight, 0);
  return Math.round((earned / total) * 100);
}

export function readinessLabel(score: number): { label: string; tone: "muted" | "primary" | "leaf" } {
  if (score === 0) return { label: "Just getting started", tone: "muted" };
  if (score < 40) return { label: "On your way", tone: "primary" };
  if (score < 80) return { label: "Almost there", tone: "primary" };
  if (score < 100) return { label: "So close!", tone: "leaf" };
  return { label: "Ready to vote 🎉", tone: "leaf" };
}

export function getStepById(id: string): JourneyStep | undefined {
  return FIRST_TIME_VOTER_JOURNEY.find((s) => s.id === id);
}

export function getNextStep(completedIds: string[]): JourneyStep | undefined {
  return FIRST_TIME_VOTER_JOURNEY.find((s) => !completedIds.includes(s.id));
}

export const GLOBAL_FAQS: StepFaq[] = [
  {
    q: "Is VoteRoute affiliated with the Election Commission?",
    a: "No. VoteRoute is an independent guide that follows ECI-published procedures. For official forms and status, always use voters.eci.gov.in.",
  },
  {
    q: "Where is my data stored?",
    a: "Everything stays on your device in localStorage. We never send your name, age or location to a server.",
  },
  {
    q: "What's the difference between Voter ID and e-EPIC?",
    a: "They're the same identity — e-EPIC is the digital version (PDF) you can download instantly, the Voter ID is the laminated card that arrives by post.",
  },
  {
    q: "Can I vote if I'm in a different city on election day?",
    a: "Currently no — you must vote at your assigned booth. Plan a trip home or look into postal ballots if you're a service voter.",
  },
  {
    q: "What is VVPAT?",
    a: "Voter-Verifiable Paper Audit Trail — a printer attached to the EVM that prints a slip with your candidate's name and symbol for 7 seconds, then drops it into a sealed box.",
  },
];
