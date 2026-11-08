import test from "node:test";
import assert from "node:assert/strict";
import {parseCompany} from "../src/lib/companies/validation.mjs";
function testCpf(){let s="123456789";for(const len of [9,10]){let sum=0;for(let i=0;i<len;i++)sum+=Number(s[i])*(len+1-i);const r=sum*10%11;s+=r===10?0:r;}return s;}
const base={name:"Teste unitário sem gravação",documentType:"CPF",documentNumber:testCpf(),responsibleName:"Responsável de teste",responsibleCpf:testCpf(),assessment:"UNREVIEWED",addressComplement:"Bloco B"};
test("parser grava numero de 5 digitos e preserva complemento",()=>{const r=parseCompany({...base,addressNumber:"00123"});assert.equal(r.ok,true);assert.equal(r.data.addressNumber,"00123");assert.equal(r.data.addressComplement,"Bloco B");});
test("parser rejeita letras, sinais e mais de 5 digitos",()=>{for(const n of ["abc","123456","-12","1.5"]){const r=parseCompany({...base,addressNumber:n});assert.equal(r.ok,false);assert.ok(r.errors.addressNumber);}});
test("parser aceita S/N sem mexer no complemento",()=>{const r=parseCompany({...base,addressNumber:"S/N"});assert.equal(r.ok,true);assert.equal(r.data.addressNumber,"S/N");assert.equal(r.data.addressComplement,"Bloco B");});
test("numero e CEP continuam opcionais",()=>{const r=parseCompany(base);assert.equal(r.ok,true);assert.equal(r.data.addressNumber,null);assert.equal(r.data.postalCode,null);});
test("validacao de documento permanece ativa",()=>{const r=parseCompany({...base,documentNumber:"00000000000"});assert.equal(r.ok,false);assert.ok(r.errors.documentNumber);});
