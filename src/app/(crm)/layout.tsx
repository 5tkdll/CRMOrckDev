import { Sidebar } from "@/components/layout/sidebar";
import { CrmTopbar } from "@/components/layout/crm-topbar";
import { requireUser } from "@/server/auth/session";
import "./crm-shell.css";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export default async function CrmLayout({children}:{children:React.ReactNode}) {
  const user=await requireUser();
  return <div className="crm-shell"><a href="#conteudo" className="crm-skip">Pular para o conteúdo</a><Sidebar user={user}/><div className="crm-workspace"><CrmTopbar name={user.name}/><main id="conteudo" className="crm-main">{children}</main></div></div>;
}
