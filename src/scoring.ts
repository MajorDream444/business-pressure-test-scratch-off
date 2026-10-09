import { QUESTIONS, BANDS } from './constants.js';
import type { Band } from './types.js';

export const BIZ_TYPES = [
  'Freelancing / Consulting',
  'Coaching / Training',
  'Agency / Service Business',
  'E-commerce / Products',
  'SaaS / Tech',
  'Other',
] as const;

export const REVENUE_RANGES = [
  'Pre-revenue',
  'Under $1k / month',
  '$1k – $5k / month',
  '$5k – $15k / month',
  '$15k – $50k / month',
  '$50k+ / month',
] as const;

export function getBand(score: number): Band {
  return BANDS.find(b => score >= b.min && score <= b.max) ?? BANDS[0];
}

export function getScoreBand(score: number): string {
  if (score >= 76) return 'Strong';
  if (score >= 51) return 'Functional';
  if (score >= 26) return 'Leaking';
  return 'Critical';
}

export function getPriority(score: number): string {
  if (score <= 30) return 'HOT';
  if (score <= 60) return 'WARM';
  return 'COLD';
}

export function getRecommendedOffer(score: number): string {
  if (score >= 76) return 'Retainer';
  if (score >= 51) return 'System Build';
  return 'Diagnostic Call';
}

const LEAK_MAP: Record<string, string> = {
  you_are_the_system:        'Lead Flow',
  inconsistent_unstable:     'Offer',
  functional_but_capped:     'Conversion',
  structured_ready_to_scale: 'Operations',
};

export interface ScoredSubmission {
  answers:          Record<string, string>;
  scores:           Record<string, number>;
  totalScore:       number;
  scoreBand:        string;
  priority:         string;
  primaryLeak:      string;
  diagnosisSummary: string;
  recommendedOffer: string;
  nextStep:         string;
  leaks:            string[];
  nextMoves:        string[];
}

/**
 * Recomputes every derived value from the raw answer labels (keyed q1..qN).
 * Returns null if any answer is missing or is not a real option label, so
 * clients can never inject their own scores, bands or offers.
 */
export function scoreSubmission(rawAnswers: unknown): ScoredSubmission | null {
  if (!rawAnswers || typeof rawAnswers !== 'object') return null;
  const input = rawAnswers as Record<string, unknown>;

  const answers: Record<string, string> = {};
  const scores: Record<string, number> = {};
  let total = 0;

  for (let i = 0; i < QUESTIONS.length; i++) {
    const key = `q${i + 1}`;
    const label = input[key];
    if (typeof label !== 'string') return null;
    const option = QUESTIONS[i].options.find(o => o.label === label);
    if (!option) return null;
    answers[key] = option.label;
    scores[key] = option.score;
    total += option.score;
  }

  const totalScore = Math.round(total);
  const band = getBand(totalScore);

  return {
    answers,
    scores,
    totalScore,
    scoreBand:        getScoreBand(totalScore),
    priority:         getPriority(totalScore),
    primaryLeak:      LEAK_MAP[band.key] ?? 'Lead Flow',
    diagnosisSummary: band.diagnosis,
    recommendedOffer: getRecommendedOffer(totalScore),
    nextStep:         band.next_moves[0] ?? '',
    leaks:            band.leaks,
    nextMoves:        band.next_moves,
  };
}
