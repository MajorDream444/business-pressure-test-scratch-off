/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, LeadData, LeadPayload, Band } from './types';
import { QUESTIONS, BANDS } from './constants';
import { 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Mail, 
  Phone, 
  User, 
  Briefcase, 
  MessageSquare,
  Trophy,
  Zap,
  Target,
  Twitter,
  Linkedin,
  Facebook,
  Share2
} from 'lucide-react';

// --- Components ---
// ... (LandingScreen, ScratchScreen, ScratchCanvas, QuizScreen, ResultsScreen stay the same)

const LandingScreen = ({ onStart }: { onStart: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-widest uppercase border rounded-full border-accent/30 text-accent bg-accent/5">
        Business Diagnostic
      </div>
      <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl font-serif">
        If you stopped working for 2 weeks… <br/>
        <span className="italic text-accent">would your business still bring in clients?</span>
      </h1>
      <p className="max-w-md mx-auto mb-10 text-lg text-white/60">
        Scratch to reveal what your business qualifies for.
      </p>
    </motion.div>
    
    <button 
      onClick={onStart}
      className="group relative px-10 py-4 bg-accent hover:bg-accent-dark text-black font-bold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(199,168,90,0.3)]"
    >
      <span className="flex items-center gap-2">
        Start <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  </motion.div>
);

const ScratchScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleScratch = useCallback((percent: number) => {
    setScratchedPercent(percent);
    if (percent > 40 && !isFinished) {
      setIsFinished(true);
    }
  }, [isFinished]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
    >
      <div className="mb-12">
        <h2 className="mb-2 text-2xl font-bold font-serif">Your Qualification</h2>
        <p className="text-white/60">Scratch the card below to reveal your credit.</p>
      </div>

      <div className="relative w-full max-w-sm aspect-[3/2] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {/* Revealed Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-card-dark to-black">
          <Trophy className="mb-4 text-accent" size={48} />
          <h3 className="mb-2 text-2xl font-bold text-accent">Congratulations!</h3>
          <p className="text-xl font-medium">You unlocked a $100 Business Diagnostic Credit.</p>
        </div>

        {/* Scratch Layer */}
        {!isFinished && (
          <ScratchCanvas onScratch={handleScratch} />
        )}
      </div>

      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <p className="mb-8 text-lg text-white/80">
              Now let’s see where your business is actually leaking.
            </p>
            <button 
              onClick={onComplete}
              className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all flex items-center gap-2 mx-auto"
            >
              Take the Pressure Test <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ScratchCanvas = ({ onScratch }: { onScratch: (percent: number) => void }) => {
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    if (!node) return;
    const ctx = node.getContext('2d');
    if (!ctx) return;

    const width = node.offsetWidth;
    const height = node.offsetHeight;
    node.width = width;
    node.height = height;

    // Draw scratch layer
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, width, height);
    
    // Add some texture/pattern
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    ctx.fillStyle = '#c7a85a';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', width / 2, height / 2 + 8);

    let isDrawing = false;
    let scratchedPixels = 0;
    const totalPixels = width * height;

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
      
      scratchedPixels += 1;
      // Trigger completion after ~50 scratch movements
      if (scratchedPixels > 50) {
        onScratch(100);
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const rect = node.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
      scratch(x, y);
    };

    node.addEventListener('mousedown', () => isDrawing = true);
    node.addEventListener('touchstart', () => isDrawing = true);
    window.addEventListener('mouseup', () => isDrawing = false);
    window.addEventListener('touchend', () => isDrawing = false);
    node.addEventListener('mousemove', handleMove);
    node.addEventListener('touchmove', handleMove);
  }, [onScratch]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-10 cursor-crosshair scratch-canvas" />;
};

