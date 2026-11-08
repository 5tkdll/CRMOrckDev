"use client";
import { useActionState } from "react";
import { login } from "./actions";
export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return <form action={action} style={{ display: "grid", gap: 16 }}>
    <label style={{ display: "grid", gap: 6 }}>E-mail
      <input name="email" type="email" autoComplete="username" maxLength={254} required style={{ padding: 12, border: "1px solid #cbd5e1", borderRadius: 8, color: "#0f172a", background: "white" }} />
    </label>
    <label style={{ display: "grid", gap: 6 }}>Senha
      <input name="password" type="password" autoComplete="current-password" maxLength={128} required style={{ padding: 12, border: "1px solid #cbd5e1", borderRadius: 8, color: "#0f172a", background: "white" }} />
    </label>
    <div aria-live="polite">{state.error && <p role="alert" style={{ color: "#b91c1c" }}>{state.error}</p>}</div>
    <button disabled={pending} type="submit" style={{ padding: 12, border: 0, borderRadius: 8, background: "#4f46e5", color: "white", cursor: pending ? "wait" : "pointer" }}>{pending ? "Entrando..." : "Entrar"}</button>
  </form>;
}
