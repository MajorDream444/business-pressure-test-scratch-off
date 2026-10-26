export const CONTINUITY_VERSION = 'founder-continuity-v1';
export const CHOICES = ['Ready', 'Partly ready', 'No plan yet', 'Unsure', 'Not applicable'] as const;
export type ContinuityAnswer = typeof CHOICES[number];
export const CONTINUITY_QUESTIONS = [
  { id: 'offer', title: 'Can someone understand your offer and how to start without you explaining it?', area: 'A clear front door', hint: 'A clear offer and entry instructions can do this. Think about what a new person can understand today.', action: 'Write one plain-language offer and one clear next step.' },
  { id: 'inquiries', title: 'Will new inquiries receive an accurate response while you are away?', area: 'New inquiries', hint: 'An honest absence reply, a trusted person, or a pause notice can all work. Avoid promising a response you cannot provide.', action: 'Create an absence message and one reliable inquiry route.' },
  { id: 'clients', title: 'Do existing clients know what will continue, pause or be rescheduled?', area: 'Client commitments', hint: 'Your work can intentionally pause. What matters is that clients know what to expect.', action: 'Make a client communication and rescheduling plan.' },
  { id: 'operations', title: 'Can bookings, payments and essential deadlines be handled or safely paused?', area: 'Essential operations', hint: 'Think about the commitments that cannot simply wait, and who is authorized to handle them.', action: 'List the next two weeks of deadlines and assign a responsible person or a safe pause.' },
  { id: 'recovery', title: 'Can essential business information be recovered and used by an authorized person when needed?', area: 'Information recovery', hint: 'Think about documents and account recovery. Do not enter passwords or access codes here.', action: 'Document where essential information is stored and test an appropriate recovery route.' },
  { id: 'commitments', title: 'Can the business meet unavoidable commitments during the pause?', area: 'Unavoidable commitments', hint: 'A workable reserve, coverage or renegotiation plan may help. You do not need to share financial amounts.', action: 'List unavoidable commitments and decide how each will be covered.' },
] as const;
export const LESSON = 'Continuity means deciding what should continue, what may pause, and how people will know. Clear instructions and boundaries can protect your work before you invest in more tools.';
export function continuityResult(answers: readonly ContinuityAnswer[]) {
  if (answers.length !== CONTINUITY_QUESTIONS.length || answers.some(a => !CHOICES.includes(a))) throw new Error('Complete all six questions first.');
  const readings = CONTINUITY_QUESTIONS.map((q, i) => ({ ...q, answer: answers[i] }));
  const priorities = readings.filter(r => r.answer !== 'Ready' && r.answer !== 'Not applicable').sort((a,b) => {
    const rank = { 'No plan yet': 0, 'Partly ready': 1, 'Unsure': 2 };
    return rank[a.answer as keyof typeof rank] - rank[b.answer as keyof typeof rank];
  });
  return { readings, strengths: readings.filter(r => r.answer === 'Ready'), priorities, excluded: readings.filter(r => r.answer === 'Not applicable') };
}
export function continuityReport(answers: readonly ContinuityAnswer[], action: string, note: string, date: string) {
  const result = continuityResult(answers);
  return ['MAJOR AI MINDSET', 'Founder Continuity Check', `Assessment: ${CONTINUITY_VERSION}`, `Created: ${date}`, '', 'Scenario: You are unavailable for 14 days.', 'This is a self-reported planning exercise, not a validated resilience score.', '', ...result.readings.map(r => `${r.area}: ${r.answer}\nQuestion: ${r.title}\n${r.answer === 'Not applicable' ? 'Excluded from priorities.' : r.answer === 'Ready' ? 'A stated continuity strength; rehearse the plan.' : `Suggested action: ${r.action}`}`), '', `MY SEVEN-DAY ACTION\n${action}`, note.trim() ? `MY PLAN\n${note.trim()}` : '', '', `A SHORT LESSON\n${LESSON}`, '', 'Saving with MAIM is optional and requires consent. Keep this report somewhere you control.'].filter(Boolean).join('\n\n');
}
