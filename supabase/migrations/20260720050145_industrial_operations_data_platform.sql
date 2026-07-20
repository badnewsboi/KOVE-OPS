-- KOVE OPS M2: tenant-scoped industrial operations data platform.

create table public.customers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  customer_code text not null, name text not null, status text not null default 'active', billing_address jsonb not null default '{}'::jsonb,
  shipping_address jsonb not null default '{}'::jsonb, billing_terms text, notes text, archived_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint customers_org_code_unique unique (organization_id, customer_code), constraint customers_status_check check (status in ('prospect','active','on_hold','inactive')),
  constraint customers_name_check check (char_length(trim(name)) between 2 and 200)
);
create table public.customer_contacts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete cascade, name text not null, title text, email text, phone text,
  is_primary boolean not null default false, archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint customer_contacts_channel_check check (email is not null or phone is not null)
);
create table public.vendors (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  vendor_code text not null, name text not null, terms text, status text not null default 'active', notes text, archived_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint vendors_org_code_unique unique (organization_id, vendor_code), constraint vendors_status_check check (status in ('pending','active','on_hold','inactive')),
  constraint vendors_name_check check (char_length(trim(name)) between 2 and 200)
);
create table public.vendor_contacts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  vendor_id uuid not null references public.vendors(id) on delete cascade, name text not null, title text, email text, phone text,
  is_primary boolean not null default false, archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint vendor_contacts_channel_check check (email is not null or phone is not null)
);
create table public.facilities (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  facility_code text not null, name text not null, facility_type text not null default 'warehouse', address jsonb not null default '{}'::jsonb,
  timezone text not null default 'America/Chicago', status text not null default 'active', archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint facilities_org_code_unique unique (organization_id, facility_code), constraint facilities_type_check check (facility_type in ('warehouse','yard','plant','office')),
  constraint facilities_status_check check (status in ('active','inactive'))
);
create table public.materials (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  sku text not null, description text not null, category text, unit text not null, cost numeric(14,4) not null default 0,
  status text not null default 'active', metadata jsonb not null default '{}'::jsonb, archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint materials_org_sku_unique unique (organization_id, sku), constraint materials_cost_check check (cost >= 0),
  constraint materials_status_check check (status in ('active','discontinued','inactive'))
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  order_number text not null, customer_id uuid not null references public.customers(id) on delete restrict,
  vendor_id uuid references public.vendors(id) on delete restrict, facility_id uuid not null references public.facilities(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict, priority text not null default 'normal', status text not null default 'draft',
  warehouse_status text not null default 'unreleased', requested_ship_date date, release_date timestamptz, notes text, current_revision_number integer not null default 0,
  archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint orders_org_number_unique unique (organization_id, order_number), constraint orders_priority_check check (priority in ('low','normal','high','urgent')),
  constraint orders_status_check check (status in ('draft','pending_approval','approved','released','in_progress','shipped','completed','cancelled')),
  constraint orders_warehouse_status_check check (warehouse_status in ('unreleased','released','picking','loaded','hold','stop_work','acknowledged','shipped','completed')),
  constraint orders_revision_number_check check (current_revision_number >= 0)
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete cascade, line_number integer not null, material_id uuid references public.materials(id) on delete restrict,
  description text not null, quantity numeric(14,4) not null, unit text not null, unit_price numeric(14,4) not null default 0, notes text,
  archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint order_items_order_line_unique unique (order_id, line_number), constraint order_items_line_check check (line_number > 0),
  constraint order_items_quantity_check check (quantity > 0), constraint order_items_price_check check (unit_price >= 0)
);
create table public.order_revisions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict, revision_number integer not null, reason text not null,
  requested_ship_date date, release_date timestamptz, notes text, created_by uuid not null references public.profiles(id) on delete restrict,
  approved_by uuid references public.profiles(id) on delete restrict, approved_at timestamptz, status text not null default 'pending', created_at timestamptz not null default now(),
  constraint order_revisions_order_number_unique unique (order_id, revision_number), constraint order_revisions_number_check check (revision_number > 0),
  constraint order_revisions_status_check check (status in ('draft','pending','approved','rejected','superseded')),
  constraint order_revisions_approval_check check ((status = 'approved' and approved_by is not null and approved_at is not null) or status <> 'approved')
);
create table public.revision_line_items (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  revision_id uuid not null references public.order_revisions(id) on delete restrict, source_order_item_id uuid references public.order_items(id) on delete set null,
  line_number integer not null, material_id uuid references public.materials(id) on delete restrict, description text not null,
  quantity numeric(14,4) not null, unit text not null, unit_price numeric(14,4) not null default 0, notes text, created_at timestamptz not null default now(),
  constraint revision_line_items_revision_line_unique unique (revision_id, line_number), constraint revision_line_items_line_check check (line_number > 0),
  constraint revision_line_items_quantity_check check (quantity > 0), constraint revision_line_items_price_check check (unit_price >= 0)
);
create table public.revision_differences (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  revision_id uuid not null references public.order_revisions(id) on delete restrict, difference_type text not null, line_number integer,
  field_name text, previous_value jsonb, current_value jsonb, created_at timestamptz not null default now(),
  constraint revision_differences_type_check check (difference_type in ('added_line','removed_line','changed_quantity','changed_material','changed_dates','changed_notes')),
  constraint revision_differences_field_check check (field_name is not null or line_number is not null)
);
create table public.approvals (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  revision_id uuid not null references public.order_revisions(id) on delete cascade, approver_id uuid not null references public.profiles(id) on delete restrict,
  sequence_number integer not null default 1, status text not null default 'pending', decision_at timestamptz, comments text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint approvals_revision_approver_unique unique (revision_id, approver_id), constraint approvals_sequence_check check (sequence_number > 0),
  constraint approvals_status_check check (status in ('pending','approved','rejected','escalated')),
  constraint approvals_decision_check check ((status = 'pending' and decision_at is null) or (status <> 'pending' and decision_at is not null))
);
create table public.warehouse_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict, facility_id uuid not null references public.facilities(id) on delete restrict,
  event_type text not null, notes text, occurred_at timestamptz not null default now(), created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(), constraint warehouse_events_type_check check (event_type in ('released','picking','loaded','hold','stop_work','acknowledged','shipped','completed'))
);
create table public.risk_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  order_id uuid references public.orders(id) on delete restrict, revision_id uuid references public.order_revisions(id) on delete restrict,
  severity text not null, reason text not null, status text not null default 'open', resolution text, resolved_by uuid references public.profiles(id) on delete restrict,
  resolved_at timestamptz, created_by uuid not null references public.profiles(id) on delete restrict, archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint risk_events_severity_check check (severity in ('low','medium','high','critical')),
  constraint risk_events_status_check check (status in ('open','monitoring','mitigated','resolved','accepted')),
  constraint risk_events_resolution_check check ((status = 'resolved' and resolution is not null and resolved_at is not null) or status <> 'resolved'),
  constraint risk_events_subject_check check (order_id is not null or revision_id is not null)
);
create table public.attachments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  entity_type text not null, entity_id uuid not null, file_name text not null, storage_path text not null, content_type text,
  byte_size bigint not null default 0, checksum text, metadata jsonb not null default '{}'::jsonb, uploaded_by uuid not null references public.profiles(id) on delete restrict,
  archived_at timestamptz, created_at timestamptz not null default now(), constraint attachments_size_check check (byte_size >= 0),
  constraint attachments_entity_type_check check (entity_type in ('customer','vendor','material','order','order_revision','warehouse_event','risk_event')),
  constraint attachments_storage_path_unique unique (organization_id, storage_path)
);
create table public.comments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  entity_type text not null, entity_id uuid not null, parent_id uuid references public.comments(id) on delete cascade,
  body text not null, created_by uuid not null references public.profiles(id) on delete restrict, edited_at timestamptz, archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint comments_body_check check (char_length(trim(body)) between 1 and 10000),
  constraint comments_entity_type_check check (entity_type in ('customer','vendor','material','order','order_revision','warehouse_event','risk_event'))
);
create table public.activity_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  entity_type text not null, entity_id uuid not null, event_type text not null, summary text not null, actor_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb, occurred_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete restrict,
  table_name text not null, record_id uuid not null, action text not null, actor_id uuid references public.profiles(id) on delete set null,
  old_data jsonb, new_data jsonb, occurred_at timestamptz not null default now(), transaction_id bigint not null default txid_current(),
  constraint audit_logs_action_check check (action in ('INSERT','UPDATE','DELETE'))
);

