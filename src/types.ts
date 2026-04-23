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

export interface SubmitPayload {
  name: string;
  email: string;
  telegramOrPhone: string;
  score: number;
  notes: string;
}
