-- Proposed migration. Not applied to any project. Authenticated reads only;
-- trusted server provisioning/writes must independently enforce tenant scope.
begin;
create schema if not exists maim;
create table maim.workspaces(id uuid primary key default gen_random_uuid(),order_reference text unique not null,status text not null default 'awaiting_intake',created_at timestamptz not null default now());
create table maim.memberships(workspace_id uuid not null references maim.workspaces(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,role text not null check(role in ('client','operator')),primary key(workspace_id,user_id));
create index memberships_user on maim.memberships(user_id,workspace_id);
create table maim.reports(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references maim.workspaces(id) on delete cascade,period date not null,body jsonb not null,approved_at timestamptz,published_at timestamptz,unique(workspace_id,period));
create index reports_workspace on maim.reports(workspace_id);
create table maim.vault_assets(id uuid primary key default gen_random_uuid(),workspace_id uuid not null references maim.workspaces(id) on delete cascade,storage_key text unique not null,rights text not null default 'unknown' check(rights in ('unknown','private_only','commercial_approved')),reviewed boolean not null default false,third_party_consent boolean not null default false,retention_until timestamptz not null);
create index assets_workspace on maim.vault_assets(workspace_id);
alter table maim.workspaces enable row level security;
alter table maim.memberships enable row level security;
alter table maim.reports enable row level security;
alter table maim.vault_assets enable row level security;
create policy own_membership on maim.memberships for select to authenticated using(user_id=(select auth.uid()));
create policy member_workspace on maim.workspaces for select to authenticated using(exists(select 1 from maim.memberships m where m.workspace_id=id and m.user_id=(select auth.uid())));
create policy published_reports on maim.reports for select to authenticated using(approved_at is not null and published_at is not null and exists(select 1 from maim.memberships m where m.workspace_id=reports.workspace_id and m.user_id=(select auth.uid())));
-- No client write policies and no vault client-read policy until entitlement
-- and private storage download policies are implemented and tested.
grant usage on schema maim to authenticated;
grant select on maim.workspaces,maim.memberships,maim.reports to authenticated;
revoke all on all tables in schema maim from anon;
commit;
