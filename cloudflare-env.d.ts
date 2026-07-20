/** Runtime bindings exposed by the existing Cloudflare worker configuration. */
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
  }
}
