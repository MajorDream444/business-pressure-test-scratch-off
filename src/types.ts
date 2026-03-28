export interface Option {
  label: string;
  score: number;
}

export interface Question {
  id: string;
  question: string;
  options: Option[];
}

export interface Band {
  key: string;
  min: number;
  max: number;
  title: string;
  diagnosis: string;
  leaks: string[];
  next_moves: string[];
}

export interface LeadData {
  emailAddress: string;
  firstName: string;
  lastName: string;
  email: string;
  telegramOrPhone: string;
  businessType: string;
  monthlyRevenue: string;
  biggestIssue: string;
}

export interface LeadPayload extends LeadData {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  q4Score: number;
  q5Score: number;
  q6Score: number;
  q7Score: number;
  q8Score: number;
  q9Score: number;
  q10Score: number;
  totalScore: number;
  scoreBand: string;
  credit: string;
  priority: string;
  source: string;
  nextStep: string;
  timestamp: string;
}

export type Screen = 'landing' | 'scratch' | 'quiz' | 'results' | 'lead_capture' | 'cta';
