import { requireUser } from "@/server/auth/session";
import { CompanyForm } from "../company-form";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export default async function NewCompanyPage() { await requireUser(); return <section><div className="page-heading"><p className="eyebrow">EMPRESAS</p><h1>Novo cliente / empresa</h1><p>Documento do cliente e identificação do responsável são obrigatórios. CEP é opcional.</p></div><CompanyForm/></section>; }
