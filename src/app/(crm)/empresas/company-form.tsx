"use client";
import Link from "next/link";
import { useActionState,useEffect,useRef,useState } from "react";
import { saveCompany } from "./actions";
import { assessments,type CompanyValues,type CompanyFormState } from "@/lib/companies/types";
import { digits,formatCpf,formatCnpj,formatPhone,formatCep } from "@/lib/companies/identity.mjs";
import styles from "./companies.module.css";
type AddressSuggestion={cep:string;address:string;neighborhood:string;city:string;state:string};
const addressFields=["address","neighborhood","city","state"] as const;
const empty:CompanyValues={name:"",segment:"",address:"",neighborhood:"",city:"",state:"",phoneOriginal:"",instagram:"",website:"",assessment:"UNREVIEWED",doNotContact:"",doNotContactReason:"",notes:"",documentType:"CNPJ",documentNumber:"",responsibleName:"",responsibleCpf:"",postalCode:"",addressNumber:"",addressComplement:"",useClientCpf:""};
export function CompanyForm({initial,id,updatedAt}:{initial?:Partial<CompanyValues>;id?:string;updatedAt?:string}) {
  const [result,action,pending]=useActionState<CompanyFormState,FormData>(saveCompany,{message:""});
  const [values,setValues]=useState<CompanyValues>(()=>({...empty,...initial}));
  const live=useRef(values);
  const addressRevision=useRef(0);
  const [acknowledged,setAcknowledged]=useState(false);
  const [cepStatus,setCepStatus]=useState("");
  const [suggestion,setSuggestion]=useState<AddressSuggestion|null>(null);
  const [retry,setRetry]=useState(0);
  const cep=digits(values.postalCode);
  function update(next:CompanyValues) { live.current=next; setValues(next); setAcknowledged(false); }
  function change(name:keyof CompanyValues,value:string) {
    const next={...live.current,[name]:value};
    if(name==="documentType") { next.documentNumber=""; next.useClientCpf=""; }
    if(next.documentType==="CPF" && next.useClientCpf==="on") next.responsibleCpf=next.documentNumber;
    if((addressFields as readonly string[]).includes(name)) addressRevision.current++;
    if(name==="postalCode") { setSuggestion(null); setCepStatus(""); }
    update(next);
  }
  function applyAddress(data:AddressSuggestion) {
    if(digits(live.current.postalCode)!==data.cep) return;
    const next={...live.current};
    for(const key of addressFields) if(data[key]) next[key]=data[key];
    addressRevision.current++;
    update(next); setSuggestion(null); setCepStatus("Endereço preenchido. Confira e complete número e complemento.");
  }
  useEffect(()=>{
    if(cep.length!==8) { setSuggestion(null); setCepStatus(""); return; }
    const abort=new AbortController(); let cancelled=false;
    const version=addressRevision.current;
    setCepStatus("Consultando CEP..."); setSuggestion(null);
    const timer=setTimeout(async()=>{
      try {
        const response=await fetch(`/api/cep/${cep}`,{signal:abort.signal,cache:"no-store"});
        const data=await response.json();
        if(cancelled || digits(live.current.postalCode)!==cep) return;
        if(!response.ok) { setCepStatus(typeof data.error==="string" ? data.error : "Consulta indisponível. Preencha manualmente."); return; }
        const valid=typeof data.cep==="string" && data.cep===cep && addressFields.every(k=>typeof data[k]==="string");
        if(!valid) { setCepStatus("Resposta inválida. Preencha manualmente."); return; }
        const found=data as AddressSuggestion;
        const current=live.current;
        const alreadyMatches=addressFields.every(k=>!found[k] || found[k]===current[k]);
        if(alreadyMatches) { setCepStatus("CEP consultado; endereço atual mantido."); return; }
        const hasAddress=addressFields.some(k=>current[k].trim()!=="");
        if(hasAddress || version!==addressRevision.current) { setSuggestion(found); setCepStatus("Endereço encontrado. Revise antes de substituir os campos preenchidos."); }
        else applyAddress(found);
      } catch { if(!cancelled) setCepStatus("Não foi possível consultar o CEP. Você pode preencher o endereço manualmente."); }
    },350);
    return ()=>{cancelled=true;clearTimeout(timer);abort.abort();};
    // Address changes do not trigger requests; a later response checks the live form before applying.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[cep,retry]);
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
    <h2>Endereço</h2>
    <div className={styles.grid}>{field("postalCode","CEP (opcional)",9,{numeric:true,format:formatCep,placeholder:"99999-999"})}</div>
    <div aria-live="polite"><p>{cepStatus}</p></div>
    {cep.length===8&&<button className={styles.secondary} type="button" onClick={()=>setRetry(n=>n+1)}>Consultar CEP novamente</button>}
    {suggestion&&<div className={styles.warning}><p>{[suggestion.address,suggestion.neighborhood,suggestion.city,suggestion.state].filter(Boolean).join(" · ")}</p><button type="button" className={styles.secondary} onClick={()=>applyAddress(suggestion)}>Aplicar endereço encontrado</button><button type="button" className={styles.secondary} onClick={()=>{setSuggestion(null);setCepStatus("Endereço atual mantido.");}}>Manter endereço atual</button></div>}
    <div className={styles.grid}>
      {field("address","Logradouro / endereço",300)}{field("addressNumber","Número",30)}{field("addressComplement","Complemento",200)}
      {field("neighborhood","Bairro",120)}{field("city","Cidade",120)}{field("state","UF",2)}
    </div>
    <p className="muted">Consulta de CEP requer internet e envia apenas o CEP ao ViaCEP. Você pode cadastrar sem CEP ou preencher o endereço manualmente.</p>
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
