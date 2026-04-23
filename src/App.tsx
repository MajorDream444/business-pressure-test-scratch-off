import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { QUESTIONS, BANDS } from './constants';
import type { Band } from './types';

// ── Lead-capture option lists ─────────────────────────────────────────────────

const BIZ_TYPES = [
  'Freelancing / Consulting',
  'Coaching / Training',
  'Agency / Service Business',
  'E-commerce / Products',
  'SaaS / Tech',
  'Other',
];

const REVENUE_RANGES = [
  'Pre-revenue',
  'Under $1k / month',
  '$1k – $5k / month',
  '$5k – $15k / month',
  '$15k – $50k / month',
  '$50k+ / month',
];

// ── Step index constants ──────────────────────────────────────────────────────
// 0  = landing
// 1  = name
// 2  = email
// 3  = contact
// 4  = biz_type
// 5  = revenue
// 6–15 = quiz questions 0–9
// 16 = results
// 17 = cta

const QUIZ_OFFSET = 6;
const LAST_QUIZ_STEP = QUIZ_OFFSET + QUESTIONS.length - 1; // 15
const RESULTS_STEP = LAST_QUIZ_STEP + 1; // 16
const CTA_STEP = RESULTS_STEP + 1; // 17
// Progress bar spans steps 1–15 (15 steps total)
const PROGRESS_DENOM = LAST_QUIZ_STEP; // 15

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBand(score: number): Band {
  return BANDS.find(b => score >= b.min && score <= b.max) ?? BANDS[0];
}

function getScoreColor(score: number): string {
  if (score >= 76) return '#4ade80';
  if (score >= 51) return '#facc15';
  if (score >= 26) return '#fb923c';
  return '#f87171';
}

function buildNotes(
  bizType: string,
  revenue: string,
  answers: Record<string, { label: string; score: number }>
): string {
  return [
    `Business Type: ${bizType}`,
    `Monthly Revenue: ${revenue}`,
    '',
    'Quiz Answers:',
    ...QUESTIONS.map(q => `• ${q.question}\n  → ${answers[q.id]?.label ?? 'N/A'}`),
  ].join('\n');
}

// ── Animation ─────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '55%' : '-55%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-55%' : '55%', opacity: 0 }),
};

