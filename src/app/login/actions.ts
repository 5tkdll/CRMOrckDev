"use server";
import { redirect } from "next/navigation";
import { getDb } from "@/server/db/client";
import { verifyPassword } from "@/server/auth/password.mjs";
import { createSession, destroySession } from "@/server/auth/session";
import { allowLogin } from "@/server/auth/rate-limit";

export type LoginState = { error: string };
// Valid dummy scrypt encoding: same derivation cost for unknown email.
const DUMMY = "scrypt-v1$" + "0".repeat(32) + "$" + "0".repeat(128);
export async function login(_previous: LoginState, form: FormData): Promise<LoginState> {
  const rawEmail = form.get("email");
  const rawPassword = form.get("password");
  if (typeof rawEmail !== "string" || typeof rawPassword !== "string") return { error: "Informe e-mail e senha." };
  const email = rawEmail.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || rawPassword.length < 1 || rawPassword.length > 128) {
    return { error: "E-mail ou senha invalidos." };
  }
  if (!allowLogin(email)) return { error: "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente." };
  try {
    const user = await getDb().user.findUnique({ where: { email } });
    const valid = await verifyPassword(rawPassword, user?.passwordHash ?? DUMMY);
    if (!user?.active || !valid) return { error: "E-mail ou senha invalidos." };
    await createSession(user.id, user.passwordHash);
  } catch {
    console.error("AUTH_LOGIN_UNAVAILABLE");
    return { error: "Nao foi possivel entrar agora. Confira a configuracao local e a conexao com o banco." };
  }
  redirect("/dashboard");
}
export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
