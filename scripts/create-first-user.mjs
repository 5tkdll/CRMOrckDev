import nextEnv from "@next/env";
import pg from "pg";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { hashPassword } from "../src/server/auth/password.mjs";
nextEnv.loadEnvConfig(process.cwd());
let pool;
let client;
let transaction = false;
let rl;
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk, encoding); callback(); } });
async function ask(prompt, hidden = false) {
  if (hidden) process.stdout.write(prompt);
  muted = hidden;
  try { return await rl.question(hidden ? "" : prompt); }
  finally { muted = false; if (hidden) process.stdout.write("\n"); }
}
try {
  if (!process.stdin.isTTY) throw new Error("Use um terminal interativo para criar o usuario.");
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL ausente.");
  let url;
  try { url = new URL(raw); } catch { throw new Error("DATABASE_URL invalida."); }
  if (url.username !== "crmapp" || url.hostname !== "192.168.100.15" || (url.port || "5432") !== "5432" || url.pathname !== "/crmOD-db") throw new Error("Alvo incorreto. Use crmapp em 192.168.100.15:5432/crmOD-db.");
  pool = new pg.Pool({ connectionString: raw, max: 1, connectionTimeoutMillis: 5000 });
  rl = createInterface({ input: process.stdin, output, terminal: true });
  const name = (await ask("Nome: ")).trim();
  const email = (await ask("E-mail de acesso: ")).trim().toLowerCase();
  if (!name || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Nome ou e-mail invalido.");
  const password = await ask("Senha (12 a 128 caracteres, entrada oculta): ", true);
  const confirmation = await ask("Confirme a senha: ", true);
  if (password !== confirmation) throw new Error("Senhas diferentes.");
  if (password.length < 12 || password.length > 128) throw new Error("A senha deve ter de 12 a 128 caracteres.");
  const passwordHash = await hashPassword(password);
  const confirmationText = await ask("Criar PRIMEIRO usuario em crmOD-db como crmapp? Digite CRIAR: ");
  if (confirmationText !== "CRIAR") throw new Error("Operacao cancelada.");
  client = await pool.connect();
  await client.query("BEGIN"); transaction = true;
  await client.query("SELECT pg_advisory_xact_lock(741231, 1)");
  const { rows: [count] } = await client.query('SELECT COUNT(*)::int AS total FROM public.users');
  if (count.total !== 0) throw new Error("Ja existe usuario. Este script nao cria outro nem altera senhas.");
  await client.query('INSERT INTO public.users (id, email, name, "passwordHash", active, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,true,NOW(),NOW())', [randomUUID(), email, name, passwordHash]);
  await client.query("COMMIT"); transaction = false;
  console.log("Primeiro usuario criado. Entre com o e-mail informado; a senha nao foi exibida ou gravada em arquivo.");
} catch (error) {
  if (transaction && client) await client.query("ROLLBACK").catch(() => {});
  const safe = new Set(["Use um terminal interativo para criar o usuario.", "DATABASE_URL ausente.", "DATABASE_URL invalida.", "Alvo incorreto. Use crmapp em 192.168.100.15:5432/crmOD-db.", "Nome ou e-mail invalido.", "Senhas diferentes.", "A senha deve ter de 12 a 128 caracteres.", "Operacao cancelada.", "Ja existe usuario. Este script nao cria outro nem altera senhas."]);
  console.error(safe.has(error?.message) ? error.message : "Falha ao criar usuario. Confira conexao/permissoes; nao compartilhe credenciais.");
  process.exitCode = 1;
} finally {
  muted = false;
  rl?.close();
  client?.release();
  if (pool) await pool.end();
}
