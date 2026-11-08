import { randomBytes } from "node:crypto";
import { existsSync, appendFileSync, readFileSync } from "node:fs";
// Preserves existing configuration; never prints the generated key.
const paths = [".env", ".env.local", ".env.development", ".env.development.local", ".env.production", ".env.production.local"];
const hasSecret = paths.some(path => existsSync(path) && /^\s*(?:export\s+)?AUTH_SECRET\s*=/m.test(readFileSync(path, "utf8")));
if (hasSecret || process.env.AUTH_SECRET) {
  console.error("AUTH_SECRET ja existe. Nenhuma chave foi substituida.");
  process.exitCode = 1;
} else {
  const target = existsSync(".env.local") ? ".env.local" : ".env";
  const body = existsSync(target) ? readFileSync(target, "utf8") : "";
  let addition = `\nAUTH_SECRET="${randomBytes(32).toString("hex")}"\n`;
  if (!/^\s*AUTH_COOKIE_SECURE\s*=/m.test(body)) addition += 'AUTH_COOKIE_SECURE="false"\n';
  appendFileSync(target, addition, { encoding: "utf8", mode: 0o600 });
  console.log(`Chave criada em ${target}, sem exibir seu valor. AUTH_COOKIE_SECURE=false e somente para HTTP local.`);
}
