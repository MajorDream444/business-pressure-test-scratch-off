import { QUESTIONS, BANDS } from "../src/constants.js";
export { QUESTIONS };
export const BUSINESS_TYPES = [
  "Freelancing / Consulting",
  "Coaching / Training",
  "Agency / Service Business",
  "E-commerce / Products",
  "SaaS / Tech",
  "Other",
];
export const REVENUES = [
  "Pre-revenue",
  "Under $1k / month",
  "$1k – $5k / month",
  "$5k – $15k / month",
  "$15k – $50k / month",
  "$50k+ / month",
];
export const READINESS = [
  "Exploring my options",
  "I want a clearer plan",
  "Ready to discuss a build",
];
const SIGNALS = [
  [
    "Lead Flow",
    "Build one repeatable way for people to find your work.",
    "Choose one audience and one channel. Track qualified enquiries weekly.",
  ],
  [
    "Time Freedom",
    "Your work may depend too heavily on your daily presence.",
    "Document one recurring task and choose a person or process to own it.",
  ],
  [
    "Offer",
    "People need a clearer way to understand and buy your work.",
    "Write one offer: who it serves, what changes, what is included, and the price.",
  ],
  [
    "Lead Flow",
    "Demand feels difficult to predict.",
    "Track where enquiries come from, then repeat the channel that brings the best-fit people.",
  ],
  [
    "Follow-up",
    "Interested people may not have a consistent next step.",
    "Create a simple follow-up rhythm with an owner, date, and clear invitation.",
  ],
  [
    "Operations",
    "Your backend needs a calmer, more visible structure.",
    "Put active clients, commitments, and next actions in one shared tracker.",
  ],
  [
    "Operations",
    "Your revenue drivers need better visibility.",
    "Review which offers and channels produced paid work over the last 30 days.",
  ],
  [
    "Delegation",
    "Repeatable work may still be consuming your attention.",
    "Choose one repeated workflow to document before you automate it.",
  ],
  [
    "Operations",
    "The main bottleneck needs clearer definition.",
    "Name one constraint and collect evidence before choosing a tool or a build.",
  ],
  [
    "Operations",
    "More demand may put pressure on delivery.",
    "Check capacity, handoffs, and delivery quality before increasing acquisition.",
  ],
];
export function diagnose(answers: number[]) {
  if (
    answers.length !== QUESTIONS.length ||
    answers.some((a) => !Number.isInteger(a) || a < 0 || a > 4)
  )
    throw new Error("Answer all ten questions.");
  const scores = answers.map((a, i) => QUESTIONS[i].options[a].score);
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const band = BANDS.find((b) => totalScore <= b.max)!;
  const scoreBand =
    totalScore <= 25
      ? "Critical"
      : totalScore <= 50
        ? "Leaking"
        : totalScore <= 75
          ? "Functional"
          : "Strong";
  const ranked = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => a.score - b.score || a.index - b.index);
  const signals = ranked
    .slice(0, 3)
    .map(({ score, index }) => ({
      category: SIGNALS[index][0],
      summary: SIGNALS[index][1],
      action: SIGNALS[index][2],
      evidence: QUESTIONS[index].options[answers[index]].label,
      question: QUESTIONS[index].question,
      score,
    }));
  return {
    totalScore,
    scoreBand,
    band,
    signals,
    scores,
    primaryLeak: signals[0].category,
    diagnosisSummary: band.diagnosis,
    nextStep: signals[0].action,
  };
}
export interface Submission {
  submissionId: string;
  firstName: string;
  lastName: string;
  email: string;
  telegramOrPhone: string;
  businessType: string;
  revenueRange: string;
  biggestIssue: string;
  readiness: string;
  answers: number[];
  consent: boolean;
  website: string;
  challenge: string;
}
function text(
  v: unknown,
  max: number,
  required = false,
  multiline = false,
): string {
  if (
    typeof v !== "string" ||
    v.length > max ||
    (required && !v.trim()) ||
    /[\u0000-\u001f\u007f]/.test(multiline ? v.replace(/[\r\n]/g, "") : v)
  )
    throw new Error("Please check your contact details.");
  return v.trim();
}
export function validateSubmission(raw: unknown): Submission {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("Invalid submission.");
  const b = raw as Record<string, unknown>;
  const email = text(b.email, 254, true).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))
    throw new Error("Enter a valid email address.");
  const submissionId = text(b.submissionId, 36, true);
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      submissionId,
    )
  )
    throw new Error("Invalid submission reference.");
  if (b.consent !== true)
    throw new Error("Please agree to saving your results.");
  if (!Array.isArray(b.answers)) throw new Error("Answer all ten questions.");
  diagnose(b.answers);
  const businessType = text(b.businessType, 80, true),
    revenueRange = text(b.revenueRange, 80, true),
    readiness = text(b.readiness, 80, true);
  if (
    !BUSINESS_TYPES.includes(businessType) ||
    !REVENUES.includes(revenueRange) ||
    !READINESS.includes(readiness)
  )
    throw new Error("Please choose the listed business options.");
  return {
    submissionId,
    firstName: text(b.firstName, 80, true),
    lastName: text(b.lastName, 80),
    email,
    telegramOrPhone: text(b.telegramOrPhone, 120),
    businessType,
    revenueRange,
    biggestIssue: text(b.biggestIssue, 1200, false, true),
    readiness,
    answers: b.answers,
    consent: true,
    website: text(b.website ?? "", 200),
    challenge: text(b.challenge, 256, true),
  };
}
export function toFields(input: Submission) {
  const d = diagnose(input.answers);
  const priority =
    input.readiness === READINESS[2]
      ? "HOT"
      : input.readiness === READINESS[1]
        ? "WARM"
        : "COLD";
  const fields: Record<string, string | number> = {
    Name: `${input.firstName} ${input.lastName}`.trim(),
    "First Name": input.firstName,
    "Last Name": input.lastName,
    Email: input.email,
    Telegram_or_Phone: input.telegramOrPhone,
    Source: "business-pressure-test",
    "App Version": "maim-v3",
    "Submission ID": input.submissionId,
    "Business Type": input.businessType,
    "Revenue Range": input.revenueRange,
    "Biggest Issue": input.biggestIssue,
    Score: d.totalScore,
    "Total Score": d.totalScore,
    "Score Band": d.scoreBand,
    Priority: priority,
    "Primary Leak": d.primaryLeak,
    "Diagnosis Summary": d.diagnosisSummary,
    "Recommended Offer": "Diagnostic Call",
    "Next Step": d.nextStep,
  };
  input.answers.forEach((a, i) => {
    fields[`Q${i + 1}`] = QUESTIONS[i].options[a].label;
    fields[`Score Q${i + 1}`] = d.scores[i];
  });
  fields["Raw Payload JSON"] = JSON.stringify({
    appVersion: "maim-v3",
    consent: true,
    readiness: input.readiness,
    answers: input.answers,
    scores: d.scores,
    totalScore: d.totalScore,
    signals: d.signals,
  });
  return fields;
}
