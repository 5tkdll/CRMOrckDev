import { canonicalDocument, validCpf, validCnpj, digits } from "./identity.mjs";
const limits = { name:200, segment:120, address:300, neighborhood:120, city:120, state:2, phoneOriginal:40, instagram:300, website:1000, assessment:30, doNotContact:3, doNotContactReason:1000, notes:10000, documentType:4, documentNumber:30, responsibleName:200, responsibleCpf:20, postalCode:10, addressNumber:30, addressComplement:200, useClientCpf:3 };
const states = new Set("AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "));
const assessments = new Set(["UNREVIEWED", "POTENTIAL", "HAS_WEBSITE", "INSUFFICIENT_DATA", "DUPLICATE", "DISCARDED"]);
export function validId(value) { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value); }
export function normalizePhone(value) { return digits(value); }
export function safeHttpUrl(value) { try { const u=new URL(value); return ["http:","https:"].includes(u.protocol) && !!u.hostname && !u.username && !u.password ? u.toString() : null; } catch { return null; } }
export function normalizeWebsite(value) {
  const v=String(value ?? "").trim();
  if (!v || /\s/.test(v) || (/^[a-z][a-z0-9+.-]*:/i.test(v) && !/^https?:\/\//i.test(v))) return null;
  const normalized=safeHttpUrl(/^https?:\/\//i.test(v) ? v : `https://${v}`);
  if (!normalized) return null;
  const u=new URL(normalized);
  return u.hostname.includes(".") ? normalized : null;
}
export function parseCompany(raw) {
  const values={}, errors={};
  for (const field of Object.keys(limits)) {
    const v=raw[field] ?? (field === "assessment" ? "UNREVIEWED" : field === "documentType" ? "CNPJ" : "");
    values[field]=typeof v === "string" ? v.trim() : "";
    if (typeof v !== "string") errors[field]="Valor inválido.";
    if (values[field].length>limits[field]) errors[field]=`Limite de ${limits[field]} caracteres.`;
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(values[field])) errors[field]="Caracteres de controle não permitidos.";
  }
  if (!values.name) errors.name="Informe o nome do cliente / empresa.";
  values.state=values.state.toUpperCase();
  if (values.state && !states.has(values.state)) errors.state="UF inválida.";
  if (!assessments.has(values.assessment)) errors.assessment="Avaliação inválida.";
  if (!["CPF","CNPJ"].includes(values.documentType)) errors.documentType="Selecione CPF ou CNPJ.";
  if (values.documentType === "CPF" ? !validCpf(values.documentNumber) : !validCnpj(values.documentNumber)) errors.documentNumber="Documento obrigatório: confira o formato e os dígitos verificadores.";
  if (!values.responsibleName) errors.responsibleName="Informe o nome do responsável.";
  if (!["","on"].includes(values.useClientCpf)) errors.useClientCpf="Opção inválida.";
  if (values.useClientCpf === "on") {
    if (values.documentType !== "CPF") errors.useClientCpf="Esta opção só pode ser usada quando o cliente usa CPF.";
    else values.responsibleCpf=values.documentNumber;
  }
  if (!validCpf(values.responsibleCpf)) errors.responsibleCpf="Informe um CPF válido para o responsável.";
  if (!["","on"].includes(values.doNotContact)) errors.doNotContact="Valor inválido.";
  if (values.doNotContact === "on" && !values.doNotContactReason) errors.doNotContactReason="Informe o motivo da restrição.";
  const phone=digits(values.phoneOriginal);
  if (values.phoneOriginal && (!/^[\d() .+\-]+$/.test(values.phoneOriginal) || ![10,11].includes(phone.length))) errors.phoneOriginal="Informe DDD e telefone: 10 dígitos para fixo ou 11 para celular, sem DDI.";
  if (values.postalCode && (!/^[\d\-\s]+$/.test(values.postalCode) || digits(values.postalCode).length !== 8)) errors.postalCode="CEP deve ter 8 dígitos, ou ficar vazio.";
  const website=values.website ? normalizeWebsite(values.website) : null;
  if (values.website && !website) errors.website="Informe um domínio ou uma URL http/https válida, sem credenciais.";
  let instagram=null;
  if(values.instagram) {
    const handle=values.instagram.replace(/^@/, "");
    if(/^[A-Za-z0-9._]{1,30}$/.test(handle)) instagram=`https://www.instagram.com/${handle}/`;
    else {
      const url=normalizeWebsite(values.instagram);
      if(url) { const u=new URL(url), parts=u.pathname.split("/").filter(Boolean); if(["instagram.com","www.instagram.com"].includes(u.hostname) && parts.length===1 && /^[A-Za-z0-9._]{1,30}$/.test(parts[0]) && !["p","reel","reels","stories","explore","accounts","direct"].includes(parts[0].toLowerCase())) instagram=`https://www.instagram.com/${parts[0]}/`; }
      if(!instagram) errors.instagram="Informe @perfil ou a URL de um perfil do Instagram.";
    }
  }
  if(Object.keys(errors).length) return {ok:false, values, errors};
  const nullable=k=>values[k] || null;
  return {ok:true, values, data:{ name:values.name, segment:nullable("segment"), address:nullable("address"), neighborhood:nullable("neighborhood"), city:nullable("city"), state:nullable("state"), phoneOriginal:nullable("phoneOriginal"), phoneNormalized:phone || null, instagram, website, assessment:values.assessment, doNotContact:values.doNotContact === "on", doNotContactReason:nullable("doNotContactReason"), notes:nullable("notes"), documentType:values.documentType, documentNumber:canonicalDocument(values.documentNumber), responsibleName:values.responsibleName, responsibleCpf:canonicalDocument(values.responsibleCpf), postalCode:digits(values.postalCode) || null, addressNumber:nullable("addressNumber"), addressComplement:nullable("addressComplement") }};
}
