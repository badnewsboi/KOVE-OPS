import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthShell title="Welcome back" subtitle="Sign in to your operations workspace." footer={<>New to KOVE OPS? <Link href="/auth/sign-up">Create an account</Link></>}><SignInForm next={next} /></AuthShell>;
}
