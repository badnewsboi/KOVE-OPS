"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget); const password = String(form.get("password"));
    if (password !== String(form.get("confirm"))) { setError("Passwords do not match."); setLoading(false); return; }
    const { error } = await createClient().auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    window.location.assign("/");
  }
  return <form className="auth-form" onSubmit={submit}><label>New password<input name="password" type="password" autoComplete="new-password" required minLength={8} /></label><label>Confirm password<input name="confirm" type="password" autoComplete="new-password" required minLength={8} /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button disabled={loading}>{loading ? "Updating…" : "Update password"}</button></form>;
}
