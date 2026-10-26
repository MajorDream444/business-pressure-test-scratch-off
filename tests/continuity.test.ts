import test from 'node:test';
import assert from 'node:assert/strict';
import { continuityResult, continuityReport } from '../shared/continuity';
test('continuity keeps uncertainty distinct and excludes nonapplicable areas', () => {
 const r = continuityResult(['Ready','Unsure','Partly ready','No plan yet','Not applicable','Ready']);
 assert.deepEqual(r.priorities.map(p => p.answer), ['No plan yet','Partly ready','Unsure']);
 assert.equal(r.strengths.length,2); assert.equal(r.excluded.length,1);
 assert.equal(r.priorities.some(p => p.answer === 'Not applicable'),false);
});
test('continuity does not manufacture risk for intentional plans or excluded questions', () => {
 assert.equal(continuityResult(Array(6).fill('Ready')).priorities.length,0);
 assert.equal(continuityResult(Array(6).fill('Not applicable')).strengths.length,0);
 assert.throws(() => continuityResult([]));
 assert.throws(() => continuityResult(Array(6).fill('invalid')));
});
test('portable report contains every answer and the participant chosen action', () => {
 const r = continuityReport(['Ready','Unsure','Partly ready','No plan yet','Not applicable','Ready'], 'My own action','By Friday','11 October 2026');
 assert.ok(r.includes('My own action')); assert.ok(r.includes('By Friday'));
 assert.ok(r.includes('Excluded from priorities.')); assert.ok(r.includes('not a validated resilience score'));
 assert.ok(r.includes('requires consent'));
});
