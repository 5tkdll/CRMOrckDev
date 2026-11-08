import Link from "next/link";
import {getCompany} from "@/server/companies/queries";
import {CompanyForm} from "../company-form";
import {ArchiveForm} from "../archive-form";
import type {CompanyValues} from "@/lib/companies/types";
import {formatCpf,formatCnpj,formatCep,formatPhone,digits} from "@/lib/companies/identity.mjs";
import {CrmIcon} from "@/components/ui/crm-icon";
import styles from "../registration.module.css";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export default async function CompanyPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const {id}=await params,c=await getCompany(id),flash=await searchParams;
  const type=c.documentType??"CNPJ",version=c.updatedAt.toISOString();
  const initial:CompanyValues={name:c.name,segment:c.segment??"",address:c.address??"",neighborhood:c.neighborhood??"",city:c.city??"",state:c.state??"",phoneOriginal:c.phoneOriginal?([10,11].includes(digits(c.phoneOriginal).length)?formatPhone(c.phoneOriginal):c.phoneOriginal):"",instagram:c.instagram??"",website:c.website??"",assessment:c.assessment,doNotContact:c.doNotContact?"on":"",doNotContactReason:c.doNotContactReason??"",notes:c.notes??"",documentType:type,documentNumber:type==="CPF"?formatCpf(c.documentNumber??""):formatCnpj(c.documentNumber??""),responsibleName:c.responsibleName??"",responsibleCpf:formatCpf(c.responsibleCpf??""),postalCode:formatCep(c.postalCode??""),addressNumber:c.addressNumber??"",addressComplement:c.addressComplement??"",useClientCpf:""};
  const saved=flash.saved==="1",archived=flash.archived==="1",restored=flash.restored==="1";
  return <section className={styles.page}>
    <header className={styles.pageHeader}><div className={styles.headerText}><div className={styles.headerMeta}><Link href="/empresas" className={styles.backLink}><CrmIcon name="chevron_right" size={13} className={styles.backChevron}/>Voltar às empresas</Link><span className={styles.recordTag}>ID #{c.id.slice(0,8).toUpperCase()}</span><span className={styles.stateTag}>{c.archivedAt?"Arquivado":"Ativo"}</span></div><h1>{c.name}</h1><p>Atualizado em {new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"}).format(c.updatedAt)}</p></div><div className={styles.headerAction}><CrmIcon name={c.archivedAt?"database":"edit"} size={15}/><span>{c.archivedAt?"Somente leitura":"Editar cadastro"}</span></div></header>
    {(saved||archived||restored)&&<p role="status" className={styles.successBanner}><CrmIcon name="task_alt" size={18}/>{saved?"Cadastro salvo.":archived?"Cadastro arquivado.":"Cadastro restaurado."}</p>}
    {(!c.documentNumber||!c.responsibleCpf||!c.responsibleName)&&<div className={styles.noticeBanner}><CrmIcon name="help" size={18}/><span>Identificação pendente. Complete documento e responsável ao salvar uma edição.</span></div>}
    {c.doNotContact&&<div className={styles.errorBanner}><CrmIcon name="block" size={20}/><div><strong>Não contatar</strong><p>{c.doNotContactReason??"Restrição registrada."}</p></div></div>}
    <CompanyForm key={`${id}:${version}`} id={id} updatedAt={version} initial={initial} archived={!!c.archivedAt} archiveControl={<ArchiveForm key={`archive:${version}`} id={id} updatedAt={version} archived={!!c.archivedAt}/>}/>
  </section>;
}
