-- Cover foreign keys whose existing tenant-composite indexes do not lead with the referenced column.
create index revision_differences_revision_id_idx on public.revision_differences (revision_id);
create index warehouse_events_order_id_idx on public.warehouse_events (order_id);
