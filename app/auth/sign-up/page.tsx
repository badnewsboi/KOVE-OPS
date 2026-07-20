import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return <AuthShell title="Create your workspace" subtitle="Securely establish your organization in KOVE OPS." footer={<>Already have an account? <Link href="/auth/sign-in">Sign in</Link></>}><SignUpForm /></AuthShell>;
}
