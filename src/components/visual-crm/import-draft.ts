"use client";
import type {SavedDecision} from '@/lib/csv-import/lead-lifecycle.mjs';
export type ImportDraft={userId:string;file:Blob|null;filename:string;fileType:string;separator:string;mapping:Record<string,number>;batchId:string|null;decisions:Record<string,SavedDecision>;filter:string;search:string;page:number};
let connection:Promise<IDBDatabase>|null=null;
let writes:Promise<void>=Promise.resolve();
function db(){
 if(!connection)connection=new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('crm-orck-import-drafts',1);request.onupgradeneeded=()=>{request.result.createObjectStore('drafts',{keyPath:'key'});};request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();connection=null;};resolve(request.result);};request.onerror=()=>{connection=null;reject(Error('Armazenamento do rascunho indisponível.'));};request.onblocked=()=>reject(Error('Armazenamento bloqueado em outra aba.'));});
 return connection;
}
export function draftKey(userId:string){let tab=sessionStorage.getItem('crm-orck-import-tab');if(!tab){tab=crypto.randomUUID();sessionStorage.setItem('crm-orck-import-tab',tab);}return `${userId}:${tab}`;}
export async function loadDraft(key:string):Promise<ImportDraft|null>{
 await writes.catch(()=>{});const database=await db();
 return new Promise((resolve,reject)=>{const tx=database.transaction('drafts','readwrite'),store=tx.objectStore('drafts');let value:ImportDraft|null=null;const request=store.get(key);request.onsuccess=()=>{const row=request.result;if(row&&Date.now()-row.savedAt<7*86400000)value=row.value;};
 const cursor=store.openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(c){if(Date.now()-c.value.savedAt>7*86400000)c.delete();c.continue();}};
 tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(Error('Não foi possível recuperar o rascunho.'));tx.onabort=tx.onerror;});
}
export function saveDraft(key:string,value:ImportDraft){
 const next=writes.catch(()=>{}).then(async()=>{const database=await db();await new Promise<void>((resolve,reject)=>{const tx=database.transaction('drafts','readwrite'),store=tx.objectStore('drafts');if(value.file||value.batchId)store.put({key,value,savedAt:Date.now()});else store.delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(Error('Não foi possível salvar o rascunho neste navegador.'));tx.onabort=tx.onerror;});});writes=next;return next;
}
