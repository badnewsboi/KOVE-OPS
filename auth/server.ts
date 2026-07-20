import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return data.claims;
}

export async function requireUser(returnTo = "/") {
  const user = await getUser();
  if (!user) redirect(`/auth/sign-in?next=${encodeURIComponent(returnTo)}`);
  return user;
}
