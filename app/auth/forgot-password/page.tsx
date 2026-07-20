import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return <AuthShell title="Reset your password" subtitle="We’ll send a secure recovery link to your email." footer={<Link href="/auth/sign-in">Return to sign in</Link>}><ForgotPasswordForm /></AuthShell>;
}
