"use client";
import {useEffect,useState,useSyncExternalStore} from "react";
import {createPortal} from "react-dom";
import {usePathname} from "next/navigation";
type Theme="light"|"dark";
const key="crm-orck-theme",eventName="crm-theme-change";
function preference():Theme|null{try{const v=window.localStorage.getItem(key);return v==="light"||v==="dark"?v:null;}catch{return null;}}
function systemTheme():Theme{return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
function snapshot():Theme{return document.documentElement.dataset.crmTheme==="dark"?"dark":"light";}
function apply(theme:Theme){document.documentElement.dataset.crmTheme=theme;document.documentElement.style.colorScheme=theme;}
function subscribe(notify:()=>void){
 const media=window.matchMedia("(prefers-color-scheme: dark)");
 const systemChange=()=>{if(!preference()){apply(systemTheme());notify();}};
 const storageChange=(e:StorageEvent)=>{if(e.key===key||e.key===null){apply(preference()??systemTheme());notify();}};
 window.addEventListener(eventName,notify);window.addEventListener("storage",storageChange);media.addEventListener("change",systemChange);
 return ()=>{window.removeEventListener(eventName,notify);window.removeEventListener("storage",storageChange);media.removeEventListener("change",systemChange);};
}
function ThemeButton(){
 const theme=useSyncExternalStore(subscribe,snapshot,():Theme=>"light"),dark=theme==="dark";
 function toggle(){const next:Theme=snapshot()==="dark"?"light":"dark";apply(next);try{window.localStorage.setItem(key,next);}catch{}window.dispatchEvent(new Event(eventName));}
 const label=dark?"Ativar modo claro":"Ativar modo escuro";
 return <button type="button" className="crm-theme-toggle" onClick={toggle} aria-label={label} aria-pressed={dark} title={label}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{dark?<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>:<path d="M20.6 13.2A9 9 0 0 1 10.8 3.4 9 9 0 1 0 20.6 13.2Z"/>}</svg><span>{dark?"Modo claro":"Modo escuro"}</span></button>;
}

export function ThemeToggle(){
 const pathname=usePathname(),[target,setTarget]=useState<HTMLElement|null>(null);
 useEffect(()=>{setTarget(null);const locate=()=>{const node=document.querySelector<HTMLElement>(".crm-topbar-actions");if(!node)return false;setTarget(node);return true;};if(locate())return;const observer=new MutationObserver(()=>{if(locate())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});return ()=>observer.disconnect();},[pathname]);
 return target?createPortal(<ThemeButton/>,target):null;
}
