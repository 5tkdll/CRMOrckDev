import {readFileSync,writeFileSync,existsSync,mkdirSync} from "node:fs";
import {dirname,join} from "node:path";
const formPath="src/app/(crm)/empresas/company-form.tsx", validationPath="src/lib/companies/validation.mjs";
const read=p=>readFileSync(p,"utf8").replace(/\r\n/g,"\n");
function once(text,from,to,label) { if(text.split(from).length!==2)throw Error(`Padrão inesperado: ${label}. Nenhum arquivo foi alterado.`);return text.replace(from,to); }
let form=read(formPath), validation=read(validationPath);
const formDone=form.includes('import { CompanyAddress } from "./company-address";');
const validationDone=validation.includes('// address-number-v2');
if(formDone!==validationDone)throw Error("Instalacao parcial detectada. Restaure o backup antes de reaplicar.");
if(formDone) { console.log("Pacote 08 ja aplicado. Nenhum arquivo alterado.");process.exit(0); }
form=once(form,'import { useActionState,useEffect,useRef,useState } from "react";','import { useActionState,useRef,useState } from "react";\nimport { CompanyAddress } from "./company-address";','import formulario');
form=once(form,'type AddressSuggestion={cep:string;address:string;neighborhood:string;city:string;state:string};\nconst addressFields=["address","neighborhood","city","state"] as const;\n','','tipos CEP antigo');
form=once(form,'  const addressRevision=useRef(0);\n','','revision');
form=once(form,'  const [cepStatus,setCepStatus]=useState("");\n  const [suggestion,setSuggestion]=useState<AddressSuggestion|null>(null);\n  const [retry,setRetry]=useState(0);\n  const cep=digits(values.postalCode);\n','','estado CEP');
form=once(form,'    if((addressFields as readonly string[]).includes(name)) addressRevision.current++;\n    if(name==="postalCode") { setSuggestion(null); setCepStatus(""); }\n','','change CEP');
const start=form.indexOf('  function applyAddress('),end=form.indexOf('  function field(',start);
if(start<0||end<start)throw Error("Bloco CEP nao identificado. Nenhum arquivo alterado.");
form=form.slice(0,start)+form.slice(end);
const addressStart=form.indexOf('    <h2>Endereço</h2>'),addressEnd=form.indexOf('    <fieldset className={styles.section}>',addressStart);
if(addressStart<0||addressEnd<addressStart)throw Error("Secao endereco nao identificada. Nenhum arquivo alterado.");
form=form.slice(0,addressStart)+'    <CompanyAddress values={values} onChange={patch=>update({...live.current,...patch})} errors={result.errors}/>\n'+form.slice(addressEnd);
form=once(form,'import { digits,formatCpf,formatCnpj,formatPhone,formatCep }','import { formatCpf,formatCnpj,formatPhone }','imports mascaras');
validation=once(validation,'const limits = {','import { isAddressNumber, isNoAddressNumber, NO_ADDRESS_NUMBER } from "./address-rules.mjs";\n// address-number-v2\nconst limits = {','import regra');
validation=once(validation,'addressNumber:30','addressNumber:5','limite numero');
validation=once(validation,'  if (!values.name)','  if (isNoAddressNumber(values.addressNumber)) values.addressNumber=NO_ADDRESS_NUMBER;\n  if (!isAddressNumber(values.addressNumber)) errors.addressNumber="Informe até 5 dígitos ou use S/ Número.";\n  if (!values.name)','regra numero servidor');
// Preflight is complete before either original is changed. No database operation.
const backup=join(".local-backups",`package-08-${Date.now()}`);
for(const path of [formPath,validationPath]){const dest=join(backup,path);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,readFileSync(path));}
try {writeFileSync(formPath,form);writeFileSync(validationPath,validation);}catch(error){for(const path of [formPath,validationPath])writeFileSync(path,readFileSync(join(backup,path)));throw error;}
const ignore=".local-backups/";
if(existsSync(".gitignore")){let content=readFileSync(".gitignore","utf8");if(!content.split(/\r?\n/).includes(ignore))writeFileSync(".gitignore",content+"\n"+ignore+"\n");}
console.log(`Pacote 08 aplicado. Backup local ignorado pelo Git: ${backup}. Sem migrations e sem alterar actions.ts.`);
