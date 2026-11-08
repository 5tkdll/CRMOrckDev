import { NextResponse } from "next/server";
import { currentUser } from "@/server/auth/session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const globalLimits=globalThis as unknown as { cepLimits?: Map<string,{count:number;until:number}> };
const limits=globalLimits.cepLimits ??= new Map<string,{count:number;until:number}>();
const headers={"Cache-Control":"private, no-store"};
function response(body: object,status=200) { return NextResponse.json(body,{status,headers}); }
export async function GET(_request: Request, {params}: {params:Promise<{cep:string}>}) {
  try {
    const user=await currentUser();
    if(!user) return response({error:"Sessão necessária."},401);
    const {cep}=await params;
    if(!/^\d{8}$/.test(cep)) return response({error:"Informe oito dígitos de CEP."},400);
    const now=Date.now();
    for(const [k,v] of limits) if(v.until<=now) limits.delete(k);
    let bucket=limits.get(user.id);
    if(!bucket) { if(limits.size>=1000) return response({error:"Consulta temporariamente indisponível."},429); bucket={count:0,until:now+60000}; limits.set(user.id,bucket); }
    if(bucket.count>=30) return response({error:"Muitas consultas. Aguarde um minuto."},429);
    bucket.count++;
    const upstream=await fetch(`https://viacep.com.br/ws/${cep}/json/`,{cache:"no-store",signal:AbortSignal.timeout(5000),redirect:"error"});
    if(!upstream.ok) return response({error:"Serviço de CEP indisponível. Preencha manualmente."},502);
    const data=await upstream.json();
    if(data.erro) return response({error:"CEP não encontrado. Você pode preencher o endereço manualmente."},404);
    if(typeof data.cep!=="string" || data.cep.replace(/\D/g,"")!==cep || typeof data.localidade!=="string" || typeof data.uf!=="string" || !/^[A-Z]{2}$/.test(data.uf)) return response({error:"Resposta de CEP inválida. Preencha manualmente."},502);
    const text=(v:unknown,max:number)=>typeof v==="string" ? v.slice(0,max) : "";
    return response({cep,address:text(data.logradouro,300),neighborhood:text(data.bairro,120),city:text(data.localidade,120),state:data.uf});
  } catch { return response({error:"Não foi possível consultar o CEP. Preencha manualmente ou tente novamente."},503); }
}
