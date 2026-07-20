# Architecture

## Runtime

The application uses Next.js-compatible routing through Vinext and Vite, producing a Cloudflare Worker-compatible ESM build. The interface is a client component because search, navigation, responsive menu state, and notifications are interactive.

Authentication is request-scoped through Supabase SSR. The root route validates claims on the server, while `proxy.ts` refreshes cookie sessions and rejects unauthenticated requests before protected content renders. PostgreSQL RLS is the final authorization boundary.

## Industrial platform boundary

Route handlers validate transport input and return a stable `{ data, error }` envelope. They delegate persistence to repositories, which always include the organization filter even though RLS independently enforces the tenant boundary. PostgreSQL owns referential integrity, state constraints, explicit Data API grants, immutable revision snapshots, and automatic audit capture.

Mutable `orders` represent current operational state. `order_revisions`, `revision_line_items`, and `revision_differences` form the permanent customer-change record. Revision headers allow approval-state transitions only; snapshot content cannot be overwritten or deleted.

## Source organization

- `app/layout.tsx` owns global metadata, icons, and the HTML document.
- `app/page.tsx` owns the dashboard model, rendering, filtering, and ephemeral UI state.
- `app/globals.css` owns product tokens, layout, components, and responsive breakpoints.
- `auth/` owns server identity and reusable authorization helpers.
- `lib/supabase/` owns browser, server, environment, and proxy clients.
- `supabase/migrations/` owns the versioned production database schema.
- `.openai/hosting.json` declares that the application currently needs neither D1 nor R2.

## State and data

Demo work orders and metrics are immutable module-level data. UI state is local React state. No information is transmitted or persisted. A production integration can replace these constants with server-fetched domain records without changing the component hierarchy.

## Responsive strategy

The desktop layout uses a fixed navigation rail and a fluid content surface. Below 1100px, operational detail panels stack and the work queue reduces columns. Below 760px, navigation becomes an overlay, metrics use compact cards, and the primary action becomes icon-first.

## Extension points

- Add route segments for work-order, asset, inventory, and team detail.
- Connect server components or route handlers to an operations API.
- Add durable persistence with D1 or another supported datastore.
- Replace ephemeral feedback with workflow dialogs and validated forms.