-- Every foreign key and common tenant/status access path is indexed.
create index customer_contacts_org_customer_idx on public.customer_contacts (organization_id, customer_id) where archived_at is null;
create unique index customer_contacts_one_primary_idx on public.customer_contacts (customer_id) where is_primary and archived_at is null;
create index customers_org_status_idx on public.customers (organization_id, status) where archived_at is null;
create index customers_created_by_idx on public.customers (created_by);
create index vendor_contacts_org_vendor_idx on public.vendor_contacts (organization_id, vendor_id) where archived_at is null;
create unique index vendor_contacts_one_primary_idx on public.vendor_contacts (vendor_id) where is_primary and archived_at is null;
create index vendors_org_status_idx on public.vendors (organization_id, status) where archived_at is null;
create index vendors_created_by_idx on public.vendors (created_by);
create index facilities_org_status_idx on public.facilities (organization_id, status) where archived_at is null;
create index materials_org_status_idx on public.materials (organization_id, status) where archived_at is null;
create index orders_org_status_created_idx on public.orders (organization_id, status, created_at desc) where archived_at is null;
create index orders_customer_id_idx on public.orders (customer_id); create index orders_vendor_id_idx on public.orders (vendor_id);
create index orders_facility_id_idx on public.orders (facility_id); create index orders_created_by_idx on public.orders (created_by);
create index order_items_org_order_idx on public.order_items (organization_id, order_id) where archived_at is null;
create index order_items_material_id_idx on public.order_items (material_id);
create index order_revisions_org_order_idx on public.order_revisions (organization_id, order_id, revision_number desc);
create index order_revisions_created_by_idx on public.order_revisions (created_by); create index order_revisions_approved_by_idx on public.order_revisions (approved_by);
create index revision_line_items_org_revision_idx on public.revision_line_items (organization_id, revision_id);
create index revision_line_items_source_idx on public.revision_line_items (source_order_item_id); create index revision_line_items_material_idx on public.revision_line_items (material_id);
create index revision_differences_org_revision_idx on public.revision_differences (organization_id, revision_id);
create index approvals_org_revision_status_idx on public.approvals (organization_id, revision_id, status); create index approvals_approver_id_idx on public.approvals (approver_id);
create index warehouse_events_org_order_time_idx on public.warehouse_events (organization_id, order_id, occurred_at desc);
create index warehouse_events_facility_id_idx on public.warehouse_events (facility_id); create index warehouse_events_created_by_idx on public.warehouse_events (created_by);
create index risk_events_org_status_severity_idx on public.risk_events (organization_id, status, severity) where archived_at is null;
create index risk_events_order_id_idx on public.risk_events (order_id); create index risk_events_revision_id_idx on public.risk_events (revision_id);
create index risk_events_resolved_by_idx on public.risk_events (resolved_by); create index risk_events_created_by_idx on public.risk_events (created_by);
create index attachments_org_entity_idx on public.attachments (organization_id, entity_type, entity_id) where archived_at is null;
create index attachments_uploaded_by_idx on public.attachments (uploaded_by);
create index comments_org_entity_time_idx on public.comments (organization_id, entity_type, entity_id, created_at) where archived_at is null;
create index comments_parent_id_idx on public.comments (parent_id); create index comments_created_by_idx on public.comments (created_by);
create index activity_events_org_entity_time_idx on public.activity_events (organization_id, entity_type, entity_id, occurred_at desc);
create index activity_events_actor_id_idx on public.activity_events (actor_id);
create index audit_logs_org_record_time_idx on public.audit_logs (organization_id, table_name, record_id, occurred_at desc);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id);

