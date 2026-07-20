-- KOVE OPS M1.1: secure multi-tenant identity and organization foundation.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null unique,
  description text not null default '',
  created_at timestamptz not null default now(),
  constraint roles_key_format check (key ~ '^[a-z][a-z0-9_]*$')
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  timezone text not null default 'America/Chicago',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_name_length check (char_length(name) between 2 and 160),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint organizations_status_check check (status in ('active', 'suspended', 'archived'))
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  first_name text not null default '',
  last_name text not null default '',
  email text not null unique,
  phone text,
  avatar_url text,
  job_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_first_name_length check (char_length(first_name) <= 100),
  constraint profiles_last_name_length check (char_length(last_name) <= 100)
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  invited_by uuid references public.profiles(id) on delete set null,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  active boolean not null default true,
  constraint organization_members_unique unique (organization_id, profile_id),
  constraint organization_members_acceptance check (accepted_at is null or accepted_at >= invited_at)
);

create index profiles_organization_id_idx on public.profiles (organization_id);
create index organization_members_profile_id_idx on public.organization_members (profile_id);
create index organization_members_role_id_idx on public.organization_members (role_id);
create index organization_members_invited_by_idx on public.organization_members (invited_by);
create index organization_members_org_active_idx on public.organization_members (organization_id, active) where active = true;

insert into public.roles (id, key, name, description)
values
  ('10000000-0000-4000-8000-000000000001', 'owner', 'Owner', 'Full organization ownership and governance.'),
  ('10000000-0000-4000-8000-000000000002', 'administrator', 'Administrator', 'Organization administration and user management.'),
  ('10000000-0000-4000-8000-000000000003', 'operations_manager', 'Operations Manager', 'Operational oversight and approvals.'),
  ('10000000-0000-4000-8000-000000000004', 'order_coordinator', 'Order Coordinator', 'Order coordination and execution.'),
  ('10000000-0000-4000-8000-000000000005', 'warehouse', 'Warehouse', 'Warehouse execution access.'),
  ('10000000-0000-4000-8000-000000000006', 'finance', 'Finance', 'Financial workflow access.'),
  ('10000000-0000-4000-8000-000000000007', 'viewer', 'Viewer', 'Read-only organization access.')
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.organizations (id, name, slug, industry, timezone, status)
values (
  '20000000-0000-4000-8000-000000000001',
  'Redwood Contractors',
  'redwood-contractors',
  'Industrial construction',
  'America/Chicago',
  'active'
)
on conflict (slug) do nothing;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function private.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create or replace function private.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.profile_id = (select auth.uid())
      and membership.active = true
      and membership.accepted_at is not null
  );
$$;

create or replace function private.has_organization_role(target_organization_id uuid, allowed_role_keys text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.organization_members membership
    join public.roles role on role.id = membership.role_id
    where membership.organization_id = target_organization_id
      and membership.profile_id = (select auth.uid())
      and membership.active = true
      and membership.accepted_at is not null
      and role.key = any(allowed_role_keys)
  );
$$;

