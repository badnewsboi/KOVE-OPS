# Role-based access control

| Role | Identity-foundation authority |
| --- | --- |
| Owner | Full organization governance; may assign Owner or Administrator |
| Administrator | Manage organization details and non-owner memberships |
| Operations Manager | Read organization identity context |
| Order Coordinator | Read organization identity context |
| Warehouse | Read organization identity context |
| Finance | Read organization identity context |
| Viewer | Read-only organization identity context |

Authorization is enforced in PostgreSQL, not inferred from frontend state. RLS helper functions live in the unexposed `private` schema, use fixed empty search paths, validate `auth.uid()`, and execute indexed membership lookups.

Reusable server helpers are exported from `auth/authorization.ts`: `isOrganizationMember`, `hasRole`, `isOwner`, `isAdministrator`, and `canManageUsers`.

Anonymous roles have no table privileges. Authenticated users may read only organizations, profiles, and memberships connected to an active accepted membership. Membership writes require Owner or Administrator authority; only Owners can assign the Owner role.
