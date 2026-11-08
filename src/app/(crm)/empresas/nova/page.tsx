import Link from "next/link";
import {requireUser} from "@/server/auth/session";
import {CrmIcon} from "@/components/ui/crm-icon";
import {CompanyForm} from "../company-form";
import styles from "../registration.module.css";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export default async function NewCompanyPage(){
  await requireUser();
  return <section className={styles.page}><header className={styles.pageHeader}><div className={styles.headerText}><div className={styles.headerMeta}><Link href="/empresas" className={styles.backLink}><CrmIcon name="chevron_right" size={13} className={styles.backChevron}/>Voltar às empresas</Link><span className={styles.recordTag}>NOVO CADASTRO</span></div><h1>Nova empresa / cliente</h1><p>Insira os dados cadastrais da empresa ou cliente para prospecção, pipeline comercial e gestão de projetos.</p></div><div className={styles.headerAction}><CrmIcon name="edit" size={15}/><span>Campos com * são obrigatórios</span></div></header><CompanyForm/></section>;
}
