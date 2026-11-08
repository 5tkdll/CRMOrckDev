import Link from "next/link";
import { getCompanyListing,type ListingFilters } from "@/server/companies/listing";
import { assessments } from "@/lib/companies/types";
import { safeHttpUrl } from "@/lib/companies/validation.mjs";
import { CrmIcon,type IconName } from "@/components/ui/crm-icon";
import styles from "./listing.module.css";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export default async function CompaniesPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const raw=await searchParams, filters:ListingFilters={};
  for(const key of ["q","assessment","contact","archive","site","page","segment","city","phone"] as const) if(typeof raw[key]==="string") filters[key]=raw[key] as string;
  const data=await getCompanyListing(filters), {items,total,page,pages,overview}=data;
  const [active,potential,missing,blocked]=overview;
  const metrics:{label:string;value:number;detail:string;icon:IconName;alert?:boolean}[]=[
    {label:"Empresas cadastradas",value:active,detail:"Cadastros ativos na base",icon:"business"},
    {label:"Potenciais clientes",value:potential,detail:active?`${(potential/active*100).toLocaleString("pt-BR",{maximumFractionDigits:1})}% da base ativa`:"Sem cadastros ativos",icon:"trending_up"},
    {label:"Site não identificado",value:missing,detail:"Sem site informado na base ativa",icon:"web_asset_off"},
    {label:"Não contatar",value:blocked,detail:"Restrições registradas na base ativa",icon:"block",alert:true},
  ];
  function href(patch:Partial<ListingFilters>) {
    const query=new URLSearchParams();
    for(const [k,v] of Object.entries({...filters,...patch})) if(v) query.set(k,v.slice(0,120));
    return `/empresas?${query}`;
  }
  function chip(label:string,icon:IconName,key:"site"|"phone"|"contact",value:string) {
    const selected=filters[key]===value;
    return <Link href={href({[key]:selected?"":value,page:"1"})} className={`${styles.chip} ${selected?styles.selected:""}`} aria-label={`${selected?"Remover":"Aplicar"} filtro ${label}`}><CrmIcon name={icon} size={14}/>{label}{selected&&<span aria-hidden="true">×</span>}</Link>;
  }
  return <section className={styles.page}>
    <div className={styles.titleRow}><div><p className="eyebrow">CRM · EMPRESAS</p><h1>Empresas</h1><p>Cadastro, avaliação comercial e acompanhamento da base.</p></div><Link href="/empresas/nova" className={styles.primary}><CrmIcon name="add" size={17}/>Nova empresa</Link></div>
    <section className={styles.metrics} aria-label="Indicadores da base ativa">{metrics.map(m=><div key={m.label} className={styles.metric}><div><span className={styles.metricLabel}>{m.label}</span><span className={`${styles.metricValue} ${m.alert?styles.danger:""}`}>{m.value.toLocaleString("pt-BR")}</span><span className={styles.metricDetail}>{m.detail}</span></div><span className={`${styles.metricIcon} ${m.alert?styles.dangerIcon:""}`}><CrmIcon name={m.icon}/></span></div>)}</section>
    <section className={styles.filterCard}><form method="get" action="/empresas">
      <div className={styles.searchRow}><label className={styles.search}><CrmIcon name="search"/><span className={styles.srOnly}>Buscar nome, telefone, documento ou segmento</span><input name="q" maxLength={100} defaultValue={filters.q??""} placeholder="Buscar por nome, telefone, documento ou segmento..."/></label><div className={styles.actions}><button className={styles.primary} type="submit">Buscar</button><Link href="/empresas" className={styles.secondary}>Limpar</Link><Link href="/importacoes" className={styles.secondary}><CrmIcon name="upload_file" size={17}/>Importações</Link><button type="button" disabled title="Exportação ainda não implementada" className={styles.secondary}>Exportar CSV · em breve</button></div></div>
      <div className={styles.filters}>
        <label>Segmento<select name="segment" defaultValue={filters.segment??""}><option value="">Todos os segmentos</option>{filters.segment&&!data.segments.includes(filters.segment)&&<option value={filters.segment}>{filters.segment}</option>}{data.segments.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
        <label>Cidade<select name="city" defaultValue={filters.city??""}><option value="">Todas as cidades</option>{filters.city&&!data.cities.includes(filters.city)&&<option value={filters.city}>{filters.city}</option>}{data.cities.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
        <label>Avaliação comercial<select name="assessment" defaultValue={filters.assessment??""}><option value="">Todas as avaliações</option>{Object.entries(assessments).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
        <label>Cadastro<select name="archive" defaultValue={filters.archive??"active"}><option value="active">Ativos</option><option value="archived">Arquivados</option><option value="all">Todos</option></select></label>
        <label>Contato<select name="contact" defaultValue={filters.contact??""}><option value="">Todos</option><option value="blocked">Não contatar</option><option value="unblocked">Sem restrição registrada</option></select></label>
        <label>Site<select name="site" defaultValue={filters.site??""}><option value="">Todos</option><option value="missing">Não identificado</option><option value="present">Informado</option></select></label>
        {filters.phone&&<input type="hidden" name="phone" value={filters.phone}/>}
        <button type="submit" className={styles.secondary}>Aplicar filtros</button>
      </div>
    </form><div className={styles.chips}>{chip("Site não identificado","web_asset_off","site","missing")}{chip("Com telefone","call","phone","yes")}{chip("Restrição: não contatar","block","contact","blocked")}</div></section>
    <section className={styles.tableCard}><div className={styles.tableScroll}><table className={styles.table}><caption className={styles.srOnly}>Empresas encontradas pelos filtros atuais</caption><thead><tr><th scope="col">Nome da empresa</th><th scope="col">Segmento &amp; localização</th><th scope="col">Telefone</th><th scope="col">Presença digital</th><th scope="col">Avaliação comercial</th><th scope="col">Restrição de contato</th><th scope="col">Cadastro</th><th scope="col">Ações</th></tr></thead><tbody>
      {items.map(c=>{const initials=c.name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();const web=c.website?safeHttpUrl(c.website):null, instagram=c.instagram?safeHttpUrl(c.instagram):null;
        return <tr key={c.id} className={c.doNotContact?styles.restrictedRow:undefined}><td><div className={styles.companyName}><span className={styles.initials}>{initials}</span><div><Link href={`/empresas/${c.id}`}>{c.name}</Link><span className={styles.shortId}>ID: {c.id.slice(0,8).toUpperCase()}</span>{c.archivedAt&&<span className={styles.archived}>Arquivado</span>}</div></div></td><td><span className={styles.segment}>{c.segment??"Não informado"}</span><span className={styles.location}><CrmIcon name="location_on" size={12}/>{[c.neighborhood,[c.city,c.state].filter(Boolean).join("/")].filter(Boolean).join(", ")||"Local não informado"}</span></td><td>{c.phoneOriginal?<span className={styles.phone}>{c.phoneOriginal}</span>:<span className={styles.muted}>Não informado</span>}</td><td><div className={styles.digital}>{web?<a href={web} target="_blank" rel="noopener noreferrer" className={styles.digitalLink}><CrmIcon name="open_in_new" size={13}/>Abrir site</a>:<span className={styles.siteMissing}><CrmIcon name="web_asset_off" size={13}/>Site não identificado</span>}{instagram&&<a href={instagram} target="_blank" rel="noopener noreferrer" className={styles.digitalLink}>Instagram</a>}</div></td><td><span className={`${styles.assessment} ${c.assessment==="POTENTIAL"?styles.potential:""}`}><span className={styles.dot}/>{assessments[c.assessment]}</span></td><td><span className={`${styles.contactBadge} ${c.doNotContact?styles.blocked:""}`}><CrmIcon name={c.doNotContact?"block":"help"} size={14}/>{c.doNotContact?"Não contatar":"Sem restrição registrada"}</span></td><td><span className={styles.date}>{new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo"}).format(c.createdAt)}</span></td><td><div className={styles.rowActions}><Link href={`/empresas/${c.id}`} className={styles.openButton}>Abrir<CrmIcon name="open_in_new" size={13}/></Link><Link href={`/empresas/${c.id}`} className={styles.iconButton} aria-label={`Editar ${c.name}`} title="Abrir para editar"><CrmIcon name="edit" size={15}/></Link></div></td></tr>;
      })}
      {!items.length&&<tr><td colSpan={8}><div className={styles.empty}><CrmIcon name="business" size={30}/><h2>Nenhuma empresa encontrada</h2><p>Cadastre um cliente ou ajuste os filtros.</p><Link href="/empresas/nova" className={styles.primary}>Novo cadastro</Link></div></td></tr>}
    </tbody></table></div><footer className={styles.pagination}><span>{total?`${(page-1)*20+1}–${Math.min(page*20,total)} de ${total}`:"0 resultados"} · 20 por página</span><nav aria-label="Paginação das empresas">{page>1?<Link href={href({page:String(page-1)})}>Anterior</Link>:<span aria-disabled="true">Anterior</span>}<span>Página {page} de {pages}</span>{page<pages?<Link href={href({page:String(page+1)})}>Próxima</Link>:<span aria-disabled="true">Próxima</span>}</nav></footer></section>
    <p className={styles.footnote}>Os indicadores acima consideram somente cadastros ativos, independentemente dos filtros. “Sem restrição registrada” não significa autorização de contato. “Site não identificado” não comprova ausência de site.</p>
  </section>;
}
