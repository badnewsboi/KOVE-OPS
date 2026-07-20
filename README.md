# KOVE OPS

KOVE OPS is a responsive operations command center for maintenance, asset health, inventory risk, and frontline team coordination. The application is implemented as a production-ready Next.js 16 interface using React 19 and TypeScript.

## Included experience

- Operational overview with live performance metrics
- Searchable, prioritized work-order queue
- Assignee, urgency, due-time, and status context
- Operational health score and KPI progress
- Live team activity feed
- Site, profile, notification, reports, and settings interactions
- Responsive desktop, tablet, and mobile navigation
- Keyboard-accessible native controls and visible interaction feedback

All displayed data is realistic demo data held locally in the page component. No account, database, or third-party service is required.

## Requirements

- Node.js 22.13 or newer
- npm 10 or newer

## Local development

```bash
npm install
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
```

## Project structure

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

## Data and privacy

The current build has no analytics, cookies, remote APIs, or persistence. Search and interface state remain in browser memory and reset on refresh.
