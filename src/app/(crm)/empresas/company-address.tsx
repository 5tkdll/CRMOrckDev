"use client";
import {useEffect,useRef,useState} from "react";
import type {CompanyValues,CompanyFormState} from "@/lib/companies/types";
import {digits,formatCep} from "@/lib/companies/identity.mjs";
import {cepPatch,onlyAddressNumber,isNoAddressNumber,NO_ADDRESS_NUMBER} from "@/lib/companies/address-rules.mjs";
import base from "./companies.module.css";
import styles from "./address.module.css";
type Props={values:CompanyValues;onChange:(patch:Partial<CompanyValues>)=>void;errors?:CompanyFormState["errors"]};
export function CompanyAddress({values,onChange,errors}:Props) {
  const latest=useRef({values,onChange});
  useEffect(()=>{latest.current={values,onChange};},[values,onChange]);
  const [status,setStatus]=useState("");
  const cep=digits(values.postalCode);
  function update(patch:Partial<CompanyValues>) { const current=latest.current; latest.current={...current,values:{...current.values,...patch}}; current.onChange(patch); }
  useEffect(()=>{
    if(cep.length!==8) { setStatus("");return; }
    const abort=new AbortController();let cancelled=false;
    setStatus("Consultando CEP...");
    const timer=setTimeout(async()=>{
      try {
        const response=await fetch(`/api/cep/${cep}`,{cache:"no-store",signal:abort.signal});
        if(cancelled) return;
        const data=await response.json();
        if(cancelled) return;
        if(!response.ok) { setStatus("CEP não localizado ou consulta indisponível. Preencha o endereço manualmente.");return; }
        const patch=cepPatch(data,cep,digits(latest.current.values.postalCode));
        if(!patch) { setStatus("");return; }
        latest.current.onChange(patch);
        setStatus("");
      } catch { if(!cancelled)setStatus("Consulta indisponível. Preencha o endereço manualmente."); }
    },300);
    return ()=>{cancelled=true;clearTimeout(timer);abort.abort();};
  },[cep]);
  const noNumber=isNoAddressNumber(values.addressNumber);
  function input(name:"address"|"neighborhood"|"city"|"state"|"addressComplement",label:string,max:number) {
    return <label className={base.field}>{label}<input name={name} value={values[name]} maxLength={max} onChange={e=>update({[name]:name==="state"?e.target.value.toUpperCase():e.target.value})} aria-invalid={!!errors?.[name]}/>{errors?.[name]&&<span className={base.error}>{errors[name]}</span>}</label>;
  }
  return <section aria-labelledby="company-address-title"><h2 id="company-address-title">Endereço</h2>
    <div className={styles.cepRow}><label className={base.field}>CEP (opcional)<input name="postalCode" value={values.postalCode} maxLength={9} inputMode="numeric" autoComplete="postal-code" placeholder="99999-999" onChange={e=>update({postalCode:formatCep(e.target.value)})} aria-invalid={!!errors?.postalCode}/>{errors?.postalCode&&<span className={base.error}>{errors.postalCode}</span>}</label><span role="status" className={styles.status}>{status}</span></div>
    <div className={styles.addressGrid}>
      {input("address","Logradouro / endereço",300)}
      <div className={styles.numberGroup}><label className={base.field}>Número<input name="addressNumber" value={noNumber?NO_ADDRESS_NUMBER:values.addressNumber} maxLength={5} inputMode={noNumber?undefined:"numeric"} readOnly={noNumber} placeholder="Até 5 dígitos" onChange={e=>update({addressNumber:onlyAddressNumber(e.target.value)})} aria-invalid={!!errors?.addressNumber} aria-describedby={errors?.addressNumber?"address-number-error":undefined}/>{errors?.addressNumber&&<span id="address-number-error" className={base.error}>{errors.addressNumber}</span>}</label><button type="button" className={`${styles.noNumber} ${noNumber?styles.selected:""}`} aria-pressed={noNumber} onClick={()=>update({addressNumber:noNumber?"":NO_ADDRESS_NUMBER})}>{noNumber?"Informar número":"S/ Número"}</button></div>
      {input("addressComplement","Complemento",200)}{input("neighborhood","Bairro",120)}{input("city","Cidade",120)}{input("state","UF",2)}
    </div><p className={styles.hint}>O CEP preenche logradouro, bairro, cidade e UF automaticamente. Número e complemento são informados separadamente.</p>
  </section>;
}
