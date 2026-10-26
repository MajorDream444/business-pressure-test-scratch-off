export const MAIM_FOLLOWUP_QUEUE_TABLE_ID = "tbl1pPhCa6bx3ST3E";

type TableEnvironment = Partial<Record<
  | "AIRTABLE_TABLE_ID"
  | "AIRTABLE_CONTACTS_TABLE_ID"
  | "AIRTABLE_ASSESSMENTS_TABLE_ID"
  | "AIRTABLE_ORDERS_TABLE_ID"
  | "AIRTABLE_FOLLOWUP_TABLE_ID",
  string | undefined
>>;

export function tableRoleIssues(env: TableEnvironment = process.env): string[] {
  const issues: string[] = [];
  const contacts = env.AIRTABLE_CONTACTS_TABLE_ID;
  const followup = env.AIRTABLE_FOLLOWUP_TABLE_ID;

  if (contacts === MAIM_FOLLOWUP_QUEUE_TABLE_ID)
    issues.push("Contacts is mapped to the MAIM Follow-up Queue");
  if (contacts && followup && contacts === followup)
    issues.push("Contacts and follow-up queue use the same table");

  const assigned = [
    ["lead capture", env.AIRTABLE_TABLE_ID],
    ["assessment responses", env.AIRTABLE_ASSESSMENTS_TABLE_ID],
    ["orders", env.AIRTABLE_ORDERS_TABLE_ID],
  ] as const;
  for (const [role, table] of assigned)
    if (table && table === MAIM_FOLLOWUP_QUEUE_TABLE_ID)
      issues.push(`${role} is mapped to the MAIM Follow-up Queue`);

  return issues;
}

export function contactsTableReady(env: TableEnvironment = process.env): boolean {
  return Boolean(env.AIRTABLE_CONTACTS_TABLE_ID) && tableRoleIssues(env).length === 0;
}

export function followupTableReady(env: TableEnvironment = process.env): boolean {
  return (
    env.AIRTABLE_FOLLOWUP_TABLE_ID === MAIM_FOLLOWUP_QUEUE_TABLE_ID &&
    tableRoleIssues(env).length === 0
  );
}