create or replace function private.can_manage_users(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_organization_role(
    target_organization_id,
    array['owner', 'administrator']::text[]
  );
$$;

create or replace function private.can_assign_role(target_organization_id uuid, target_role_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can_manage_users(target_organization_id)
    and (
      not exists (
        select 1 from public.roles where id = target_role_id and key = 'owner'
      )
      or private.has_organization_role(target_organization_id, array['owner']::text[])
    );
$$;

create or replace function private.protect_last_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_role_id uuid;
  remaining_owners integer;
begin
  select id into owner_role_id from public.roles where key = 'owner';

  if old.role_id = owner_role_id and old.active = true
     and (tg_op = 'DELETE' or new.role_id <> owner_role_id or new.active = false) then
    select count(*) into remaining_owners
    from public.organization_members
    where organization_id = old.organization_id
      and role_id = owner_role_id
      and active = true
      and id <> old.id;

    if remaining_owners = 0 then
      raise exception 'An organization must retain at least one active owner.'
        using errcode = '23514';
    end if;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger organization_members_protect_last_owner
before update or delete on public.organization_members
for each row execute function private.protect_last_owner();

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_organization_id uuid;
  target_role_id uuid;
  requested_organization_id text;
  requested_role_key text;
  organization_name text;
  slug_base text;
begin
  requested_organization_id := new.raw_app_meta_data ->> 'organization_id';
  requested_role_key := coalesce(new.raw_app_meta_data ->> 'role_key', 'owner');

  if requested_organization_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
     and exists (
       select 1 from public.organizations
       where id = requested_organization_id::uuid and status = 'active'
     ) then
    target_organization_id := requested_organization_id::uuid;
  else
    organization_name := coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'organization_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), '') || ' Workspace',
      'My Organization'
    );
    slug_base := trim(both '-' from regexp_replace(lower(organization_name), '[^a-z0-9]+', '-', 'g'));
    if slug_base = '' then slug_base := 'organization'; end if;

    insert into public.organizations (name, slug)
    values (organization_name, slug_base || '-' || left(new.id::text, 8))
    returning id into target_organization_id;
    requested_role_key := 'owner';
  end if;

  select id into target_role_id
  from public.roles
  where key = requested_role_key;

  if target_role_id is null then
    raise exception 'Unknown organization role.' using errcode = '22023';
  end if;

  insert into public.profiles (
    id, organization_id, first_name, last_name, email, phone, avatar_url, job_title
  ) values (
    new.id,
    target_organization_id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.email, new.id::text || '@no-email.local'),
    new.phone,
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'job_title'
  );

  insert into public.organization_members (
    organization_id, profile_id, role_id, invited_by, invited_at, accepted_at, active
  ) values (
    target_organization_id, new.id, target_role_id, null, now(), now(), true
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.roles enable row level security;

create policy organizations_select_member
on public.organizations for select to authenticated
using ((select private.is_organization_member(id)));

create policy organizations_update_administrator
on public.organizations for update to authenticated
using ((select private.can_manage_users(id)))
with check ((select private.can_manage_users(id)));

create policy profiles_select_organization
on public.profiles for select to authenticated
using ((select private.is_organization_member(organization_id)));

create policy profiles_update_self_or_administrator
on public.profiles for update to authenticated
using (
  id = (select auth.uid())
  or (select private.can_manage_users(organization_id))
)
with check (
  (id = (select auth.uid()) and (select private.is_organization_member(organization_id)))
  or (select private.can_manage_users(organization_id))
);

create policy organization_members_select_member
on public.organization_members for select to authenticated
using ((select private.is_organization_member(organization_id)));

create policy organization_members_insert_administrator
on public.organization_members for insert to authenticated
with check ((select private.can_assign_role(organization_id, role_id)));

create policy organization_members_update_administrator
on public.organization_members for update to authenticated
using ((select private.can_manage_users(organization_id)))
with check ((select private.can_assign_role(organization_id, role_id)));

create policy organization_members_delete_administrator
on public.organization_members for delete to authenticated
using ((select private.can_manage_users(organization_id)));

create policy roles_select_authenticated
on public.roles for select to authenticated
using ((select auth.uid()) is not null);

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to authenticated;
grant select, update on public.organizations to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select on public.roles to authenticated;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.protect_last_owner() from public, anon, authenticated;
revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
revoke all on function private.is_organization_member(uuid) from public, anon;
revoke all on function private.has_organization_role(uuid, text[]) from public, anon;
revoke all on function private.can_manage_users(uuid) from public, anon;
revoke all on function private.can_assign_role(uuid, uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_organization_member(uuid) to authenticated;
grant execute on function private.has_organization_role(uuid, text[]) to authenticated;
grant execute on function private.can_manage_users(uuid) to authenticated;
grant execute on function private.can_assign_role(uuid, uuid) to authenticated;

comment on table public.organizations is 'Tenant boundary for every KOVE OPS workspace.';
comment on table public.profiles is 'Application identity linked one-to-one with auth.users.';
comment on table public.organization_members is 'Role-bearing membership between a profile and an organization.';
comment on table public.roles is 'System-defined RBAC roles shared by all organizations.';
