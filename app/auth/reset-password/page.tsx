import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return <AuthShell title="Choose a new password" subtitle="Use at least eight characters for your new password."><ResetPasswordForm /></AuthShell>;
}
