"use client";
import {useEffect,useId,useRef} from 'react';
import type {ReactNode} from 'react';
import {FIELDS,LABELS} from '@/lib/csv-import/core.mjs';
import type {Values} from '@/lib/csv-import/core.mjs';
import u from './workspace.module.css';
export function RecordDialog({title,children,footer,onClose,busy=false}:{title:string;children:ReactNode;footer:ReactNode;onClose:()=>void;busy?:boolean}){
 const ref=useRef<HTMLDialogElement>(null),heading=useId();
 useEffect(()=>{const d=ref.current;if(d&&!d.open)d.showModal();return ()=>{if(d?.open)d.close();};},[]);
 return <dialog ref={ref} className={u.dialog} aria-labelledby={heading} aria-busy={busy} onCancel={e=>{e.preventDefault();if(!busy)onClose();}} onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}><header className={u.dialogHead}><h2 id={heading}>{title}</h2><button type="button" className={u.icon} aria-label="Fechar" disabled={busy} onClick={onClose}>×</button></header><div className={u.dialogBody}>{children}</div><footer className={u.dialogFoot}>{footer}</footer></dialog>;
}
export function RecordFields({values,onChange,disabled=false}:{values:Values;onChange:(values:Values)=>void;disabled?:boolean}){
 return <div className={u.formGrid}>{FIELDS.map(k=><label key={k} className={`${u.field} ${['location','notes'].includes(k)?u.full:''}`}>{LABELS[k]}{k==='name'?' *':''}{k==='notes'?<textarea rows={3} maxLength={2000} disabled={disabled} value={values[k as keyof Values]} onChange={e=>onChange({...values,[k]:e.target.value})}/>:<input maxLength={k==='location'?2000:600} disabled={disabled} required={k==='name'} value={values[k as keyof Values]} onChange={e=>onChange({...values,[k]:e.target.value})}/>}</label>)}</div>;
}
