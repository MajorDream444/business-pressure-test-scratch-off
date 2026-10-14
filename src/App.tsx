import { useEffect, useRef, useState } from "react";
import {
  QUESTIONS,
  diagnose,
  BUSINESS_TYPES,
  REVENUES,
  READINESS,
} from "../shared/diagnostic";
import type { FormEvent, CSSProperties } from "react";
import type { Submission } from "../shared/diagnostic";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Download,
  RotateCcw,
} from "lucide-react";
import "./index.css";
import Continuity from "./Continuity";
import Shop from "./Shop";
import {googleBookingUrl} from "../shared/google-booking";
const booking = googleBookingUrl(import.meta.env.VITE_GOOGLE_BOOKING_URL);
const hints = [
  "Think about the last few paying clients, not the channel you hope will work.",
  "Imagine taking a real break with no calls, messages, or daily check-ins.",
  "Think about how easily someone can understand what they can buy.",
  "Look at your recent weeks, rather than your best week.",
  "Consider what happens after someone shows interest.",
  "Think about client information, delivery, and commitments.",
  "Consider whether you can connect paid work to specific offers or channels.",
  "Think about repeatable tasks, not just the tools you own.",
  "Choose the answer that reflects your current visibility.",
  "Consider whether delivery would stay consistent if enquiries increased.",
];
type Capability = {
  captureAvailable: boolean;
  emailAvailable: boolean;
  challenge: string | null;
};
type SaveState =
  "idle" | "saving" | "saved" | "email_failed" | "email_unavailable" | "error";
