# Authentication

KOVE OPS uses Supabase Auth with email/password authentication and the PKCE flow supplied by `@supabase/ssr`. Access and refresh tokens are persisted in cookies so Server Components and route handlers receive the same identity as the browser.

## Routes

- `/auth/sign-in` authenticates an existing user.
- `/auth/sign-up` creates a user, profile, organization, and owner membership.
- `/auth/forgot-password` requests a recovery email.
- `/auth/reset-password` accepts a new password after recovery.
- `/auth/callback` exchanges PKCE authorization codes for sessions.
- `POST /auth/sign-out` revokes the local session and clears auth cookies.

The root workspace is protected twice: `proxy.ts` refreshes and validates the cookie session before routing, and `requireUser()` validates claims again inside the server-rendered page. Authenticated responses are marked private and non-cacheable.

## Automatic provisioning

The private `handle_new_auth_user` database trigger runs after an Auth user is created. Normal signups receive a new organization and the Owner role. Trusted admin-created users may provide `organization_id` and `role_key` in `app_metadata`; authorization never uses user-editable metadata.

## Secrets

The browser receives only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Secret/service-role credentials are accepted only by the optional server-side demo seed script and must remain in ignored `.env.local` files.