const QuizScreen = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const question = QUESTIONS[currentIdx];
  const progress = ((currentIdx + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (score: number) => {
    const newScore = totalScore + score;
    if (currentIdx < QUESTIONS.length - 1) {
      setTotalScore(newScore);
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(newScore);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen p-6"
    >
      <div className="w-full max-w-md mx-auto mt-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold tracking-widest uppercase text-white/40">Question {currentIdx + 1} of {QUESTIONS.length}</span>
          <span className="text-xs font-bold text-accent">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1 mb-12 overflow-hidden rounded-full bg-white/5">
          <motion.div 
            className="h-full bg-accent" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="mb-10 text-2xl font-bold leading-tight font-serif">
              {question.question}
            </h2>

            <div className="space-y-4">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.score)}
                  className="w-full p-5 text-left transition-all border rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent/50 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-white/80 group-hover:text-white">{opt.label}</span>
                    <ChevronRight size={18} className="opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 text-accent" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const ResultsScreen = ({ score, onNext }: { score: number, onNext: () => void }) => {
  const band = BANDS.find(b => score >= b.min && score <= b.max) || BANDS[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen p-6 pb-20"
    >
      <div className="w-full max-w-md mx-auto mt-8">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="relative flex items-center justify-center w-32 h-32 mb-6">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/5"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="60"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="377"
                initial={{ strokeDashoffset: 377 }}
                animate={{ strokeDashoffset: 377 - (377 * score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-accent"
              />
            </svg>
            <span className="text-4xl font-bold font-serif">{Math.round(score)}</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold font-serif text-accent">{band.title}</h2>
          <p className="text-lg text-white/70 leading-relaxed">
            {band.diagnosis}
          </p>
        </div>

        <div className="p-6 mb-8 border rounded-3xl border-accent/20 bg-accent/5">
          <div className="flex items-center gap-2 mb-4 text-accent">
            <AlertCircle size={20} />
            <h3 className="text-sm font-bold tracking-widest uppercase">Likely Leaks</h3>
          </div>
          <ul className="space-y-3">
            {band.leaks.map((leak, i) => (
              <li key={i} className="flex items-start gap-3 text-white/80">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
                <span>{leak}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 mb-12 border rounded-3xl border-white/5 bg-white/5">
          <div className="flex items-center gap-2 mb-4 text-white/60">
            <Zap size={20} />
            <h3 className="text-sm font-bold tracking-widest uppercase">Next Moves</h3>
          </div>
          <ul className="space-y-3">
            {band.next_moves.map((move, i) => (
              <li key={i} className="flex items-start gap-3 text-white/80">
                <CheckCircle2 size={18} className="mt-0.5 text-emerald-500 shrink-0" />
                <span>{move}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 mb-12 text-center border rounded-3xl border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
          <p className="text-sm font-medium text-accent/80">Reminder: You unlocked a</p>
          <p className="text-xl font-bold text-accent">$100 Business Diagnostic Credit</p>
        </div>

        <div className="mb-12 text-center">
          <p className="mb-4 text-xs font-bold tracking-widest uppercase text-white/40">Share your diagnosis</p>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => {
                const text = `I just took the Business Pressure Test! My score: ${Math.round(score)}/100. Result: ${band.title}. Check yours:`;
                const url = window.location.href;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
              }}
              className="flex items-center justify-center w-12 h-12 transition-all border rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent/50 text-white/60 hover:text-accent"
              title="Share on Twitter"
            >
              <Twitter size={20} />
            </button>
            <button 
              onClick={() => {
                const url = window.location.href;
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
              }}
              className="flex items-center justify-center w-12 h-12 transition-all border rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent/50 text-white/60 hover:text-accent"
              title="Share on LinkedIn"
            >
              <Linkedin size={20} />
            </button>
            <button 
              onClick={() => {
                const url = window.location.href;
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
              }}
              className="flex items-center justify-center w-12 h-12 transition-all border rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent/50 text-white/60 hover:text-accent"
              title="Share on Facebook"
            >
              <Facebook size={20} />
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Business Pressure Test',
                    text: `I just took the Business Pressure Test! My score: ${Math.round(score)}/100. Result: ${band.title}.`,
                    url: window.location.href,
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center justify-center w-12 h-12 transition-all border rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent/50 text-white/60 hover:text-accent"
              title="Copy Link"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <button 
          onClick={onNext}
          className="w-full py-5 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all flex items-center justify-center gap-2"
        >
          Get the Full Diagnosis <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
};

const LeadCaptureScreen = ({
  score,
  band,
  onComplete,
}: {
  score: number;
  band: Band;
  onComplete: (data: LeadData) => void;
}) => {
  const [formData, setFormData] = useState<LeadData>({
    first_name: '',
    email: '',
    telegram_or_phone: '',
    business_type: '',
    revenue_range: '',
    biggest_issue: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload: LeadPayload = {
      ...formData,
      score,
      band_key: band.key,
      band_title: band.title,
      priority: score <= 30 ? 'HOT' : 'NORMAL',
      source: 'business_pressure_test_app',
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Lead submission failed');
      }

      onComplete(formData);
    } catch (err) {
      console.error(err);
      setError('Something went wrong saving your info. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen p-6 pb-20"
    >
      <div className="w-full max-w-md mx-auto mt-8">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold font-serif">Get Your Full Diagnosis</h2>
          <p className="text-white/60">
            Enter your details to receive the complete breakdown and claim your $100 credit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/40">
              <User size={14} /> First Name
            </label>
            <input
              required
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Your name"
              className="w-full p-4 border rounded-2xl border-white/10 bg-white/5 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/40">
              <Mail size={14} /> Email
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@company.com"
              className="w-full p-4 border rounded-2xl border-white/10 bg-white/5 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/40">
              <Phone size={14} /> Telegram or Phone
            </label>
            <input
              type="text"
              value={formData.telegram_or_phone}
              onChange={(e) => setFormData({ ...formData, telegram_or_phone: e.target.value })}
              placeholder="@yourhandle or phone"
              className="w-full p-4 border rounded-2xl border-white/10 bg-white/5 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/40">
              <Briefcase size={14} /> Business Type
            </label>
            <select
              required
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
              className="w-full p-4 border rounded-2xl border-white/10 bg-white/5 focus:outline-none focus:border-accent/50 transition-colors"
            >
              <option value="">Select one</option>
              <option>Coach / Consultant</option>
              <option>Agency / Service Business</option>
              <option>Financial Advisor / Money Manager</option>
              <option>Real Estate</option>
              <option>Medical / Private Practice</option>
              <option>Creator / Personal Brand</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/40">
              <Target size={14} /> Revenue Range
            </label>
            <select
              required
              value={formData.revenue_range}
              onChange={(e) => setFormData({ ...formData, revenue_range: e.target.value })}
              className="w-full p-4 border rounded-2xl border-white/10 bg-white/5 focus:outline-none focus:border-accent/50 transition-colors"
            >
              <option value="">Select one</option>
              <option>Under $50K</option>
              <option>$50K–$100K</option>
              <option>$100K–$250K</option>
              <option>$250K–$1M</option>
              <option>$1M+</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/40">
              <MessageSquare size={14} /> Biggest Issue
            </label>
            <textarea
              required
              rows={4}
              value={formData.biggest_issue}
              onChange={(e) => setFormData({ ...formData, biggest_issue: e.target.value })}
              placeholder="What feels most broken right now?"
              className="w-full p-4 border rounded-2xl border-white/10 bg-white/5 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-accent text-black font-bold rounded-full hover:bg-accent-dark transition-all disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

const CTAScreen = ({ leadData }: { leadData: LeadData | null }) => {
  const triggerEvent = async (type: 'CALL_BOOKED' | 'HIGH_INTENT_ACTION') => {
    try {
      await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, lead_data: leadData }),
      });
    } catch (err) {
      console.error('Failed to trigger event:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
    >
      <div className="w-full max-w-md">
        <div className="mb-12">
          <Target className="mx-auto mb-6 text-accent" size={48} />
          <h2 className="mb-4 text-4xl font-bold font-serif">Ready to fix it?</h2>
          <div className="mb-6 p-4 border border-accent/30 bg-accent/5 rounded-2xl inline-block">
            <p className="text-accent font-bold">You unlocked a $100 diagnostic credit.</p>
            <p className="text-sm text-accent/70">Use it now to get the full diagnosis.</p>
          </div>
          <p className="text-lg text-white/60">
            Most people don’t have a client problem. <br/>
            <span className="text-white font-medium">They have a system problem.</span>
          </p>
        </div>

        <div className="space-y-4">
          <a 
            href="https://majordream.gumroad.com/l/tvnwkw" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => triggerEvent('HIGH_INTENT_ACTION')}
            className="block w-full py-5 bg-accent text-black font-bold rounded-full hover:bg-accent-dark transition-all shadow-[0_0_20px_rgba(199,168,90,0.2)]"
          >
            Get the Full Diagnosis
          </a>
          <a 
            href="https://calendly.com/major-yks/major_hanzo" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => triggerEvent('CALL_BOOKED')}
            className="block w-full py-5 border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-all"
          >
            Book a Strategy Call
          </a>
          <a 
            href="https://t.me/addlist/fehziWk_hgg0MTI1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full py-5 text-white/60 font-medium rounded-full hover:text-white transition-all"
          >
            Join Fix It Now
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [score, setScore] = useState(0);
  const [leadData, setLeadData] = useState<LeadData | null>(null);

  const currentBand =
    BANDS.find((band) => score >= band.min && score <= band.max) || BANDS[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  return (
    <div className="min-h-screen bg-bg-dark selection:bg-accent selection:text-black">
      <AnimatePresence mode="wait">
        {screen === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <LandingScreen onStart={() => setScreen('scratch')} />
          </motion.div>
        )}

        {screen === 'scratch' && (
          <motion.div
            key="scratch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ScratchScreen onComplete={() => setScreen('quiz')} />
          </motion.div>
        )}

        {screen === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <QuizScreen
              onComplete={(finalScore) => {
                setScore(finalScore);
                setScreen('results');
              }}
            />
          </motion.div>
        )}

        {screen === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="h-full"
          >
            <ResultsScreen
              score={score}
              onNext={() => setScreen('lead_capture')}
            />
          </motion.div>
        )}

        {screen === 'lead_capture' && (
          <motion.div
            key="lead_capture"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <LeadCaptureScreen
              score={score}
              band={currentBand}
              onComplete={(data) => {
                setLeadData(data);
                setScreen('cta');
              }}
            />
          </motion.div>
        )}

        {screen === 'cta' && (
          <motion.div
            key="cta"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="h-full"
          >
            <CTAScreen leadData={leadData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
