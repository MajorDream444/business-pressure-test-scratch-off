import test from 'node:test';
import assert from 'node:assert/strict';
import {followupTime,nurtureReady,coachingEmail} from '../shared/nurture';
import followup from '../api/follow-up';
test('three follow-ups are timed from consent at days 1, 3 and 7',()=>{
 const at='2026-10-11T00:00:00.000Z';
 assert.equal(followupTime(at,0),'2026-10-12T00:00:00.000Z');
 assert.equal(followupTime(at,1),'2026-10-14T00:00:00.000Z');
 assert.equal(followupTime(at,2),'2026-10-18T00:00:00.000Z');
});
test('coaching cannot send while founder copy is unapproved and cron refuses unauthorized callers',async()=>{
 assert.equal(nurtureReady(),false);
 assert.throws(()=>coachingEmail(0,'Name','https://example.com','','https://example.com/unsubscribe'));
 const r={code:0,status(c:number){this.code=c;return this;},json(v:unknown){return v;},setHeader(){}};
 await followup({method:'GET',headers:{},body:null},r);assert.equal(r.code,401);
});
