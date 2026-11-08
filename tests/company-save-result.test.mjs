import test from "node:test";
import assert from "node:assert/strict";
import { readCompanySaveResult } from "../src/lib/companies/save-result.mjs";
const id="110e8400-e29b-41d4-a716-446655440000";
test("criacao: devolve ID confirmado sem variavel savedId",()=>{assert.deepEqual(readCompanySaveResult({ok:true,id}),{ok:true,id});});
test("edicao: preserva ID retornado para redirecionamento",()=>{const r=readCompanySaveResult({ok:true,id});assert.equal(r.id,id);});
test("validacao: devolve estado sem tratar como sucesso",()=>{const state={message:"Revise",errors:{documentNumber:"Invalido"}};assert.deepEqual(readCompanySaveResult({ok:false,state}),{ok:false,state});});
test("retorno incompleto nao confirma gravacao",()=>{for(const value of [null,{}, {ok:true},{ok:true,id:""},{id},{ok:false,state:{}}]) assert.throws(()=>readCompanySaveResult(value));});
