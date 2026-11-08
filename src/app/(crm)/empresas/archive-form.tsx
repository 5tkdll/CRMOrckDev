"use client";
import { useActionState } from "react";
import { setCompanyArchived } from "./actions";
import type { CompanyFormState } from "@/lib/companies/types";
import styles from "./companies.module.css";
export function ArchiveForm({id,updatedAt,archived}:{id:string;updatedAt:string;archived:boolean}) {
  const [result,action,pending]=useActionState<CompanyFormState,FormData>(setCompanyArchived,{message:""});
  return <form action={action} className={styles.card}><h2>{archived?"Restaurar cadastro":"Arquivar cadastro"}</h2><p>{archived?"Restaurar preserva os dados, a avaliação e a restrição de contato.":"Arquivar retira o cadastro da lista padrão, sem apagar dados nem cancelar tarefas ou projetos."}</p>
    <input type="hidden" name="id" value={id}/><input type="hidden" name="updatedAt" value={updatedAt}/><input type="hidden" name="operation" value={archived?"restore":"archive"}/>
    {result.message&&<p role="alert" className={styles.error}>{result.message}</p>}
    <button type="submit" className={styles.secondary} disabled={pending}>{pending?"Processando...":archived?"Restaurar cadastro":"Arquivar cadastro"}</button>
  </form>;
}
