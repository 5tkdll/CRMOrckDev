export const ASSESSMENTS=['UNREVIEWED','POTENTIAL','HAS_WEBSITE','INSUFFICIENT_DATA','DUPLICATE','DISCARDED'];
export const VALUE_FIELDS=['name','phone','instagram','website','location','segment','rating','sourceUrl','researchedAt','notes'];
export function isDeleted(value){return typeof value==='string'&&value.startsWith('DELETED:');}
export function markDeleted(value){return isDeleted(value)?value:'DELETED:'+(ASSESSMENTS.includes(value)?value:'UNREVIEWED');}
export function restoreAssessment(value){const old=isDeleted(value)?value.slice(8):value;return ASSESSMENTS.includes(old)?old:'UNREVIEWED';}
export function validateEdit(payload){
 if(typeof payload!=='string'||payload.length>20000)throw Error('Dados inválidos ou muito longos.');
 let input;try{input=JSON.parse(payload);}catch{throw Error('Dados inválidos.');}
 if(!input||typeof input!=='object'||Array.isArray(input)||!input.values||Array.isArray(input.values))throw Error('Dados inválidos.');
 const values={};
 for(const k of VALUE_FIELDS){const value=input.values[k];if(typeof value!=='string'||value.length>(['notes','location'].includes(k)?2000:600))throw Error('Campo inválido: '+k);values[k]=value.trim();}
 if(!values.name)throw Error('Informe o nome do lead.');
 if(!ASSESSMENTS.includes(input.assessment))throw Error('Avaliação inválida.');
 if(typeof input.version!=='string'||!Number.isFinite(Date.parse(input.version)))throw Error('Reabra o registro para atualizar a versão.');
 return {values,assessment:input.assessment,version:input.version};
}
export function restoreSelection(rows,saved={}){return Object.fromEntries(rows.map(r=>[r.id,{selected:!r.locked&&(typeof saved[r.id]?.selected==='boolean'?saved[r.id].selected:!r.errors.length&&!r.conflicts.length),allowDuplicate:!r.locked&&saved[r.id]?.allowDuplicate===true,reason:typeof saved[r.id]?.reason==='string'?saved[r.id].reason:'',values:Object.fromEntries(VALUE_FIELDS.map(k=>[k,String(r.data[k]??'')]))} ]));}