create or replace function private.can_write_operations(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_organization_role(target_organization_id, array['owner','administrator','operations_manager','order_coordinator','warehouse','finance']::text[]);
$$;
revoke all on function private.can_write_operations(uuid) from public, anon;
grant execute on function private.can_write_operations(uuid) to authenticated;

create or replace function private.enforce_row_organization()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare parent_org uuid;
begin
  if tg_table_name = 'orders' then
    if not exists (select 1 from public.customers where id = new.customer_id and organization_id = new.organization_id)
      or not exists (select 1 from public.facilities where id = new.facility_id and organization_id = new.organization_id)
      or (new.vendor_id is not null and not exists (select 1 from public.vendors where id = new.vendor_id and organization_id = new.organization_id))
    then raise exception 'Cross-organization order relationship rejected.' using errcode = '23514'; end if;
    return new;
  elsif tg_table_name = 'risk_events' then
    if (new.order_id is not null and not exists (select 1 from public.orders where id = new.order_id and organization_id = new.organization_id))
      or (new.revision_id is not null and not exists (select 1 from public.order_revisions where id = new.revision_id and organization_id = new.organization_id))
    then raise exception 'Cross-organization risk relationship rejected.' using errcode = '23514'; end if;
    return new;
  elsif tg_table_name = 'customer_contacts' then select organization_id into parent_org from public.customers where id = new.customer_id;
  elsif tg_table_name = 'vendor_contacts' then select organization_id into parent_org from public.vendors where id = new.vendor_id;
  elsif tg_table_name = 'order_items' then select organization_id into parent_org from public.orders where id = new.order_id;
  elsif tg_table_name = 'order_revisions' then select organization_id into parent_org from public.orders where id = new.order_id;
  elsif tg_table_name in ('revision_line_items','revision_differences','approvals') then select organization_id into parent_org from public.order_revisions where id = new.revision_id;
  elsif tg_table_name = 'warehouse_events' then
    select organization_id into parent_org from public.orders where id = new.order_id;
    if not exists (select 1 from public.facilities where id = new.facility_id and organization_id = new.organization_id)
    then raise exception 'Cross-organization facility relationship rejected.' using errcode = '23514'; end if;
  else return new;
  end if;
  if parent_org is null or parent_org <> new.organization_id then raise exception 'Cross-organization relationship rejected.' using errcode = '23514'; end if;
  return new;
end; $$;
revoke all on function private.enforce_row_organization() from public, anon, authenticated;

create or replace function private.protect_revision_history()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'DELETE' then raise exception 'Revision history is immutable.' using errcode = '55000'; end if;
  if tg_table_name = 'order_revisions' and row(
    old.organization_id, old.order_id, old.revision_number, old.reason, old.requested_ship_date, old.release_date, old.notes, old.created_by, old.created_at
  ) is distinct from row(
    new.organization_id, new.order_id, new.revision_number, new.reason, new.requested_ship_date, new.release_date, new.notes, new.created_by, new.created_at
  ) then raise exception 'Revision content is immutable.' using errcode = '55000'; end if;
  if tg_table_name <> 'order_revisions' then raise exception 'Revision line and difference records are immutable.' using errcode = '55000'; end if;
  return new;
end; $$;
revoke all on function private.protect_revision_history() from public, anon, authenticated;

create or replace function private.protect_audit_log()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin raise exception 'Audit logs are immutable.' using errcode = '55000'; end; $$;
revoke all on function private.protect_audit_log() from public, anon, authenticated;

create or replace function private.capture_audit_log()
returns trigger language plpgsql security definer set search_path = '' as $$
declare row_data jsonb; org_id uuid; rec_id uuid;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  org_id := (row_data ->> 'organization_id')::uuid; rec_id := (row_data ->> 'id')::uuid;
  insert into public.audit_logs (organization_id, table_name, record_id, action, actor_id, old_data, new_data)
  values (org_id, tg_table_name, rec_id, tg_op, (select auth.uid()), case when tg_op <> 'INSERT' then to_jsonb(old) end, case when tg_op <> 'DELETE' then to_jsonb(new) end);
  return case when tg_op = 'DELETE' then old else new end;
end; $$;
revoke all on function private.capture_audit_log() from public, anon, authenticated;

-- Keep updated_at authoritative and enforce tenant ownership on child rows.
do $$ declare table_name text; begin
  foreach table_name in array array['customers','customer_contacts','vendors','vendor_contacts','facilities','materials','orders','order_items','approvals','risk_events','comments'] loop
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name, table_name);
  end loop;
  foreach table_name in array array['customers','vendors','orders','customer_contacts','vendor_contacts','order_items','order_revisions','revision_line_items','revision_differences','approvals','warehouse_events','risk_events'] loop
    execute format('create trigger %I_enforce_organization before insert or update on public.%I for each row execute function private.enforce_row_organization()', table_name, table_name);
  end loop;
  foreach table_name in array array['customers','customer_contacts','vendors','vendor_contacts','facilities','materials','orders','order_items','order_revisions','revision_line_items','revision_differences','approvals','warehouse_events','risk_events','attachments','comments','activity_events'] loop
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function private.capture_audit_log()', table_name, table_name);
  end loop;
