import test from "node:test";
import assert from "node:assert/strict";
import { parseCompany,normalizeWebsite,validId } from "../src/lib/companies/validation.mjs";
import { validCpf,validCnpj,formatCpf,formatCnpj,formatPhone,formatCep } from "../src/lib/companies/identity.mjs";
// Algorithm fixtures only; never used to seed client records.
const base={name:"Teste unitário",documentType:"CPF",documentNumber:"529.982.247-25",responsibleName:"Responsável de teste",responsibleCpf:"529.982.247-25"};
test("documentos e responsavel obrigatorios, CEP opcional",()=>{
  const r=parseCompany(base); assert.equal(r.ok,true); assert.equal(r.data.documentNumber,"52998224725"); assert.equal(r.data.postalCode,null);
  for(const name of ["name","documentNumber","responsibleName","responsibleCpf"]) assert.equal(parseCompany({...base,[name]:""}).ok,false);
});
test("CPF, CNPJ numerico e alfanumerico",()=>{
  assert.equal(validCpf(base.documentNumber),true); assert.equal(validCpf("11111111111"),false); assert.equal(validCpf("52998224724"),false); assert.equal(validCpf("529abc98224725"),false);
  assert.equal(validCnpj("11.222.333/0001-81"),true); assert.equal(validCnpj("12.ABC.345/01DE-35"),true); assert.equal(validCnpj("12.ABC.345/01DE-34"),false);
  assert.equal(validCnpj("00000000000000"),false);
});
test("responsavel pode usar mesmo CPF ou outro CPF",()=>{
  const same=parseCompany({...base,responsibleCpf:"",useClientCpf:"on"}); assert.equal(same.ok,true); assert.equal(same.data.responsibleCpf,"52998224725");
  const different=parseCompany({...base,responsibleCpf:"111.444.777-35"}); assert.equal(different.ok,true); assert.notEqual(different.data.responsibleCpf,different.data.documentNumber);
  assert.equal(parseCompany({...base,documentType:"CNPJ",documentNumber:"11.222.333/0001-81",useClientCpf:"on"}).ok,false);
});
test("mascaras removem letras e formatam",()=>{
  assert.equal(formatCpf("529a98224725"),"529.982.247-25"); assert.equal(formatPhone("62999991234abc"),"(62) 99999-1234"); assert.equal(formatPhone("6233331234"),"(62) 3333-1234"); assert.equal(formatCep("74000000"),"74000-000"); assert.equal(formatCnpj("12ABC34501DE35"),"12.ABC.345/01DE-35");
});
test("site sem protocolo e URLs perigosas",()=>{
  assert.equal(normalizeWebsite("empresa.com.br"),"https://empresa.com.br/"); assert.equal(normalizeWebsite("www.empresa.com.br"),"https://www.empresa.com.br/"); assert.equal(normalizeWebsite("http://empresa.com.br"),"http://empresa.com.br/");
  for(const v of ["javascript:alert(1)","ftp://empresa.com.br","https://u:p@empresa.com.br","empresa com br"]) assert.equal(normalizeWebsite(v),null);
});
test("telefone rejeita letras no servidor, CEP invalido bloqueia mas vazio permite",()=>{
  assert.equal(parseCompany({...base,phoneOriginal:"62abc999991234"}).ok,false); assert.equal(parseCompany({...base,phoneOriginal:"(62) 99999-1234"}).ok,true); assert.equal(parseCompany({...base,postalCode:"123"}).ok,false); assert.equal(parseCompany({...base,postalCode:""}).ok,true); assert.equal(parseCompany({...base,postalCode:"74000-000"}).data.postalCode,"74000000");
});
test("restricao independe de avaliacao e exige motivo",()=>{
  assert.equal(parseCompany({...base,doNotContact:"on"}).ok,false); const r=parseCompany({...base,doNotContact:"on",doNotContactReason:"Pedido do cliente",assessment:"POTENTIAL"}); assert.equal(r.ok,true); assert.equal(r.data.doNotContact,true); assert.equal(r.data.assessment,"POTENTIAL");
});
test("UF, limites, IDs e arquivos invalidos",()=>{
  for(const bad of [{state:"XX"},{assessment:"???"},{name:"x".repeat(201)},{name:{file:true}}]) assert.equal(parseCompany({...base,...bad}).ok,false);
  assert.equal(validId("abc"),false); assert.equal(validId("110e8400-e29b-41d4-a716-446655440000"),true);
});
