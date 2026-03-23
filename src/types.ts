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
  first_name: string;
  email: string;
  telegram_or_phone: string;
  business_type: string;
  revenue_range: string;
  biggest_issue: string;
}

export interface LeadPayload extends LeadData {
  score: number;
  band_key: string;
  band_title: string;
  priority: 'HOT' | 'NORMAL';
  source: 'business_pressure_test_app';
  timestamp: string;
}

export type Screen = 'landing' | 'scratch' | 'quiz' | 'results' | 'lead_capture' | 'cta';
