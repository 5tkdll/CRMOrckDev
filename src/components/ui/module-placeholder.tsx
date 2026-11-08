type Props = { title: string; description: string; items: string[] };
export function ModulePlaceholder({ title, description, items }: Props) {
 return <><div className="page-heading"><p className="eyebrow">CRM ORCK DEV</p><h1>{title}</h1><p>{description}</p></div><section className="panel"><span className="badge">Planejado — não implementado</span><h2>Funcionalidades previstas</h2><ul className="feature-list">{items.map(item => <li key={item}>{item}</li>)}</ul><p className="muted">Esta tela organiza o escopo. Nenhum dado está sendo salvo ou consultado.</p></section></>;
}