end $$;
create trigger order_revisions_immutable before update or delete on public.order_revisions for each row execute function private.protect_revision_history();
create trigger revision_line_items_immutable before update or delete on public.revision_line_items for each row execute function private.protect_revision_history();
create trigger revision_differences_immutable before update or delete on public.revision_differences for each row execute function private.protect_revision_history();
create trigger audit_logs_immutable before update or delete on public.audit_logs for each row execute function private.protect_audit_log();

-- RLS is applied uniformly: members read; operational roles write; audit is append-only through triggers.
do $$ declare table_name text; begin
  foreach table_name in array array['customers','customer_contacts','vendors','vendor_contacts','facilities','materials','orders','order_items','order_revisions','revision_line_items','revision_differences','approvals','warehouse_events','risk_events','attachments','comments','activity_events','audit_logs'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy %I on public.%I for select to authenticated using ((select private.is_organization_member(organization_id)))', table_name || '_select_member', table_name);
  end loop;
  foreach table_name in array array['customers','customer_contacts','vendors','vendor_contacts','facilities','materials','orders','order_items','order_revisions','revision_line_items','revision_differences','approvals','warehouse_events','risk_events','attachments','comments','activity_events'] loop
    execute format('create policy %I on public.%I for insert to authenticated with check ((select private.can_write_operations(organization_id)))', table_name || '_insert_operator', table_name);
  end loop;
  foreach table_name in array array['customers','customer_contacts','vendors','vendor_contacts','facilities','materials','orders','order_items','order_revisions','approvals','risk_events','attachments','comments'] loop
    execute format('create policy %I on public.%I for update to authenticated using ((select private.can_write_operations(organization_id))) with check ((select private.can_write_operations(organization_id)))', table_name || '_update_operator', table_name);
  end loop;
  foreach table_name in array array['customers','customer_contacts','vendors','vendor_contacts','facilities','materials','orders','order_items','approvals','risk_events','attachments','comments'] loop
    execute format('create policy %I on public.%I for delete to authenticated using ((select private.can_write_operations(organization_id)))', table_name || '_delete_operator', table_name);
  end loop;
end $$;

revoke all on public.customers, public.customer_contacts, public.vendors, public.vendor_contacts, public.facilities, public.materials,
  public.orders, public.order_items, public.order_revisions, public.revision_line_items, public.revision_differences, public.approvals,
  public.warehouse_events, public.risk_events, public.attachments, public.comments, public.activity_events, public.audit_logs from anon, authenticated;
grant select, insert, update, delete on public.customers, public.customer_contacts, public.vendors, public.vendor_contacts, public.facilities, public.materials,
  public.orders, public.order_items, public.approvals, public.risk_events, public.attachments, public.comments to authenticated;
grant select, insert, update on public.order_revisions to authenticated;
grant select, insert on public.revision_line_items, public.revision_differences, public.warehouse_events, public.activity_events to authenticated;
grant select on public.audit_logs to authenticated;

comment on table public.order_revisions is 'Immutable customer order revision header; only approval state may transition.';
comment on table public.revision_line_items is 'Immutable complete line-item snapshot for an order revision.';
comment on table public.revision_differences is 'Stored deterministic differences between consecutive order revisions.';
comment on table public.audit_logs is 'Database-generated immutable row-change audit history.';

-- Reproducible Redwood Contractors industrial demonstration dataset.
do $$
declare
  redwood uuid := '20000000-0000-4000-8000-000000000001';
  owner_profile uuid;
begin
  select id into owner_profile from public.profiles where organization_id = redwood order by created_at limit 1;
  if owner_profile is null then raise exception 'Redwood Contractors requires at least one seeded profile.'; end if;

  insert into public.customers (id, organization_id, customer_code, name, status, billing_address, shipping_address, billing_terms, notes, created_by) values
    ('30000000-0000-4000-8000-000000000001', redwood, 'CUS-1001', 'Great Lakes Steel Works', 'active', '{"city":"Gary","state":"IN","postal_code":"46402"}', '{"city":"Gary","state":"IN","postal_code":"46402","dock":"North Receiving"}', 'Net 30', 'Requires mill certificates with every shipment.', owner_profile),
    ('30000000-0000-4000-8000-000000000002', redwood, 'CUS-1002', 'Prairie Energy Services', 'active', '{"city":"Tulsa","state":"OK","postal_code":"74103"}', '{"city":"Cushing","state":"OK","postal_code":"74023","gate":"Gate 4"}', 'Net 45', 'Pipeline maintenance program customer.', owner_profile);
  insert into public.customer_contacts (id, organization_id, customer_id, name, title, email, phone, is_primary) values
    ('31000000-0000-4000-8000-000000000001', redwood, '30000000-0000-4000-8000-000000000001', 'Dana Mercer', 'Maintenance Procurement Lead', 'dana.mercer@greatlakes.example', '+1-219-555-0140', true),
    ('31000000-0000-4000-8000-000000000002', redwood, '30000000-0000-4000-8000-000000000002', 'Eli Warren', 'Field Operations Buyer', 'eli.warren@prairieenergy.example', '+1-918-555-0162', true);
  insert into public.vendors (id, organization_id, vendor_code, name, terms, status, notes, created_by) values
    ('32000000-0000-4000-8000-000000000001', redwood, 'VEN-2001', 'Atlas Industrial Supply', 'Net 30, FOB origin', 'active', 'Primary carbon-steel fittings supplier.', owner_profile),
    ('32000000-0000-4000-8000-000000000002', redwood, 'VEN-2002', 'Northstar Valve & Controls', 'Net 45, freight prepaid', 'active', 'Approved valve and actuator source.', owner_profile);
  insert into public.vendor_contacts (id, organization_id, vendor_id, name, title, email, phone, is_primary) values
    ('33000000-0000-4000-8000-000000000001', redwood, '32000000-0000-4000-8000-000000000001', 'Marisol Kent', 'Account Manager', 'marisol.kent@atlasindustrial.example', '+1-312-555-0188', true),
    ('33000000-0000-4000-8000-000000000002', redwood, '32000000-0000-4000-8000-000000000002', 'Jon Bell', 'Regional Sales Engineer', 'jon.bell@northstarvalve.example', '+1-414-555-0124', true);
  insert into public.facilities (id, organization_id, facility_code, name, facility_type, address, timezone, status) values
    ('34000000-0000-4000-8000-000000000001', redwood, 'WH-CHI', 'Chicago Central Warehouse', 'warehouse', '{"address1":"4800 S Central Ave","city":"Chicago","state":"IL","postal_code":"60638"}', 'America/Chicago', 'active'),
    ('34000000-0000-4000-8000-000000000002', redwood, 'YD-TUL', 'Tulsa Project Yard', 'yard', '{"address1":"2100 N 129th E Ave","city":"Tulsa","state":"OK","postal_code":"74116"}', 'America/Chicago', 'active');
  insert into public.materials (id, organization_id, sku, description, category, unit, cost, status) values
    ('35000000-0000-4000-8000-000000000001', redwood, 'PIPE-CS-6-S40', '6 in carbon steel pipe, ASTM A106 Grade B, Schedule 40', 'Pipe', 'FT', 28.7500, 'active'),
    ('35000000-0000-4000-8000-000000000002', redwood, 'ELBOW-CS-6-90', '6 in carbon steel 90-degree long-radius elbow', 'Fittings', 'EA', 84.2500, 'active'),
    ('35000000-0000-4000-8000-000000000003', redwood, 'VALVE-GATE-6-150', '6 in Class 150 flanged gate valve', 'Valves', 'EA', 1185.0000, 'active'),
    ('35000000-0000-4000-8000-000000000004', redwood, 'GASKET-6-150-RF', '6 in Class 150 raised-face spiral wound gasket', 'Gaskets', 'EA', 19.6000, 'active');
  insert into public.orders (id, organization_id, order_number, customer_id, vendor_id, facility_id, created_by, priority, status, warehouse_status, requested_ship_date, release_date, notes, current_revision_number) values
    ('36000000-0000-4000-8000-000000000001', redwood, 'KOV-2026-00418', '30000000-0000-4000-8000-000000000001', '32000000-0000-4000-8000-000000000001', '34000000-0000-4000-8000-000000000001', owner_profile, 'high', 'released', 'picking', current_date + 7, now() - interval '4 hours', 'Mill outage delivery; staged by heat number.', 2),
    ('36000000-0000-4000-8000-000000000002', redwood, 'KOV-2026-00419', '30000000-0000-4000-8000-000000000002', '32000000-0000-4000-8000-000000000002', '34000000-0000-4000-8000-000000000002', owner_profile, 'urgent', 'pending_approval', 'hold', current_date + 3, null, 'Awaiting customer confirmation of valve trim.', 1);
  insert into public.order_items (id, organization_id, order_id, line_number, material_id, description, quantity, unit, unit_price, notes) values
    ('37000000-0000-4000-8000-000000000001', redwood, '36000000-0000-4000-8000-000000000001', 1, '35000000-0000-4000-8000-000000000001', '6 in carbon steel pipe, Sch 40', 240, 'FT', 39.7500, 'Cut into 20-foot lengths.'),
    ('37000000-0000-4000-8000-000000000002', redwood, '36000000-0000-4000-8000-000000000001', 2, '35000000-0000-4000-8000-000000000002', '6 in LR 90 elbow', 12, 'EA', 121.5000, null),
    ('37000000-0000-4000-8000-000000000003', redwood, '36000000-0000-4000-8000-000000000002', 1, '35000000-0000-4000-8000-000000000003', '6 in Class 150 gate valve', 4, 'EA', 1540.0000, 'Confirm 316SS trim before release.'),
    ('37000000-0000-4000-8000-000000000004', redwood, '36000000-0000-4000-8000-000000000002', 2, '35000000-0000-4000-8000-000000000004', '6 in Class 150 spiral wound gasket', 16, 'EA', 29.4000, null);
  insert into public.order_revisions (id, organization_id, order_id, revision_number, reason, requested_ship_date, notes, created_by, approved_by, approved_at, status) values
    ('38000000-0000-4000-8000-000000000001', redwood, '36000000-0000-4000-8000-000000000001', 1, 'Initial customer release', current_date + 9, 'Original outage scope.', owner_profile, owner_profile, now() - interval '2 days', 'approved'),
    ('38000000-0000-4000-8000-000000000002', redwood, '36000000-0000-4000-8000-000000000001', 2, 'Customer accelerated outage date and added elbows', current_date + 7, 'Expedite lines one and two.', owner_profile, owner_profile, now() - interval '6 hours', 'approved'),
    ('38000000-0000-4000-8000-000000000003', redwood, '36000000-0000-4000-8000-000000000002', 1, 'Initial valve package', current_date + 3, 'Trim confirmation pending.', owner_profile, null, null, 'pending');
  insert into public.revision_line_items (id, organization_id, revision_id, source_order_item_id, line_number, material_id, description, quantity, unit, unit_price, notes) values
    ('39000000-0000-4000-8000-000000000001', redwood, '38000000-0000-4000-8000-000000000001', '37000000-0000-4000-8000-000000000001', 1, '35000000-0000-4000-8000-000000000001', '6 in carbon steel pipe, Sch 40', 240, 'FT', 39.7500, 'Cut into 20-foot lengths.'),
    ('39000000-0000-4000-8000-000000000002', redwood, '38000000-0000-4000-8000-000000000001', '37000000-0000-4000-8000-000000000002', 2, '35000000-0000-4000-8000-000000000002', '6 in LR 90 elbow', 8, 'EA', 121.5000, null),
    ('39000000-0000-4000-8000-000000000003', redwood, '38000000-0000-4000-8000-000000000002', '37000000-0000-4000-8000-000000000001', 1, '35000000-0000-4000-8000-000000000001', '6 in carbon steel pipe, Sch 40', 240, 'FT', 39.7500, 'Cut into 20-foot lengths.'),
    ('39000000-0000-4000-8000-000000000004', redwood, '38000000-0000-4000-8000-000000000002', '37000000-0000-4000-8000-000000000002', 2, '35000000-0000-4000-8000-000000000002', '6 in LR 90 elbow', 12, 'EA', 121.5000, null),
    ('39000000-0000-4000-8000-000000000005', redwood, '38000000-0000-4000-8000-000000000003', '37000000-0000-4000-8000-000000000003', 1, '35000000-0000-4000-8000-000000000003', '6 in Class 150 gate valve', 4, 'EA', 1540.0000, 'Confirm 316SS trim before release.'),
    ('39000000-0000-4000-8000-000000000006', redwood, '38000000-0000-4000-8000-000000000003', '37000000-0000-4000-8000-000000000004', 2, '35000000-0000-4000-8000-000000000004', '6 in Class 150 spiral wound gasket', 16, 'EA', 29.4000, null);
  insert into public.revision_differences (id, organization_id, revision_id, difference_type, line_number, field_name, previous_value, current_value) values
    ('3a000000-0000-4000-8000-000000000001', redwood, '38000000-0000-4000-8000-000000000002', 'changed_quantity', 2, 'quantity', '8', '12'),
    ('3a000000-0000-4000-8000-000000000002', redwood, '38000000-0000-4000-8000-000000000002', 'changed_dates', null, 'requested_ship_date', to_jsonb((current_date + 9)::text), to_jsonb((current_date + 7)::text));
  insert into public.approvals (id, organization_id, revision_id, approver_id, sequence_number, status, decision_at, comments) values
    ('3b000000-0000-4000-8000-000000000001', redwood, '38000000-0000-4000-8000-000000000002', owner_profile, 1, 'approved', now() - interval '6 hours', 'Approved for accelerated warehouse release.'),
    ('3b000000-0000-4000-8000-000000000002', redwood, '38000000-0000-4000-8000-000000000003', owner_profile, 1, 'pending', null, 'Awaiting trim confirmation.');
  insert into public.warehouse_events (id, organization_id, order_id, facility_id, event_type, notes, occurred_at, created_by) values
    ('3c000000-0000-4000-8000-000000000001', redwood, '36000000-0000-4000-8000-000000000001', '34000000-0000-4000-8000-000000000001', 'released', 'Released to warehouse wave 26-0719-B.', now() - interval '4 hours', owner_profile),
    ('3c000000-0000-4000-8000-000000000002', redwood, '36000000-0000-4000-8000-000000000001', '34000000-0000-4000-8000-000000000001', 'picking', 'Pipe staged in bay C12; fittings in progress.', now() - interval '2 hours', owner_profile),
    ('3c000000-0000-4000-8000-000000000003', redwood, '36000000-0000-4000-8000-000000000002', '34000000-0000-4000-8000-000000000002', 'hold', 'Hold pending approved valve trim.', now() - interval '1 hour', owner_profile);
  insert into public.risk_events (id, organization_id, order_id, revision_id, severity, reason, status, resolution, resolved_by, resolved_at, created_by) values
    ('3d000000-0000-4000-8000-000000000001', redwood, '36000000-0000-4000-8000-000000000001', '38000000-0000-4000-8000-000000000002', 'high', 'Accelerated ship date compresses inspection window.', 'monitoring', null, null, null, owner_profile),
    ('3d000000-0000-4000-8000-000000000002', redwood, '36000000-0000-4000-8000-000000000002', '38000000-0000-4000-8000-000000000003', 'critical', 'Valve trim is unconfirmed and may not meet service specification.', 'open', null, null, null, owner_profile);
  insert into public.comments (id, organization_id, entity_type, entity_id, body, created_by) values
    ('3e000000-0000-4000-8000-000000000001', redwood, 'order', '36000000-0000-4000-8000-000000000001', 'Customer confirmed outage crane window starts at 06:00 Monday.', owner_profile),
    ('3e000000-0000-4000-8000-000000000002', redwood, 'risk_event', '3d000000-0000-4000-8000-000000000002', 'Do not release until engineering confirms trim and pressure class.', owner_profile);
  insert into public.activity_events (id, organization_id, entity_type, entity_id, event_type, summary, actor_id, metadata, occurred_at) values
    ('3f000000-0000-4000-8000-000000000001', redwood, 'order', '36000000-0000-4000-8000-000000000001', 'revision_approved', 'Revision 2 approved and released to Chicago Central Warehouse.', owner_profile, '{"revision_number":2}', now() - interval '4 hours'),
    ('3f000000-0000-4000-8000-000000000002', redwood, 'order', '36000000-0000-4000-8000-000000000001', 'warehouse_picking', 'Warehouse began picking material for the outage order.', owner_profile, '{"facility_code":"WH-CHI"}', now() - interval '2 hours'),
    ('3f000000-0000-4000-8000-000000000003', redwood, 'order', '36000000-0000-4000-8000-000000000002', 'risk_created', 'Critical material-specification risk opened.', owner_profile, '{"severity":"critical"}', now() - interval '1 hour');
end $$;
