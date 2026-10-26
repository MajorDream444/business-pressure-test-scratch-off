import test from "node:test";
import assert from "node:assert/strict";
import {
  MAIM_FOLLOWUP_QUEUE_TABLE_ID,
  contactsTableReady,
  leadCaptureTableReady,
  assessmentsTableReady,
  ordersTableReady,
  followupTableReady,
  tableRoleIssues,
} from "../shared/table-policy";

const safe = {
  AIRTABLE_TABLE_ID: "tblLeads",
  AIRTABLE_CONTACTS_TABLE_ID: "tblContacts",
  AIRTABLE_ASSESSMENTS_TABLE_ID: "tblAssessments",
  AIRTABLE_ORDERS_TABLE_ID: "tblOrders",
  AIRTABLE_FOLLOWUP_TABLE_ID: MAIM_FOLLOWUP_QUEUE_TABLE_ID,
};

test("authoritative Airtable roles accept Contacts and Follow-up Queue only in their own slots", () => {
  assert.deepEqual(tableRoleIssues(safe), []);
  assert.equal(contactsTableReady(safe), true);
  assert.equal(leadCaptureTableReady(safe), true);
  assert.equal(assessmentsTableReady(safe), true);
  assert.equal(ordersTableReady(safe), true);
  assert.equal(followupTableReady(safe), true);
});

test("Follow-up Queue can never be treated as Contacts or another write destination", () => {
  for (const key of [
    "AIRTABLE_CONTACTS_TABLE_ID",
    "AIRTABLE_TABLE_ID",
    "AIRTABLE_ASSESSMENTS_TABLE_ID",
    "AIRTABLE_ORDERS_TABLE_ID",
  ] as const) {
    const env = { ...safe, [key]: MAIM_FOLLOWUP_QUEUE_TABLE_ID };
    assert.ok(tableRoleIssues(env).length > 0, key);
    assert.equal(contactsTableReady(env), false, key);
  }
});

test("a duplicate Contacts and follow-up mapping fails closed", () => {
  const env = { ...safe, AIRTABLE_FOLLOWUP_TABLE_ID: safe.AIRTABLE_CONTACTS_TABLE_ID };
  assert.match(tableRoleIssues(env).join("; "), /same table/);
  assert.equal(contactsTableReady(env), false);
  assert.equal(followupTableReady(env), false);
});
