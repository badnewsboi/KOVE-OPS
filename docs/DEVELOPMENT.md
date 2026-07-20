# Identity development setup

## Environment

Copy `.env.example` to `.env.local` and provide the project URL and publishable key. Never place a secret key in a `NEXT_PUBLIC_` variable.

## Commands

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run test:platform:live
npm run dev
```

## Migration strategy

Create migrations with `npx supabase migration new <name>`. Validate SQL in a rolled-back transaction, review security and performance advisors, apply once, and commit the matching migration file. Never edit a migration that has been applied to a shared environment; create a corrective migration instead.

## Demo users

Redwood Contractors and all seven roles are created by the migration. To provision authenticated demo users, add `SUPABASE_SECRET_KEY` and a strong `KOVE_DEMO_PASSWORD` to `.env.local`, then run `npm run seed:demo`. The script uses the Auth Admin API, is idempotent by email, and never prints the password.

## Live platform verification

Set `KOVE_DEMO_PASSWORD` only in the invoking process or ignored `.env.local`, then run `npm run test:platform:live`. It verifies tenant reads, owner customer CRUD, immutable revision rejection, audit capture, and viewer write denial. The temporary customer is deleted in `finally`; audit records remain immutable by design.
