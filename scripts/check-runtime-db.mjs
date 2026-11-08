import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const connectionString = process.env.DATABASE_URL;
let pool;
try {
  if (!connectionString) throw new Error("ENV_MISSING");
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol) ||
      url.username !== "crmapp" || url.hostname !== "192.168.100.15" ||
      (url.port || "5432") !== "5432" || url.pathname !== "/crmOD-db") {
    throw new Error("ENV_TARGET_INVALID");
  }
  pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
  const { rows: [identity] } = await pool.query(`
    SELECT current_database() AS banco, current_user AS usuario,
      has_schema_privilege(current_user, 'public', 'CREATE') AS pode_criar_tabelas,
      has_table_privilege(current_user, 'public.companies', 'SELECT') AS pode_consultar,
      has_table_privilege(current_user, 'public.companies', 'INSERT') AS pode_inserir,
      has_table_privilege(current_user, 'public.companies', 'UPDATE') AS pode_atualizar,
      has_table_privilege(current_user, 'public.companies', 'DELETE') AS pode_excluir
  `);
  if (identity.banco !== 'crmOD-db' || identity.usuario !== 'crmapp' ||
      identity.pode_criar_tabelas || identity.pode_excluir ||
      !identity.pode_consultar || !identity.pode_inserir || !identity.pode_atualizar) {
    throw new Error('PERMISSIONS_UNEXPECTED');
  }
  const { rows: [count] } = await pool.query('SELECT COUNT(*)::text AS total_empresas FROM public.companies');
  console.log(JSON.stringify({ status: 'ok', ...identity, ...count }, null, 2));
} catch (error) {
  const allowed = new Set(['ENV_MISSING', 'ENV_TARGET_INVALID', 'PERMISSIONS_UNEXPECTED', 'ECONNREFUSED', 'ETIMEDOUT', '28P01', '42501', '42P01']);
  const code = String(error?.code ?? error?.message ?? '');
  console.error('Teste falhou:', allowed.has(code) ? code : 'DB_CHECK_FAILED');
  process.exitCode = 1;
} finally {
  if (pool) await pool.end();
}
