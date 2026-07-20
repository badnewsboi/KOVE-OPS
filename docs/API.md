# Industrial platform API

Base path: `/api/platform`. Requests require a Supabase session and remain subject to organization RLS.

Resources: `customers`, `customer_contacts`, `vendors`, `vendor_contacts`, `facilities`, `materials`, `orders`, `order_items`, `order_revisions`, `revision_line_items`, `revision_differences`, `approvals`, `warehouse_events`, `risk_events`, `attachments`, `comments`, and `activity_events`.

| Method | Path | Behavior |
|---|---|---|
| `GET` | `/:resource?organization_id=:id` | Paginated tenant list; `limit`, `offset`, `include_archived`, equality filters |
| `POST` | `/:resource` | Validated create |
| `GET` | `/:resource/:id?organization_id=:id` | Tenant-scoped detail |
| `PATCH` | `/:resource/:id?organization_id=:id` | Validated update; append-only resources return `409` |
| `DELETE` | `/:resource/:id?organization_id=:id` | Soft archive where supported |
| `GET` | `/audit-logs?organization_id=:id` | Read-only immutable audit history |

Success: `{ "data": ..., "error": null }`. Failure: `{ "data": null, "error": { "code": "...", "message": "...", "details": ... } }`.