export default function App() {
  const [view, setView] = useState<"landing" | "quiz" | "results" | "continuity">(window.location.hash === "#continuity" ? "continuity" : window.location.hash === "#business" ? "quiz" : "landing");
  useEffect(() => {
    const navigate = () => {
      setView(window.location.hash === "#continuity" ? "continuity" : window.location.hash === "#business" ? "quiz" : "landing");
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  const [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<number[]>(Array(10).fill(-1));
  const [showForm, setShowForm] = useState(false),
    [cap, setCap] = useState<Capability | null>(null),
    [capError, setCapError] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle"),
    [error, setError] = useState("");
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telegramOrPhone: "",
    businessType: BUSINESS_TYPES[0],
    revenueRange: REVENUES[0],
    biggestIssue: "",
    readiness: READINESS[0],
    consent: false,
    marketingConsent: false,
    website: "",
  });
  const [submissionId] = useState(() => crypto.randomUUID());
  const heading = useRef<HTMLHeadingElement>(null),
    capRequest = useRef(0),
    previousView = useRef(view);
  useEffect(() => {
    if (previousView.current !== view) {
      window.scrollTo({ top: 0 });
      previousView.current = view;
    }
    heading.current?.focus();
  }, [view, index]);
  async function refreshCapability() {
    const request = ++capRequest.current;
    setCapError(false);
    setCap(null);
    try {
      const r = await fetch("/api/challenge", {
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) throw new Error();
      const v: Capability = await r.json();
      if (request === capRequest.current) setCap(v);
    } catch {
      if (request === capRequest.current) setCapError(true);
    }
  }
  function changeContact(key: string, value: string | boolean) {
    setContact((c) => ({ ...c, [key]: value }));
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (saveState === "saving" || !cap?.challenge) return;
    setSaveState("saving");
    setError("");
    try {
      const payload: Submission = {
        ...contact,
        submissionId,
        answers,
        challenge: cap.challenge,
      };
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(55000),
      });
      const body = await response.json();
      if (!response.ok || body.saved !== true)
        throw new Error(
          body.error || "We could not confirm the save. Please try again.",
        );
      if (body.followupStatus === "pending") setError("Your results are saved, but coaching email enrollment needs attention.");
      if (body.contactStatus === "pending") setError("Your results are saved, but contact sync still needs attention.");
      setSaveState(
        body.emailStatus === "sent"
          ? "saved"
          : body.emailStatus === "failed"
            ? "email_failed"
            : "email_unavailable",
      );
    } catch (e) {
      setSaveState("error");
      setError(e instanceof Error ? e.message : "Please try again.");
      await refreshCapability();
    }
  }
  const result = view === "results" ? diagnose(answers) : null;
  const q = QUESTIONS[index];
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Major AI Mindset home">
          <img
            src="/maim-mark.png"
            alt="MAIM gold crown seal"
            width="52"
            height="52"
          />
          <span>
            <strong>MAJOR AI MINDSET</strong>
            <span>Clarity & continuity</span>
          </span>
        </a>
        <a
          className="ecosystem-link"
          href="https://github.com/MajorDream444/Major-AI-OS"
          target="_blank"
          rel="noreferrer"
        >
          The MAIM ecosystem <ArrowRight size={16} />
        </a>
      </header>
      <main>
        {view === "landing" && (
          <>
            <section className="landing-hero">
              <div className="hero-copy">
                <h1 ref={heading} tabIndex={-1}>
                  Understand your position.
                  <br />
                  <span>Create more choices.</span>
                </h1>
                <p className="hero-description">
                  Short assessments to see what depends on you, learn where
                  pressure builds, and choose one practical next step.
                </p>
                <a className="primary" href="#assessments">
                  Choose your assessment <ArrowRight size={20} />
                </a>
                <p className="metadata">
                  A few minutes <span>·</span> Free results <span>·</span> Your
                  next move
                </p>
              </div>
              <div className="orbit" aria-hidden="true">
                <div className="orbit-ring outer">
                  <i />
                </div>
                <div className="orbit-ring middle">
                  <i />
                </div>
                <div className="orbit-ring inner">
                  <i />
                </div>
                <div className="orbit-core">Clarity</div>
              </div>
            </section>
            <section className="assessment-picker" id="assessments" aria-labelledby="assessment-heading">
              <div className="section-intro"><p className="metadata">Start where you are</p><h2 id="assessment-heading">What would you like to understand?</h2><p>Choose a starting point. Both give you something useful to keep.</p></div>
              <div className="assessment-grid">
                <article className="assessment-card"><span className="metadata">01 / Continuity</span><h3>Can your work<br/>give you room to step away?</h3><p>If you were unavailable for two weeks, what would keep working—and what would need another plan?</p><div className="metadata">6 questions · A seven-day action plan</div><a className="primary" href="#continuity">Check my continuity <ArrowRight size={18}/></a></article>
                <article className="assessment-card"><span className="metadata">02 / Business systems</span><h3>Where is pressure<br/>building in your business?</h3><p>Look at your offer, client flow, follow-up and operating structure. See what to build first.</p><div className="metadata">10 questions · Three pressure signals</div><a className="secondary" href="#business">Start the pressure test <ArrowRight size={18}/></a></article>
              </div>
            </section>
            <section
              className="how-it-works"
              aria-label="How the pressure test works"
            >
              {[
                [
                  "01",
                  "Answer honestly",
                  "A clear picture of how your business works today.",
                ],
                [
                  "02",
                  "See your signals",
                  "Understand where pressure builds, using your own answers.",
                ],
                [
                  "03",
                  "Choose one next move",
                  "Leave with a focused action you can put to work.",
                ],
              ].map(([n, title, body]) => (
                <div key={n}>
                  <span className="step-number">{n}</span>
                  <h2>{title}</h2>
                  <p>{body}</p>
                </div>
              ))}
            </section>
            <p className="quiet-note">
              For creators, coaches, founders, and people building from where
              they are. No email needed to see your results.
            </p>
          </>
        )}
        {view === "continuity" && <Continuity onExit={() => { window.location.hash = ""; setView("landing"); }} />}
        {view === "quiz" && (
          <section className="quiz-page">
            <div className="progress-meta">
              <span>
                Question {index + 1} of {QUESTIONS.length}
              </span>
              <span>{Math.round((index / 10) * 100)}% complete</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Questions completed"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={index}
            >
              <div style={{ width: `${index * 10}%` }} />
            </div>
            <h1 ref={heading} tabIndex={-1}>
              {q.question}
            </h1>
            <p className="question-hint">{hints[index]}</p>
            <fieldset className="answer-list">
              <legend className="sr-only">
                Choose the answer that describes your business today.
              </legend>
              {q.options.map((option, i) => (
                <label
                  key={option.label}
                  className={`answer-row ${answers[index] === i ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={i}
                    checked={answers[index] === i}
                    onChange={() =>
                      setAnswers((a) =>
                        a.map((old, k) => (k === index ? i : old)),
                      )
                    }
                  />
                  <span className="answer-index">0{i + 1}</span>
                  <span className="answer-label">{option.label}</span>
                  <span className="answer-check">
                    {answers[index] === i && <Check size={16} />}
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="quiz-actions">
              <button
                className="secondary"
                onClick={() =>
                  index === 0 ? (window.location.hash = "", setView("landing")) : setIndex(index - 1)
                }
              >
                <ArrowLeft size={17} /> Back
              </button>
              <button
                className="primary"
                disabled={answers[index] === -1}
                onClick={() =>
                  index === 9 ? setView("results") : setIndex(index + 1)
                }
              >
                {index === 9 ? "See my results" : "Next question"}{" "}
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}
        {result && (
          <section className="results-page">
            <div className="results-intro">
              <div>
                <h1 ref={heading} tabIndex={-1}>
                  Your next move
                  <br />
                  <span>starts here.</span>
                </h1>
                <h2 className="result-band">{result.band.title}</h2>
                <p>{result.diagnosisSummary}</p>
              </div>
              <div
                className="score-dial"
                style={
                  {
                    "--score": `${result.totalScore * 3.6}deg`,
                  } as CSSProperties
                }
              >
                <div>
                  <strong>{result.totalScore}</strong>
                  <span>/ 100</span>
                </div>
              </div>
            </div>
            <p className="results-context">
              Your score reflects the operating structure you described. It is a
              starting map, not a prediction of revenue or a guarantee of
              readiness to scale.
            </p>
            <h2 className="signals-heading">Your first pressure signals</h2>
            <div className="signals">
              {result.signals.map((signal, i) => (
                <article className="signal" key={i}>
                  <span className="step-number">0{i + 1}</span>
                  <div className="signal-reading">
                    <h3>{signal.category}</h3>
                    <p>{signal.summary}</p>
                  </div>
                  <div className="signal-evidence">
                    <span className="metadata">You said</span>
                    <blockquote>“{signal.evidence}”</blockquote>
                    <span className="metadata">Your next move</span>
                    <p>{signal.action}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="results-actions">
              <button
                className="primary"
                onClick={() => {
                  setShowForm(true);
                  void refreshCapability();
                  setTimeout(
                    () =>
                      document
                        .getElementById("save-results")
                        ?.scrollIntoView({ behavior: "smooth" }),
                    50,
                  );
                }}
              >
                Save my results <ArrowRight size={18} />
              </button>
              <button className="secondary" onClick={() => window.print()}>
                <Download size={17} /> Print / save PDF
              </button>
            </div>
            {showForm && (
              <section className="save-section" id="save-results">
                <h2>Keep your map. Choose your next move.</h2>
                <p>
                  Save your results with Major AI Mindset and share what kind of
                  support you want.
                </p>
                {!cap && !capError && (
                  <p role="status">Checking availability…</p>
                )}
                {capError && (
                  <div role="alert">
                    <p>
                      We could not open the save form. Your results are still
                      available above.
                    </p>
                    <button
                      className="secondary"
                      onClick={() => void refreshCapability()}
                    >
                      Try again
                    </button>
                  </div>
                )}
                {cap && !cap.captureAvailable && (
                  <div className="save-notice" role="status">
                    <p>
                      Saving is not available yet. You can keep your results
                      with Print / save PDF.
                    </p>
                  </div>
                )}
                {cap?.captureAvailable && (
                  <form onSubmit={save}>
                    <div className="form-grid">
                      <label>
                        First name
                        <input
                          required
                          autoComplete="given-name"
                          maxLength={80}
                          value={contact.firstName}
                          onChange={(e) =>
                            changeContact("firstName", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Last name <span>(optional)</span>
                        <input
                          autoComplete="family-name"
                          maxLength={80}
                          value={contact.lastName}
                          onChange={(e) =>
                            changeContact("lastName", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Email
                        <input
                          required
                          type="email"
                          autoComplete="email"
                          maxLength={254}
                          value={contact.email}
                          onChange={(e) =>
                            changeContact("email", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        WhatsApp / Telegram <span>(optional)</span>
                        <input
                          autoComplete="tel"
                          maxLength={120}
                          value={contact.telegramOrPhone}
                          onChange={(e) =>
                            changeContact("telegramOrPhone", e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Your work
                        <select
                          value={contact.businessType}
                          onChange={(e) =>
                            changeContact("businessType", e.target.value)
                          }
                        >
                          {BUSINESS_TYPES.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Monthly revenue
                        <select
                          value={contact.revenueRange}
                          onChange={(e) =>
                            changeContact("revenueRange", e.target.value)
                          }
                        >
                          {REVENUES.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label>
                      What would you most like to change?{" "}
                      <span>(optional)</span>
                      <textarea
                        rows={3}
                        maxLength={1200}
                        value={contact.biggestIssue}
                        onChange={(e) =>
                          changeContact("biggestIssue", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      Where are you right now?
                      <select
                        value={contact.readiness}
                        onChange={(e) =>
                          changeContact("readiness", e.target.value)
                        }
                      >
                        {READINESS.map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    <label className="honeypot" aria-hidden="true">
                      Website
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={contact.website}
                        onChange={(e) =>
                          changeContact("website", e.target.value)
                        }
                      />
                    </label>
                    <label className="consent">
                      <input
                        type="checkbox"
                        required
                        checked={contact.consent}
                        onChange={(e) =>
                          changeContact("consent", e.target.checked)
                        }
                      />
                      <span>
                        I agree to MAIM storing these answers and contact
                        details to provide my results and respond to this
                        request. This does not subscribe me to a newsletter.
                      </span>
                    </label>
                    <label className="consent"><input type="checkbox" checked={contact.marketingConsent} onChange={e => changeContact("marketingConsent",e.target.checked)}/><span>Optional: send me three coaching emails over the next week, including an invitation to the paid blueprint. I can unsubscribe anytime.</span></label>
                    <p className="privacy-note">
                      Stored in MAIM’s client records. Email delivery uses our
                      email provider.{" "}
                      <a href="/privacy.html" target="_blank" rel="noreferrer">
                        How we handle your data
                      </a>
                    </p>
                    {!cap.emailAvailable && (
                      <p className="save-notice">
                        You can save your map, but results email is currently
                        unavailable. Keep a PDF copy too.
                      </p>
                    )}
                    <div role="status" aria-live="polite">
                      {saveState === "saved" && (
                        <p className="success">
                          Your results are saved and the email provider accepted
                          your results email. Check your inbox and spam folder.
                        </p>
                      )}
                      {saveState === "email_failed" && (
                        <p className="save-notice">
                          Your results are saved, but the email could not be
                          sent. Retry the email below, or keep a PDF copy.
                        </p>
                      )}
                      {saveState === "email_unavailable" && (
                        <p className="success">
                          Your results are saved. Email is not available yet;
                          keep a PDF copy.
                        </p>
                      )}
                    </div>
                    {saveState !== "error" && error && <p className="save-notice" role="status">{error}</p>}
                    {saveState === "error" && (
                      <p className="error" role="alert">
                        {error} Your answers remain here.
                      </p>
                    )}
                    {!["saved", "email_unavailable"].includes(saveState) && (
                      <button
                        className="primary"
                        type="submit"
                        disabled={saveState === "saving" || !cap.challenge}
                      >
                        {saveState === "saving"
                          ? "Saving your results…"
                          : saveState === "email_failed"
                            ? "Retry results email"
                            : saveState === "error"
                              ? "Retry save"
                              : "Save my map"}{" "}
                        <ArrowRight size={17} />
                      </button>
                    )}
                  </form>
                )}
              </section>
            )}
            {booking && (
              <div className="booking">
                <h2>Turn the signal into a clear plan.</h2>
                <p>
                  A conversation to review your results and choose what to build
                  first.
                </p>
                <a
                  className="secondary"
                  href={booking}
                  target="_blank"
                  rel="noreferrer"
                >
                  Discuss my next move <ArrowRight size={17} />
                </a>
              </div>
            )}
            <button
              className="text-button"
              onClick={() => {
                setIndex(0);
                setView("quiz");
                setShowForm(false);
                setSaveState("idle");
              }}
            >
              <RotateCcw size={16} /> Review my answers
            </button>
          </section>
        )}
        {(view === "landing" || view === "results") && <Shop />}
      </main>
      <footer>
        <p>
          AI is the tool. <strong>You are the future.</strong>
        </p>
        <span className="metadata">Clarity / Focus / Progress</span>
        <nav aria-label="Policies"><a href="/terms.html">Terms</a> · <a href="/refunds.html">Refunds</a> · <a href="/privacy.html">Privacy</a> · <a href="/participant-agreement.html">Responsibilities</a></nav>
        <div className="tri-bar">
          <i />
          <i />
          <i />
        </div>
      </footer>
    </div>
  );
}
