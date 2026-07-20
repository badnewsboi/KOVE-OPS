import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return <main className="auth-page"><section className="auth-card">
    <Link href="/" className="auth-brand"><span>K</span>KOVE <b>OPS</b></Link>
    <div className="auth-heading"><p>Secure industrial operations</p><h1>{title}</h1><span>{subtitle}</span></div>
    {children}{footer && <div className="auth-footer">{footer}</div>}
  </section></main>;
}
