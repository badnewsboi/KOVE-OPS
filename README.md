# KOVE OPS

KOVE OPS is a responsive operations command center for maintenance, asset health, inventory risk, and frontline team coordination. The application is implemented as a production-ready Next.js 16 interface using React 19 and TypeScript.

The M1.1 platform foundation uses Supabase Auth and PostgreSQL RLS to provide cookie-based sessions, organization isolation, profiles, memberships, and server-enforced RBAC.

The M2 industrial data platform adds tenant-isolated customers, vendors, facilities, materials, orders, immutable revisions, approvals, warehouse execution, risk, collaboration, attachments, activity, and audit history behind the existing dashboard.

## Included experience

- Operational overview with live performance metrics
- Searchable, prioritized work-order queue
- Assignee, urgency, due-time, and status context
- Operational health score and KPI progress
- Live team activity feed
- Site, profile, notification, reports, and settings interactions
- Responsive desktop, tablet, and mobile navigation
- Keyboard-accessible native controls and visible interaction feedback

The dashboard retains its established demo presentation, while authentication and industrial records persist securely in Supabase. A provisioned account and local Supabase environment configuration are required.

## Requirements

- Node.js 22.13 or newer
- npm 10 or newer

## Local development

```bash
npm install
npm run typecheck
npm run dev
```

Open the local URL printed by the development server. Changes under `app/` are reflected automatically.

## Production build

```bash
npm run build
npm run start
```

## Quality checks

```bash
npm run lint
npm test
npm run test:platform:live
```

## Project structure

Platform references: [data model](docs/DATA_MODEL.md), [API contract](docs/API.md), and [database ERD](docs/DATABASE.md).

```text
app/
  globals.css       Responsive product styling and design tokens
  layout.tsx        Root HTML shell and product metadata
  page.tsx          KOVE OPS dashboard and interactions
public/             Browser and application assets
tests/              Rendered output checks
worker/             Cloudflare-compatible runtime entry
.openai/             Hosting capability declaration
```

Additional product and implementation notes are available in [`docs/PRODUCT.md`](docs/PRODUCT.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

Identity documentation is available in [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md), [`docs/DATABASE.md`](docs/DATABASE.md), [`docs/RBAC.md`](docs/RBAC.md), and [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md).

## Data and privacy

The application uses secure Supabase session cookies and the Supabase Data API. Operational records persist behind organization-scoped RLS. No analytics, AI services, or email integrations are included.
