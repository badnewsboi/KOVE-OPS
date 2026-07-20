"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const email = String(new FormData(event.currentTarget).get("email"));
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password` });
    setLoading(false); if (error) setError(error.message); else setMessage("If the account exists, a reset link has been sent.");
  }
  return <form className="auth-form" onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="email" required /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}
    <button disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button></form>;
}
