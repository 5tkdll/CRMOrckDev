const fields=['name','phone','instagram','website','location','segment','rating','sourceUrl','researchedAt','notes'];
export function recordKey(values){
 if(!values||typeof values!=='object')return '';
 const v=Object.fromEntries(fields.map(k=>[k,String(values[k]??'').trim()]));
 if(!v.name||!['phone','instagram','website','location'].some(k=>v[k]))return '';
 return JSON.stringify(fields.map(k=>v[k]));
}
export function classifyRows(rows,existing=[]){
 const known=new Map();
 for(const c of existing){if(c.kind==='COMPANY')continue;const key=c.recordKey??recordKey(c.entryValues);if(key&&!known.has(key))known.set(key,c.id);}
 return rows.map(r=>{const key=recordKey(r.values);const own=r.lead?.id??null;const other=key?known.get(key)??null:null;return {...r,locked:!!(own||other),existingLeadId:own??other,alreadyStatus:own?'IMPORTED':other?'EXISTS':null};});
}
export function planSelection(rows,selectedIds,existing=[]){
 const classified=classifyRows(rows,existing),wanted=new Set(selectedIds),seen=new Map(),create=[],duplicates=[],already=[];
 for(const r of classified){if(!wanted.has(r.id))continue;if(r.locked){already.push(r);continue;}const key=recordKey(r.values);if(key&&seen.has(key)){duplicates.push({row:r,sourceId:seen.get(key)});continue;}create.push(r);if(key)seen.set(key,r.id);}
 return {create,duplicates,already};
}
export function summarizeRows(rows){const imported=rows.filter(r=>r.alreadyStatus==='IMPORTED').length,existing=rows.filter(r=>r.alreadyStatus==='EXISTS').length;return {imported,existing,remaining:rows.length-imported-existing,status:rows.every(r=>r.locked)?'COMPLETED':'REVIEWING'};}
