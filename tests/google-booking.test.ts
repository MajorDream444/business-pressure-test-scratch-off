import test from 'node:test';
import assert from 'node:assert/strict';
import {googleBookingUrl} from '../shared/google-booking';
test('booking accepts Google appointment routes only, not lookalikes or legacy providers',()=>{
 assert.ok(googleBookingUrl('https://calendar.google.com/calendar/appointments/schedules/example'));
 assert.ok(googleBookingUrl('https://calendar.app.google/example'));
 for(const v of ['https://calendly.com/example','https://calendar.google.com.evil.test/calendar/appointments/x','https://calendar.google.com/calendar/u/0/r','http://calendar.app.google/x','https://user:pass@calendar.app.google/x'])assert.equal(googleBookingUrl(v),'');
});
