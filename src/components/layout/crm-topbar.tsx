"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CrmIcon } from "@/components/ui/crm-icon";
import { logout } from "@/app/login/actions";
const labels:Record<string,string>={dashboard:"Visão Geral",empresas:"Empresas",oportunidades:"Oportunidades",tarefas:"Tarefas",projetos:"Projetos",servicos:"Domínios & Hospedagem",importacoes:"Importações CSV",planos:"Planos Comerciais",configuracoes:"Configurações",conta:"Minha conta"};
export function CrmTopbar({name}:{name:string}) {
  const pathname=usePathname(), parts=pathname.split("/").filter(Boolean), first=parts[0]??"dashboard";
  const sub=first==="empresas"?(parts[1]==="nova"?"Novo cadastro":parts[1]?"Cadastro":"Listagem"):null;
  return <header className="crm-topbar"><nav aria-label="Localização" className="crm-breadcrumb"><span>CRM</span><CrmIcon name="chevron_right" size={14}/><Link href={`/${first}`}>{labels[first]??"CRM"}</Link>{sub&&<><CrmIcon name="chevron_right" size={14}/><span className="crm-breadcrumb-current">{sub}</span></>}</nav>
    <div className="crm-topbar-actions"><span className="crm-runtime-label"><CrmIcon name="database" size={17}/>Ambiente local</span><Link className="crm-user-link" href="/conta">{name}</Link><form action={logout}><button type="submit" className="crm-topbar-button"><CrmIcon name="logout" size={16}/>Sair</button></form><Link href="/empresas/nova" className="crm-topbar-create"><CrmIcon name="add" size={16}/>Nova empresa</Link></div>
  </header>;
}
