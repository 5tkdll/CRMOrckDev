import { Sidebar } from "@/components/layout/sidebar";
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <div className="shell"><Sidebar /><div className="workspace"><header className="topbar">CRM ORCK DEV <span>Ambiente inicial de desenvolvimento</span></header><main id="conteudo">{children}</main></div></div>;
}
