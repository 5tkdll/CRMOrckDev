import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function AccountPage() {
  const user = await requireUser();
  const companies = await getDb().company.count();
  return <section style={{ padding: 24 }}>
    <h1>Minha conta</h1>
    <p>Nome: {user.name}</p><p>E-mail: {user.email}</p>
    <p>Sessao autenticada. Consulta pelo Prisma concluida.</p>
    <p>Empresas cadastradas no banco: {companies}</p>
    <p>Esta contagem e real; os demais modulos ainda serao conectados aos dados.</p>
  </section>;
}
