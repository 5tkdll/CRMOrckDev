"use client";
import {useActionState} from "react";
import {setCompanyArchived} from "./actions";
import type {CompanyFormState} from "@/lib/companies/types";
import {CrmIcon} from "@/components/ui/crm-icon";
import styles from "./registration.module.css";
export function ArchiveForm({id,updatedAt,archived}:{id:string;updatedAt:string;archived:boolean}){
  const [result,action,pending]=useActionState<CompanyFormState,FormData>(setCompanyArchived,{message:""});
  return <form action={action} className={styles.archiveAction}><h2>{archived?"Restaurar cadastro":"Arquivar cadastro"}</h2><p>{archived?"Restaurar preserva os dados, a avaliação comercial e a restrição de contato.":"Arquivar retira o cadastro da listagem padrão, sem apagar dados nem cancelar tarefas ou projetos."}</p><input type="hidden" name="id" value={id}/><input type="hidden" name="updatedAt" value={updatedAt}/><input type="hidden" name="operation" value={archived?"restore":"archive"}/>{result.message&&<p role="alert" className={styles.fieldError}>{result.message}</p>}<button type="submit" className={styles.archiveButton} disabled={pending}><CrmIcon name="database" size={15}/>{pending?"Processando...":archived?"Restaurar cadastro":"Arquivar cadastro"}</button></form>;
}