const slideTrans = {
  duration: 0.28,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

// ── Root component ────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // Lead data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [bizType, setBizType] = useState('');
  const [revenue, setRevenue] = useState('');

  // Quiz
  const [answers, setAnswers] = useState<Record<string, { label: string; score: number }>>({});
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // Results
  const [score, setScore] = useState(0);

  const navigate = (target: number) => {
    setDir(target > step ? 1 : -1);
    setStep(target);
    setHighlighted(null);
  };

  const goNext = () => navigate(step + 1);
  const goPrev = () => navigate(step - 1);

  const showProgress = step >= 1 && step <= LAST_QUIZ_STEP;
  const progressPct = showProgress ? Math.round((step / PROGRESS_DENOM) * 100) : 0;

  const handleQuizAnswer = (
    qId: string,
    option: { label: string; score: number }
  ) => {
    if (highlighted) return; // prevent double-tap
    setHighlighted(option.label);

    const newAnswers = { ...answers, [qId]: option };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (step === LAST_QUIZ_STEP) {
        const total = Object.values(newAnswers).reduce((s, a) => s + a.score, 0);
        const finalScore = Math.round(total);
        setScore(finalScore);

        // Fire-and-forget — never blocks UX
        fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            telegramOrPhone: contact,
            score: finalScore,
            notes: buildNotes(bizType, revenue, newAnswers),
          }),
        }).catch(() => {/* silent */});

        navigate(RESULTS_STEP);
      } else {
        goNext();
      }
    }, 320);
  };

  const band = getBand(score);
  const calendlyUrl = (import.meta.env.VITE_CALENDLY_URL as string) || '#';
  const gumroadUrl = (import.meta.env.VITE_GUMROAD_URL as string) || '#';

  // ── Step renderer ───────────────────────────────────────────────────────────

  const renderStep = () => {
    if (step === 0) {
      return <LandingScreen onStart={goNext} />;
    }
    if (step === 1) {
      return (
        <InputScreen
          key="name"
          question="What's your first name?"
          placeholder="Your first name"
          value={name}
          type="text"
          inputMode="text"
          autoCapitalize="words"
          autoComplete="given-name"
          onChange={setName}
          onNext={goNext}
          canProceed={name.trim().length > 0}
        />
      );
    }
    if (step === 2) {
      return (
        <InputScreen
          key="email"
          question="What's your email address?"
          placeholder="you@example.com"
          value={email}
          type="email"
          inputMode="email"
          autoCapitalize="none"
          autoComplete="email"
          onChange={setEmail}
          onNext={goNext}
          canProceed={email.includes('@') && email.includes('.')}
        />
      );
    }
    if (step === 3) {
      return (
        <InputScreen
          key="contact"
          question="Telegram username or phone number?"
          placeholder="@handle  or  +1 555 000 0000"
          value={contact}
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoComplete="off"
          onChange={setContact}
          onNext={goNext}
          canProceed={contact.trim().length > 2}
          hint="We'll send your results and credit here."
        />
      );
    }
    if (step === 4) {
      return (
        <OptionScreen
          key="biz_type"
          question="What type of business do you run?"
          options={BIZ_TYPES}
          selected={bizType}
          onSelect={v => { setBizType(v); setTimeout(goNext, 220); }}
        />
      );
    }
    if (step === 5) {
      return (
        <OptionScreen
          key="revenue"
          question="What's your current monthly revenue?"
          options={REVENUE_RANGES}
          selected={revenue}
          onSelect={v => { setRevenue(v); setTimeout(goNext, 220); }}
        />
      );
    }
    if (step >= QUIZ_OFFSET && step <= LAST_QUIZ_STEP) {
      const q = QUESTIONS[step - QUIZ_OFFSET];
      return (
        <QuizScreen
          key={q.id}
          question={q.question}
          options={q.options}
          highlighted={highlighted}
          currentAnswer={answers[q.id]?.label ?? null}
          onSelect={opt => handleQuizAnswer(q.id, opt)}
        />
      );
    }
    if (step === RESULTS_STEP) {
      return (
        <ResultsScreen
          name={name}
          score={score}
          band={band}
          onCta={() => navigate(CTA_STEP)}
        />
      );
    }
    if (step === CTA_STEP) {
      return (
        <CtaScreen
          name={name}
          calendlyUrl={calendlyUrl}
          gumroadUrl={gumroadUrl}
        />
      );
    }
    return null;
  };

  const showBack = step > 0 && step < RESULTS_STEP;
  const quizNum =
    step >= QUIZ_OFFSET && step <= LAST_QUIZ_STEP
      ? step - QUIZ_OFFSET + 1
      : null;

  return (
    <div className="app-root">
      {/* Progress bar */}
      {showProgress && (
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Back button */}
      {showBack && (
        <button className="back-btn" onClick={goPrev} aria-label="Go back">
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Quiz counter */}
      {quizNum !== null && (
        <div className="quiz-counter">
          {quizNum} / {QUESTIONS.length}
        </div>
      )}

      {/* Animated page */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTrans}
          className="page-wrapper"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Screen components ─────────────────────────────────────────────────────────

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen screen-center">
      <div className="label-gold">Business Pressure Test</div>

      <h1 className="headline">
        If you stopped working for 2 weeks…{' '}
        <span className="text-gold">would your business still run?</span>
      </h1>

      <p className="subtext">
        10 questions. 2 minutes. Find out if you own a business — or if your business owns you.
      </p>

      <div className="credit-pill">
        <span>🎁</span>
        <span>You've unlocked a $100 Build Credit</span>
      </div>

      <button onClick={onStart} className="btn-gold btn-lg">
        Start the Test →
      </button>
    </div>
  );
}

interface InputScreenProps {
  question: string;
  placeholder: string;
  value: string;
  type: string;
  inputMode: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoCapitalize: string;
  autoComplete: string;
  onChange: (v: string) => void;
  onNext: () => void;
  canProceed: boolean;
  hint?: string;
}

function InputScreen({
  question, placeholder, value, type, inputMode, autoCapitalize,
  autoComplete, onChange, onNext, canProceed, hint,
}: InputScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="screen screen-form">
      <h2 className="question-text">{question}</h2>
      {hint && <p className="hint-text">{hint}</p>}
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && canProceed && onNext()}
        placeholder={placeholder}
        className="gold-input"
        autoComplete={autoComplete}
        autoCorrect="off"
        autoCapitalize={autoCapitalize}
        spellCheck={false}
        inputMode={inputMode}
      />
      <button onClick={onNext} disabled={!canProceed} className="btn-gold">
        Continue →
      </button>
    </div>
  );
}

