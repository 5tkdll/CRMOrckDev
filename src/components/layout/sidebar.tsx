"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="sidebar"><Link className="brand" href="/dashboard">ORCK DEV<small>CRM comercial</small></Link><nav aria-label="Menu principal">{navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}</nav><p className="sidebar-note">Pacote inicial · sem dados reais</p></aside>;
}
