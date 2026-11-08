import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { requireUser } from "@/server/auth/session";
import { logout } from "@/app/login/actions";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="shell"><Sidebar /><div className="workspace">
    <header className="topbar">CRM ORCK DEV
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/conta">{user.name}</Link>
        <form action={logout}><button type="submit">Sair</button></form>
      </div>
    </header><main id="conteudo">{children}</main>
  </div></div>;
}
