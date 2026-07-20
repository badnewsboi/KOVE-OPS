"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const { data, error } = await createClient().auth.signUp({
      email: String(form.get("email")), password: String(form.get("password")),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: {
        first_name: String(form.get("first_name")), last_name: String(form.get("last_name")), organization_name: String(form.get("organization_name")),
      } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.session) window.location.assign("/");
    else { setMessage("Check your email to confirm your account."); setLoading(false); }
  }
  return <form className="auth-form" onSubmit={submit}>
    <div className="auth-split"><label>First name<input name="first_name" autoComplete="given-name" required /></label><label>Last name<input name="last_name" autoComplete="family-name" required /></label></div>
    <label>Organization<input name="organization_name" autoComplete="organization" required minLength={2} /></label>
    <label>Email<input name="email" type="email" autoComplete="email" required /></label>
    <label>Password<input name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}
    <button disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
  </form>;
}
