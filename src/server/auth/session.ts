import "server-only";
import { createHmac } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../db/client";

const COOKIE = "orck_session";
const ISSUER = "crm-orck-dev";
const AUDIENCE = "crm-local";
const TTL = 8 * 60 * 60;
function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || !/^[a-f0-9]{64,}$/i.test(value)) {
    throw new Error("AUTH_SECRET ausente ou invalido. Gere pelo script local.");
  }
  return new TextEncoder().encode(value);
}
function version(passwordHash: string): string {
  return createHmac("sha256", secret()).update(passwordHash).digest("hex");
}
function secureCookie(): boolean {
  const value = process.env.AUTH_COOKIE_SECURE;
  if (value !== "true" && value !== "false") throw new Error("Defina AUTH_COOKIE_SECURE explicitamente.");
  return value === "true";
}
export async function createSession(id: string, passwordHash: string): Promise<void> {
  const token = await new SignJWT({ v: version(passwordHash) })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(id).setIssuer(ISSUER).setAudience(AUDIENCE)
    .setIssuedAt().setExpirationTime("8h").sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: secureCookie(), sameSite: "strict",
    path: "/", maxAge: TTL,
  });
}
export async function destroySession(): Promise<void> {
  (await cookies()).set(COOKIE, "", {
    httpOnly: true, secure: secureCookie(), sameSite: "strict", path: "/", maxAge: 0,
  });
}
export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const key = secret();
  let claims;
  try {
    const result = await jwtVerify(token, key, {
      algorithms: ["HS256"], issuer: ISSUER, audience: AUDIENCE, maxTokenAge: "8h",
    });
    claims = result.payload;
  } catch { return null; }
  if (typeof claims.sub !== "string" || !/^[a-f0-9-]{36}$/i.test(claims.sub) || typeof claims.v !== "string") return null;
  const user = await getDb().user.findUnique({
    where: { id: claims.sub },
    select: { id: true, email: true, name: true, active: true, passwordHash: true },
  });
  if (!user?.active || claims.v !== version(user.passwordHash)) return null;
  return { id: user.id, name: user.name, email: user.email };
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
