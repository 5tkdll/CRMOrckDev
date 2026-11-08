"use client";
import Link from "next/link";
import { useActionState,useRef,useState } from "react";
import { CompanyAddress } from "./company-address";
import { saveCompany } from "./actions";
import { assessments,type CompanyValues,type CompanyFormState } from "@/lib/companies/types";
import { formatCpf,formatCnpj,formatPhone } from "@/lib/companies/identity.mjs";
import styles from "./companies.module.css";
const empty:CompanyValues={name:"",segment:"",address:"",neighborhood:"",city:"",state:"",phoneOriginal:"",instagram:"",website:"",assessment:"UNREVIEWED",doNotContact:"",doNotContactReason:"",notes:"",documentType:"CNPJ",documentNumber:"",responsibleName:"",responsibleCpf:"",postalCode:"",addressNumber:"",addressComplement:"",useClientCpf:""};
export function CompanyForm({initial,id,updatedAt}:{initial?:Partial<CompanyValues>;id?:string;updatedAt?:string}) {
  const [result,action,pending]=useActionState<CompanyFormState,FormData>(saveCompany,{message:""});
  const [values,setValues]=useState<CompanyValues>(()=>({...empty,...initial}));
  const live=useRef(values);
  const [acknowledged,setAcknowledged]=useState(false);
  function update(next:CompanyValues) { live.current=next; setValues(next); setAcknowledged(false); }
  function change(name:keyof CompanyValues,value:string) {
    const next={...live.current,[name]:value};
    if(name==="documentType") { next.documentNumber=""; next.useClientCpf=""; }
    if(next.documentType==="CPF" && next.useClientCpf==="on") next.responsibleCpf=next.documentNumber;
    update(next);
  }
  function field(name:keyof CompanyValues,label:string,max:number,options:{required?:boolean;placeholder?:string;numeric?:boolean;format?:(value:string)=>string;readOnly?:boolean}={}) {
    return <label className={styles.field} key={name}>{label}{options.required ? " *" : ""}
      <input name={name} value={values[name]} onChange={e=>change(name,options.format ? options.format(e.target.value) : e.target.value)} maxLength={max} required={options.required} placeholder={options.placeholder} inputMode={options.numeric ? "numeric" : undefined} readOnly={options.readOnly} aria-invalid={!!result.errors?.[name]} aria-describedby={result.errors?.[name] ? `error-${name}` : undefined} />
      {result.errors?.[name] && <span id={`error-${name}`} className={styles.error}>{result.errors[name]}</span>}
    </label>;
  }
  return <form action={action} onReset={event=>event.preventDefault()} className={styles.card}>
    {id && <><input type="hidden" name="id" value={id}/><input type="hidden" name="updatedAt" value={updatedAt??""}/></>}
    {result.message && <div className={styles.warning} role="alert">{result.message}</div>}
    {!!result.duplicates?.length && <div className={styles.warning}><h2>{result.exactDocument ? "Documento já cadastrado" : "Possíveis duplicidades"}</h2><ul>{result.duplicates.map(d=><li key={d.id} className={styles.duplicate}><Link href={`/empresas/${d.id}`} target="_blank" rel="noopener noreferrer">{d.name}</Link><p>{d.phone??"Telefone não informado"} · {d.location||"Localização não informada"}</p><p>{d.website??"Site não identificado"}</p><p>{d.archived?"Arquivada":"Ativa"}{d.blocked?" · Não contatar":""}</p></li>)}</ul></div>}
    <h2>Identificação do cliente</h2>
    <div className={styles.grid}>
      {field("name","Nome da empresa / cliente",200,{required:true})}
      {field("segment","Segmento",120)}
      <label className={styles.field}>Documento do cliente *<select name="documentType" value={values.documentType} onChange={e=>change("documentType",e.target.value)}><option value="CNPJ">CNPJ</option><option value="CPF">CPF — cliente sem CNPJ</option></select>{result.errors?.documentType&&<span className={styles.error}>{result.errors.documentType}</span>}</label>
      {field("documentNumber",values.documentType==="CPF"?"CPF do cliente":"CNPJ",values.documentType==="CPF"?14:18,{required:true,numeric:values.documentType==="CPF",format:values.documentType==="CPF"?formatCpf:formatCnpj})}
    </div>
    <p className="muted">Documentos são validados pelo formato e dígitos verificadores. Isso não consulta inscrição, titularidade ou situação cadastral na Receita.</p>
    <h2>Responsável</h2>
    {values.documentType==="CPF"&&<label className={styles.check}><input type="checkbox" name="useClientCpf" checked={values.useClientCpf==="on"} onChange={e=>change("useClientCpf",e.target.checked?"on":"")}/>Usar o mesmo CPF do cliente para o responsável</label>}
    <div className={styles.grid}>
      {field("responsibleName","Nome do responsável",200,{required:true})}
      {field("responsibleCpf","CPF do responsável",14,{required:true,numeric:true,format:formatCpf,readOnly:values.documentType==="CPF"&&values.useClientCpf==="on"})}
    </div>
    {result.errors?.useClientCpf&&<p className={styles.error}>{result.errors.useClientCpf}</p>}
    <h2>Contato e presença digital</h2>
    <div className={styles.grid}>
      {field("phoneOriginal","Telefone com DDD",15,{numeric:true,format:formatPhone,placeholder:"(62) 99999-9999"})}
      {field("website","Site",1000,{placeholder:"empresa.com.br"})}
      {field("instagram","Instagram",300,{placeholder:"@perfil ou URL"})}
      <label className={styles.field}>Avaliação comercial<select name="assessment" value={values.assessment} onChange={e=>change("assessment",e.target.value)}>{Object.entries(assessments).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>{result.errors?.assessment&&<span className={styles.error}>{result.errors.assessment}</span>}</label>
    </div>
    <CompanyAddress values={values} onChange={patch=>update({...live.current,...patch})} errors={result.errors}/>
    <fieldset className={styles.section}><legend>Restrição de contato</legend>
      <label className={styles.check}><input type="checkbox" name="doNotContact" checked={values.doNotContact==="on"} onChange={e=>change("doNotContact",e.target.checked?"on":"")}/>Não contatar esta empresa / cliente</label>
      <p>Independente da avaliação comercial. Desmarcar não registra autorização de contato.</p>
      <label className={styles.field}>Motivo da restrição<textarea name="doNotContactReason" value={values.doNotContactReason} onChange={e=>change("doNotContactReason",e.target.value)} rows={3} maxLength={1000}/>{result.errors?.doNotContactReason&&<span className={styles.error}>{result.errors.doNotContactReason}</span>}</label>
    </fieldset>
    <label className={styles.field}>Observações internas<textarea name="notes" value={values.notes} onChange={e=>change("notes",e.target.value)} rows={5} maxLength={10000}/>{result.errors?.notes&&<span className={styles.error}>{result.errors.notes}</span>}</label>
    {!result.exactDocument && !!result.duplicates?.length && <label className={styles.check}><input type="checkbox" name="acknowledgeDuplicates" checked={acknowledged} onChange={e=>setAcknowledged(e.target.checked)}/>Revisei eventuais coincidências de nome/telefone/site e desejo salvar separadamente. Isso não permite repetir CPF/CNPJ do cliente.</label>}
    <div className={styles.toolbar}><button className={styles.primary} type="submit" disabled={pending}>{pending?"Salvando...":"Salvar cadastro"}</button><Link href="/empresas">Voltar à lista</Link></div>
  </form>;
}
