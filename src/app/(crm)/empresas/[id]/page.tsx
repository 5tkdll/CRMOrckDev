import Link from "next/link";
import { getCompany } from "@/server/companies/queries";
import { CompanyForm } from "../company-form";
import { ArchiveForm } from "../archive-form";
import type { CompanyValues } from "@/lib/companies/types";
import { assessments } from "@/lib/companies/types";
import { formatCpf,formatCnpj,formatCep,formatPhone,digits } from "@/lib/companies/identity.mjs";
import styles from "../companies.module.css";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export default async function CompanyPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const {id}=await params, c=await getCompany(id), flash=await searchParams;
  const type=c.documentType??"CNPJ";
  const initial:CompanyValues={name:c.name,segment:c.segment??"",address:c.address??"",neighborhood:c.neighborhood??"",city:c.city??"",state:c.state??"",phoneOriginal:c.phoneOriginal ? ([10,11].includes(digits(c.phoneOriginal).length)?formatPhone(c.phoneOriginal):c.phoneOriginal) : "",instagram:c.instagram??"",website:c.website??"",assessment:c.assessment,doNotContact:c.doNotContact?"on":"",doNotContactReason:c.doNotContactReason??"",notes:c.notes??"",documentType:type,documentNumber:type==="CPF"?formatCpf(c.documentNumber??""):formatCnpj(c.documentNumber??""),responsibleName:c.responsibleName??"",responsibleCpf:formatCpf(c.responsibleCpf??""),postalCode:formatCep(c.postalCode??""),addressNumber:c.addressNumber??"",addressComplement:c.addressComplement??"",useClientCpf:""};
  const version=c.updatedAt.toISOString();
  const labels:Record<string,string>={name:"Nome",segment:"Segmento",address:"Endereço",neighborhood:"Bairro",city:"Cidade",state:"UF",phoneOriginal:"Telefone",instagram:"Instagram",website:"Site",doNotContactReason:"Motivo da restrição",notes:"Observações",documentType:"Tipo de documento",documentNumber:"Documento do cliente",responsibleName:"Responsável",responsibleCpf:"CPF do responsável",postalCode:"CEP",addressNumber:"Número",addressComplement:"Complemento"};
  return <section><Link href="/empresas">Voltar às empresas</Link><div className="page-heading"><p className="eyebrow">EMPRESAS</p><h1>{c.name}</h1><p className="muted">Atualizado em {new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(c.updatedAt)}</p></div>
    {flash.saved==="1"&&<p role="status" className={styles.success}>Cadastro salvo.</p>}{flash.archived==="1"&&<p role="status" className={styles.success}>Cadastro arquivado.</p>}{flash.restored==="1"&&<p role="status" className={styles.success}>Cadastro restaurado.</p>}
    {(!c.documentNumber||!c.responsibleCpf||!c.responsibleName)&&<div className={styles.warning}>Cadastro anterior à atualização. Complete documento e responsável ao salvar uma edição. Nenhum dado fictício foi preenchido.</div>}
    {c.doNotContact&&<div className={styles.warning}><h2>Não contatar</h2><p>{c.doNotContactReason??"Restrição registrada."}</p></div>}
    {c.archivedAt?<div className={styles.card}><h2>Cadastro arquivado</h2><p>Restaure para editar.</p><dl>{Object.entries(initial).filter(([k])=>!["assessment","doNotContact","useClientCpf"].includes(k)).map(([k,v])=><div key={k}><dt>{labels[k]??k}</dt><dd className={styles.preserve}>{v||(k==="website"?"Site não identificado":"Não informado")}</dd></div>)}</dl><p>Avaliação: {assessments[c.assessment]}</p></div>:<CompanyForm key={`${id}:${version}`} id={id} updatedAt={version} initial={initial}/>}
    <ArchiveForm key={`archive:${version}`} id={id} updatedAt={version} archived={!!c.archivedAt}/>
    <p className="muted">Documentos são dados pessoais: não compartilhe capturas ou exportações reais sem necessidade. Contatos adicionais e histórico seguem separados.</p>
  </section>;
}
