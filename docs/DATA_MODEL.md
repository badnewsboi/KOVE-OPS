# Industrial data model

Every operational row carries `organization_id`; RLS resolves it through active, accepted membership. Mutable master and workflow records use `archived_at` for recoverable removal. Event streams and audit history are append-only.

| Area | Tables | Behavior |
|---|---|---|
| Parties | `customers`, `customer_contacts`, `vendors`, `vendor_contacts` | Organization-unique codes, one active primary contact, addresses, terms |
| Network | `facilities`, `materials` | Multiple warehouses/yards/plants and future-inventory-ready material metadata |
| Orders | `orders`, `order_items` | Customer, vendor, facility, creator, dates, priority, operational state |
| Revisions | `order_revisions`, `revision_line_items`, `revision_differences` | Immutable numbered snapshots and stored field/line differences |
| Decisions | `approvals`, `risk_events` | Multiple sequenced approvers; severity, mitigation, resolution |
| Execution | `warehouse_events` | Released-through-completed event stream |
| Collaboration | `comments`, `attachments` | Thread-ready discussion and storage-agnostic file metadata |
| History | `activity_events`, `audit_logs` | Human timeline and immutable before/after audit |

Difference types are `added_line`, `removed_line`, `changed_quantity`, `changed_material`, `changed_dates`, and `changed_notes`. M2 stores deterministic differences and deliberately contains no AI comparison.