interface OptionScreenProps {
  question: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}

function OptionScreen({ question, options, selected, onSelect }: OptionScreenProps) {
  return (
    <div className="screen screen-form">
      <h2 className="question-text">{question}</h2>
      <div className="option-list">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`option-card${selected === opt ? ' option-card-active' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

interface QuizScreenProps {
  question: string;
  options: { label: string; score: number }[];
  highlighted: string | null;
  currentAnswer: string | null;
  onSelect: (opt: { label: string; score: number }) => void;
}

function QuizScreen({ question, options, highlighted, currentAnswer, onSelect }: QuizScreenProps) {
  return (
    <div className="screen screen-form">
      <h2 className="question-text">{question}</h2>
      <div className="option-list">
        {options.map(opt => {
          const active = highlighted === opt.label || currentAnswer === opt.label;
          return (
            <button
              key={opt.label}
              onClick={() => onSelect(opt)}
              className={`option-card${active ? ' option-card-active' : ''}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ResultsScreenProps {
  name: string;
  score: number;
  band: Band;
  onCta: () => void;
}

function ResultsScreen({ name, score, band, onCta }: ResultsScreenProps) {
  const scoreColor = getScoreColor(score);
  return (
    <div className="screen screen-form">
      <div className="credit-banner">
        <span>🎁</span>
        <span>You've unlocked a $100 Build Credit</span>
      </div>

      <div className="score-block">
        {name && <p className="score-label">{name}'s score</p>}
        <div className="score-number" style={{ color: scoreColor }}>
          {score}
        </div>
        <div className="score-denom">out of 100</div>
      </div>

      <div className="band-card">
        <div className="band-title">{band.title}</div>
        <p className="band-diagnosis">{band.diagnosis}</p>

        <div className="band-section">
          <div className="band-section-label">Pressure points</div>
          {band.leaks.map(l => (
            <div key={l} className="band-item">
              <span className="icon-red">↓</span>
              {l}
            </div>
          ))}
        </div>

        <div className="band-section">
          <div className="band-section-label">Next moves</div>
          {band.next_moves.map(m => (
            <div key={m} className="band-item">
              <span className="icon-gold">→</span>
              {m}
            </div>
          ))}
        </div>
      </div>

      <button onClick={onCta} className="btn-gold btn-lg">
        See how to fix this →
      </button>
    </div>
  );
}

interface CtaScreenProps {
  name: string;
  calendlyUrl: string;
  gumroadUrl: string;
}

function CtaScreen({ name, calendlyUrl, gumroadUrl }: CtaScreenProps) {
  return (
    <div className="screen screen-center">
      <div className="label-gold">Your next step</div>

      <h2 className="headline headline-sm">
        {name ? `${name}, apply` : 'Apply'} your{' '}
        <span className="text-gold">$100 Build Credit</span>
      </h2>

      <p className="subtext">Your credit is reserved. Choose how you want to move next.</p>

      <div className="cta-cards">
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-card cta-card-primary"
        >
          <div className="cta-card-title cta-card-title-gold">Book a Strategy Call →</div>
          <div className="cta-card-body">
            45 minutes. We map your exact pressure points and build a fix plan.
          </div>
          <div className="cta-card-note cta-card-note-gold">$100 credit applied automatically</div>
        </a>

        <a
          href={gumroadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-card cta-card-secondary"
        >
          <div className="cta-card-title">Get the Build Playbook →</div>
          <div className="cta-card-body">
            The exact framework to fix the leaks found in your results.
          </div>
          <div className="cta-card-note">Use credit code at checkout</div>
        </a>
      </div>

      <p className="footer-note">
        Business Pressure Test · {new Date().getFullYear()}
      </p>
    </div>
  );
}
