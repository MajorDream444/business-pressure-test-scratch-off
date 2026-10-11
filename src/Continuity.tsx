import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Download, RotateCcw } from 'lucide-react';
import { CHOICES, CONTINUITY_QUESTIONS, CONTINUITY_VERSION, LESSON, continuityResult, continuityReport } from '../shared/continuity';
import SaveContinuity from './SaveContinuity';
import Shop from './Shop';
import type { ContinuityAnswer } from '../shared/continuity';

export default function Continuity({ onExit }: { onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(ContinuityAnswer | null)[]>(Array(6).fill(null));
  const [finished, setFinished] = useState(false);
  const [chosen, setChosen] = useState('');
  const [note, setNote] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const [created] = useState(() => new Date().toLocaleDateString());
  useEffect(() => { window.scrollTo({ top: 0 }); heading.current?.focus(); }, [index, finished]);
  const result = finished ? continuityResult(answers as ContinuityAnswer[]) : null;
  const suggestions = result ? (result.priorities.length ? result.priorities.map(p => p.answer === 'Unsure' ? `Verify your ${p.area.toLowerCase()} plan: ${p.action}` : p.action) : ['Rehearse one continuity plan with a trusted person.']) : [];
  const action = chosen || suggestions[0] || '';
  function download() {
    const blob = new Blob([continuityReport(answers as ContinuityAnswer[], action, note, created)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'MAIM-Founder-Continuity-Plan.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadStatus('Your plan download has started.');
  }
  if (result) return <section className="results-page continuity-results">
    <p className="metadata">MAIM / Founder Continuity Check / {created}</p>
    <h1 ref={heading} tabIndex={-1}>Give your work<br/><span>room to breathe.</span></h1>
    <p className="hero-description">Here is what you described for a two-week absence. Choose one step that would make the biggest difference.</p>
    <p className="results-context">An intentional pause is a valid plan. These are your stated arrangements and unanswered questions, not a prediction of financial security.</p>
    <div className="continuity-summary" aria-label="Your continuity summary">
      <div><strong>{result.strengths.length}</strong><span>Stated strengths</span></div>
      <div><strong>{result.priorities.length}</strong><span>Plans to build or verify</span></div>
      <div><strong>{result.excluded.length}</strong><span>Not applicable</span></div>
    </div>
    <h2 className="signals-heading">Your first priorities</h2>
    {result.priorities.length ? <div className="signals">{result.priorities.slice(0,3).map((p,i) => <article className="signal" key={p.id}>
      <span className="step-number">0{i+1}</span><div className="signal-reading"><h3>{p.area}</h3><p>{p.answer === 'Unsure' ? 'An unanswered question to verify.' : p.answer === 'Partly ready' ? 'A plan that needs another step.' : 'A dependency without a plan yet.'}</p></div>
      <div className="signal-evidence"><span className="metadata">You selected</span><blockquote>{p.answer}</blockquote><span className="metadata">A useful next move</span><p>{p.answer === 'Unsure' ? 'First check what exists. ' : ''}{p.action}</p></div>
    </article>)}</div> : <p className="question-hint">You described a plan, or marked not applicable, for every area. Rehearse one plan to check whether it works in practice.</p>}
    <section className="action-plan"><p className="metadata">One step / The next seven days</p><h2>Choose what matters most.</h2>
      <label htmlFor="chosen-action">Your next action</label><select id="chosen-action" value={chosen || suggestions[0]} onChange={e => setChosen(e.target.value)}>{suggestions.map(s => <option key={s}>{s}</option>)}<option value="Define my own next action in the plan below.">Choose my own action</option></select>
      <label htmlFor="action-note">Make it yours <span>(optional)</span></label><textarea id="action-note" rows={3} maxLength={1200} placeholder="What will you do, and when?" value={note} onChange={e => setNote(e.target.value)}/>
      <p className="privacy-note">Your answers stay in this tab unless you choose to save and email them below. Download your plan before closing or reloading. Do not enter private account credentials.</p>
    </section>
    <SaveContinuity answers={answers as ContinuityAnswer[]} action={action} note={note}/>
    <section className="continuity-lesson"><h2>A little structure creates more choice.</h2><p>{LESSON}</p></section>
    <details className="answer-review"><summary>Review all six answers</summary>{result.readings.map(r => <div key={r.id}><strong>{r.area}</strong><span>{r.answer}</span></div>)}</details>
    <div className="results-actions"><button className="primary" onClick={download}><Download size={18}/> Download my plan</button><button className="secondary" onClick={() => window.print()}>Print / save PDF</button></div>
    <p role="status" aria-live="polite" className="privacy-note">{downloadStatus}</p>
    <div className="quiz-actions"><button className="text-button" onClick={() => { setFinished(false); setIndex(0); setChosen(''); setDownloadStatus(''); }}><RotateCcw size={16}/> Review my answers</button><button className="text-button" onClick={onExit}>Choose another assessment <ArrowRight size={16}/></button></div>
    <Shop/>
    <section className="print-only"><h2>Your complete plan</h2>{result.readings.map(r => <p key={r.id}><strong>{r.area}:</strong> {r.answer}</p>)}<h3>Your seven-day action</h3><p>{action}</p><p style={{whiteSpace:'pre-wrap'}}>{note}</p></section>
    <p className="metadata">Self-reported planning exercise / {CONTINUITY_VERSION}</p>
  </section>;
  const q = CONTINUITY_QUESTIONS[index];
  return <section className="quiz-page">
    <p className="metadata">Founder Continuity Check</p>
    <p className="scenario-note">Imagine you cannot answer messages or deliver your usual work for 14 days. What would happen?</p>
    <div className="progress-meta"><span>Question {index+1} of 6</span><span>{Math.round(index/6*100)}% complete</span></div>
    <div className="progress-track" role="progressbar" aria-label="Questions completed" aria-valuemin={0} aria-valuemax={6} aria-valuenow={index}><div style={{width: `${index/6*100}%`}}/></div>
    <h1 ref={heading} tabIndex={-1}>{q.title}</h1><p className="question-hint">{q.hint}</p>
    <fieldset className="answer-list"><legend className="sr-only">Choose how ready this part of your work is.</legend>{CHOICES.map((choice,i) => <label key={choice} className={`answer-row ${answers[index] === choice ? 'selected' : ''}`}><input type="radio" name={q.id} checked={answers[index] === choice} onChange={() => setAnswers(a => a.map((v,k) => k === index ? choice : v))}/><span className="answer-index">0{i+1}</span><span className="answer-label">{choice}{choice === 'Ready' && <small>A usable route or intentional pause exists.</small>}</span><span className="answer-check">{answers[index] === choice && <Check size={16}/>}</span></label>)}</fieldset>
    <div className="quiz-actions"><button className="secondary" onClick={() => index ? setIndex(index-1) : onExit()}><ArrowLeft size={17}/> Back</button><button className="primary" disabled={!answers[index]} onClick={() => index === 5 ? setFinished(true) : setIndex(index+1)}>{index === 5 ? 'See my plan' : 'Next question'}<ArrowRight size={18}/></button></div>
    <p className="privacy-note">No email needed. Your answers stay in this tab.</p>
  </section>;
}
