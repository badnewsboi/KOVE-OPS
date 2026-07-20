"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignInForm({ next = "/" }: { next?: string }) {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (error) { setError(error.message); setLoading(false); return; }
    window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/");
  }
  return <form className="auth-form" onSubmit={submit}>
    <label>Email<input name="email" type="email" autoComplete="email" required /></label>
    <label><span>Password <Link href="/auth/forgot-password">Forgot password?</Link></span><input name="password" type="password" autoComplete="current-password" required minLength={8} /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
  </form>;
}
