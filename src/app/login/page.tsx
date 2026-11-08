import { redirect } from "next/navigation";
import { currentUser } from "@/server/auth/session";
import { LoginForm } from "./login-form";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function LoginPage() {
  if (await currentUser()) redirect("/dashboard");
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f1f5f9", padding: 24 }}>
    <section style={{ width: "100%", maxWidth: 420, background: "white", padding: 32, borderRadius: 16, color: "#0f172a", boxShadow: "0 8px 30px #0f172a12" }}>
      <p style={{ color: "#4f46e5", marginBottom: 8 }}>ORCK DEV</p>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Acessar o CRM</h1>
      <p style={{ marginBottom: 24 }}>Use seu usuario local para continuar.</p>
      <LoginForm />
      <p style={{ marginTop: 24, fontSize: 13, color: "#64748b" }}>Acesso interno. Nao ha cadastro publico ou recuperacao por e-mail.</p>
    </section>
  </main>;
}
