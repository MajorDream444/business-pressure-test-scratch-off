import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { QUESTIONS } from './constants';
import { BIZ_TYPES, REVENUE_RANGES, getBand } from './scoring';
import type { Band } from './types';

// ── Step index constants ──────────────────────────────────────────────────────
// 0  = landing
// 1  = firstName
// 2  = lastName
// 3  = email
// 4  = contact
// 5  = bizType
// 6  = revenue
// 7  = biggestIssue
// 8–17 = quiz questions 0–9
// 18 = results
// 19 = cta

const QUIZ_OFFSET   = 8;
const LAST_QUIZ_STEP = QUIZ_OFFSET + QUESTIONS.length - 1; // 17
const RESULTS_STEP  = LAST_QUIZ_STEP + 1;                  // 18
const CTA_STEP      = RESULTS_STEP + 1;                    // 19
const PROGRESS_DENOM = LAST_QUIZ_STEP;                     // 17

// ── Helpers ───────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 76) return '#4ade80';
  if (score >= 51) return '#facc15';
  if (score >= 26) return '#fb923c';
  return '#f87171';
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ── Animation ─────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '55%' : '-55%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? '-55%' : '55%', opacity: 0 }),
};

const slideTrans = {
  duration: 0.28,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

// ── Root component ────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState(0);
  const [dir,  setDir]  = useState(1);

  // Lead data
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [email,        setEmail]        = useState('');
  const [contact,      setContact]      = useState('');
  const [bizType,      setBizType]      = useState('');
  const [revenue,      setRevenue]      = useState('');
  const [biggestIssue, setBiggestIssue] = useState('');

  // Quiz
  const [answers,     setAnswers]     = useState<Record<string, { label: string; score: number }>>({});
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // Results
  const [score, setScore] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const pendingPayload = useRef<Record<string, unknown> | null>(null);

  // Never blocks the results screen, but failures are surfaced and retryable.
  const submitLead = async () => {
    if (!pendingPayload.current) return;
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingPayload.current),
      });
      setSaveStatus(res.ok ? 'saved' : 'error');
    } catch {
      setSaveStatus('error');
    }
  };

  const navigate = (target: number) => {
    setDir(target > step ? 1 : -1);
    setStep(target);
    setHighlighted(null);
  };

  const goNext = () => navigate(step + 1);
  const goPrev = () => navigate(step - 1);

  const showProgress = step >= 1 && step <= LAST_QUIZ_STEP;
  const progressPct  = showProgress ? Math.round((step / PROGRESS_DENOM) * 100) : 0;

  const handleQuizAnswer = (
    qId: string,
    option: { label: string; score: number }
  ) => {
    if (highlighted) return;
    setHighlighted(option.label);

    const newAnswers = { ...answers, [qId]: option };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (step === LAST_QUIZ_STEP) {
        const total      = Object.values(newAnswers).reduce((s, a) => s + a.score, 0);
        const finalScore = Math.round(total);
        setScore(finalScore);

        // Raw answers only — the server recomputes score, band, priority and offer.
        const answerLabels: Record<string, string> = {};
        QUESTIONS.forEach((q, i) => {
          answerLabels[`q${i + 1}`] = newAnswers[q.id]?.label ?? '';
        });

        // Same submissionId is reused on retry so the server can dedupe.
        pendingPayload.current = {
          submissionId:    `bpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          firstName:       firstName.trim(),
          lastName:        lastName.trim(),
          email:           email.trim(),
          telegramOrPhone: contact.trim(),
          businessType:    bizType,
          revenueRange:    revenue,
          biggestIssue:    biggestIssue.trim(),
          answers:         answerLabels,
        };
        void submitLead();

        navigate(RESULTS_STEP);
      } else {
        goNext();
      }
    }, 320);
  };

  const band        = getBand(score);
  const calendlyUrl = (import.meta.env.VITE_CALENDLY_URL as string) || '#';
  const gumroadUrl  = (import.meta.env.VITE_GUMROAD_URL  as string) || '#';

  // ── Step renderer ───────────────────────────────────────────────────────────

  const renderStep = () => {
    if (step === 0) return <LandingScreen onStart={goNext} />;

    if (step === 1) return (
      <InputScreen key="firstName"
        question="What's your first name?"
        placeholder="First name"
        value={firstName} type="text" inputMode="text"
        autoCapitalize="words" autoComplete="given-name"
        onChange={setFirstName} onNext={goNext}
        canProceed={firstName.trim().length > 0}
      />
    );

    if (step === 2) return (
      <InputScreen key="lastName"
        question="And your last name?"
        placeholder="Last name"
        value={lastName} type="text" inputMode="text"
        autoCapitalize="words" autoComplete="family-name"
        onChange={setLastName} onNext={goNext}
        canProceed={lastName.trim().length > 0}
      />
    );

    if (step === 3) return (
      <InputScreen key="email"
        question="What's your email address?"
        placeholder="you@example.com"
        value={email} type="email" inputMode="email"
        autoCapitalize="none" autoComplete="email"
        onChange={setEmail} onNext={goNext}
        canProceed={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}
      />
    );

    if (step === 4) return (
      <InputScreen key="contact"
        question="Telegram username or phone number?"
        placeholder="@handle  or  +1 555 000 0000"
        value={contact} type="text" inputMode="text"
        autoCapitalize="none" autoComplete="off"
        onChange={setContact} onNext={goNext}
        canProceed={contact.trim().length > 2}
        hint="We'll send your results and credit here."
      />
    );

    if (step === 5) return (
      <OptionScreen key="bizType"
        question="What type of business do you run?"
        options={BIZ_TYPES} selected={bizType}
        onSelect={v => { setBizType(v); setTimeout(goNext, 220); }}
      />
    );

    if (step === 6) return (
      <OptionScreen key="revenue"
        question="What's your current monthly revenue?"
        options={REVENUE_RANGES} selected={revenue}
        onSelect={v => { setRevenue(v); setTimeout(goNext, 220); }}
      />
    );

    if (step === 7) return (
      <InputScreen key="biggestIssue"
        question="What's your biggest business challenge right now?"
        placeholder="Be specific — this helps us prepare for your call"
        value={biggestIssue} type="text" inputMode="text"
        autoCapitalize="sentences" autoComplete="off"
        onChange={setBiggestIssue} onNext={goNext}
        canProceed={true}
        multiline
      />
    );

    if (step >= QUIZ_OFFSET && step <= LAST_QUIZ_STEP) {
      const q = QUESTIONS[step - QUIZ_OFFSET];
      return (
        <QuizScreen key={q.id}
          question={q.question}
          options={q.options}
          highlighted={highlighted}
          currentAnswer={answers[q.id]?.label ?? null}
          onSelect={opt => handleQuizAnswer(q.id, opt)}
        />
      );
    }

    if (step === RESULTS_STEP) return (
      <ResultsScreen
        name={firstName}
        score={score}
        band={band}
        saveStatus={saveStatus}
        onRetry={submitLead}
        onCta={() => navigate(CTA_STEP)}
      />
    );

    if (step === CTA_STEP) return (
      <CtaScreen
        name={firstName}
        calendlyUrl={calendlyUrl}
        gumroadUrl={gumroadUrl}
      />
    );

    return null;
  };

  const showBack = step > 0 && step < RESULTS_STEP;
  const quizNum  =
    step >= QUIZ_OFFSET && step <= LAST_QUIZ_STEP
      ? step - QUIZ_OFFSET + 1
      : null;

  return (
    <div className="app-root">
      {showProgress && (
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      )}

      {showBack && (
        <button className="back-btn" onClick={goPrev} aria-label="Go back">
          <ChevronLeft size={22} />
        </button>
      )}

      {quizNum !== null && (
        <div className="quiz-counter">
          {quizNum} / {QUESTIONS.length}
        </div>
      )}

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

      <p className="consent-note">
        By starting, you agree we store your answers and email you your results.
      </p>
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
  multiline?: boolean;
}

function InputScreen({
  question, placeholder, value, type, inputMode, autoCapitalize,
  autoComplete, onChange, onNext, canProceed, hint, multiline,
}: InputScreenProps) {
  const inputRef    = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
      textareaRef.current?.focus();
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="screen screen-form">
      <h2 className="question-text">{question}</h2>
      {hint && <p className="hint-text">{hint}</p>}

      {multiline ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="gold-input gold-textarea"
          autoCapitalize={autoCapitalize}
          autoCorrect="off"
          spellCheck={false}
          rows={4}
        />
      ) : (
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
      )}

      <button onClick={onNext} disabled={!canProceed} className="btn-gold">
        Continue →
      </button>
    </div>
  );
}

interface OptionScreenProps {
  question: string;
  options: readonly string[];
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
  saveStatus: SaveStatus;
  onRetry: () => void;
  onCta: () => void;
}

function ResultsScreen({ name, score, band, saveStatus, onRetry, onCta }: ResultsScreenProps) {
  const scoreColor = getScoreColor(score);
  return (
    <div className="screen screen-form">
      {saveStatus === 'error' && (
        <div className="save-banner save-banner-error" role="alert">
          <span>We couldn't save your results yet.</span>
          <button onClick={onRetry} className="save-retry">Try again</button>
        </div>
      )}
      {saveStatus === 'saving' && (
        <div className="save-banner" role="status">Saving your results…</div>
      )}
      <div className="credit-banner">
        <span>🎁</span>
        <span>You've unlocked a $100 Build Credit</span>
      </div>

      <div className="score-block">
        {name && <p className="score-label">{name}'s score</p>}
        <div className="score-number" style={{ color: scoreColor }}>{score}</div>
        <div className="score-denom">out of 100</div>
      </div>

      <div className="band-card">
        <div className="band-title">{band.title}</div>
        <p className="band-diagnosis">{band.diagnosis}</p>

        <div className="band-section">
          <div className="band-section-label">Pressure points</div>
          {band.leaks.map(l => (
            <div key={l} className="band-item">
              <span className="icon-red">↓</span>{l}
            </div>
          ))}
        </div>

        <div className="band-section">
          <div className="band-section-label">Next moves</div>
          {band.next_moves.map(m => (
            <div key={m} className="band-item">
              <span className="icon-gold">→</span>{m}
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
        <a href={calendlyUrl} target="_blank" rel="noopener noreferrer"
          className="cta-card cta-card-primary">
          <div className="cta-card-title cta-card-title-gold">Book a Strategy Call →</div>
          <div className="cta-card-body">
            45 minutes. We map your exact pressure points and build a fix plan.
          </div>
          <div className="cta-card-note cta-card-note-gold">$100 credit applied automatically</div>
        </a>

        <a href={gumroadUrl} target="_blank" rel="noopener noreferrer"
          className="cta-card cta-card-secondary">
          <div className="cta-card-title">Get the Build Playbook →</div>
          <div className="cta-card-body">
            The exact framework to fix the leaks found in your results.
          </div>
          <div className="cta-card-note">Use credit code at checkout</div>
        </a>
      </div>

      <p className="footer-note">Business Pressure Test · {new Date().getFullYear()}</p>
    </div>
  );
}
