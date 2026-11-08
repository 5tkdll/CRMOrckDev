import { readFileSync,writeFileSync } from "node:fs";
const path="src/app/(crm)/empresas/company-form.tsx";
const text=readFileSync(path,"utf8");
const before="{!result.exactDocument&&<label";
const after="{!result.exactDocument && !!result.duplicates?.length && <label";
if(text.includes(after)) console.log("Confirmacao ja condicional; nenhuma alteracao.");
else if(text.split(before).length===2) { writeFileSync(path,text.replace(before,after),"utf8"); console.log("Checkbox de coincidencias exibido somente quando houver ocorrencias. Layout do formulario preservado."); }
else { console.error("Padrao esperado nao encontrado. Formulario nao alterado; revisar o checkbox manualmente."); process.exitCode=1; }
