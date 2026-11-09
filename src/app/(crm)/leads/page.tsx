import Link from "next/link";
import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { CrmIcon, type IconName } from "@/components/ui/crm-icon";
import { LeadsTable } from "@/components/visual-crm/leads-table";
import type { LeadItem } from "@/components/visual-crm/leads-table";
import {
    activeLeads,
    missingWebsite,
    parseLeadFilters,
    leadWhere,
    leadUrl,
} from "@/lib/leads-view.mjs";
import listing from "../empresas/listing.module.css";
import presentation from "./leads-presentation.module.css";

export const dynamic = "force-dynamic";

type Params = Record<string, string | string[] | undefined>;

export default async function LeadsPage({
    searchParams,
}: {
    searchParams: Promise<Params>;
}) {
    await requireUser();
    const filters = parseLeadFilters(await searchParams);
    const where = leadWhere(filters);

    try {
        const db = getDb();
        const [
            total,
            active,
            potential,
            withoutWebsite,
            blocked,
            deleted,
            batches,
            segmentRows,
        ] = await Promise.all([
            db.lead.count({ where }),
            db.lead.count({ where: activeLeads }),
            db.lead.count({
                where: { AND: [activeLeads, { assessment: "POTENTIAL" }] },
            }),
            db.lead.count({
                where: { AND: [activeLeads, missingWebsite] },
            }),
            db.lead.count({
                where: { AND: [activeLeads, { doNotContact: true }] },
            }),
            db.lead.count({
                where: { assessment: { startsWith: "DELETED:" } },
            }),
            db.csvBatch.findMany({
                where: { entries: { some: { lead: { isNot: null } } } },
                orderBy: { createdAt: "desc" },
                take: 100,
                select: { id: true, filename: true },
            }),
            db.lead.findMany({
                where: { AND: [activeLeads, { segment: { not: null } }] },
                select: { segment: true },
                distinct: ["segment"],
                orderBy: { segment: "asc" },
            }),
        ]);
        const pages = Math.max(1, Math.ceil(total / 25));
        const current = Math.min(filters.page, pages);
        const leads = await db.lead.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            skip: (current - 1) * 25,
            take: 25,
            include: {
                entry: {
                    include: {
                        batch: { select: { filename: true, id: true } },
                    },
                },
            },
        });
        const rows: LeadItem[] = leads.map((lead) => ({
            id: lead.id,
            version: lead.updatedAt.toISOString(),
            createdAt: lead.createdAt.toISOString(),
            values: {
                name: lead.name,
                phone: lead.phoneOriginal ?? "",
                instagram: lead.instagram ?? "",
                website: lead.website ?? "",
                location: lead.location ?? "",
                segment: lead.segment ?? "",
                rating: lead.googleRating === null ? "" : String(lead.googleRating),
                sourceUrl: lead.sourceUrl ?? "",
                researchedAt: lead.researchedAt ?? "",
                notes: lead.notes ?? "",
            },
            websiteUrl: lead.websiteUrl ?? "",
            instagramUrl: lead.instagramUrl ?? "",
            websiteKind: lead.websiteKind,
            phoneValid: !!lead.phoneNormalized,
            rating: lead.googleRating,
            needsResearch: lead.needsResearch,
            assessment: lead.assessment,
            doNotContact: lead.doNotContact,
            doNotContactReason: lead.doNotContactReason ?? "",
            filename: lead.entry.batch.filename,
            line: lead.entry.line,
            raw: JSON.stringify(lead.entry.raw, null, 2),
            batchId: lead.entry.batch.id,
        }));
        const segments = segmentRows
            .map((row) => row.segment)
            .filter((segment): segment is string => !!segment);
        const percentage = active
            ? `${(potential / active * 100).toLocaleString("pt-BR", {
                maximumFractionDigits: 1,
            })}% da base ativa`
            : "Sem leads ativos";
        const cards: {
            label: string;
            value: number;
            detail: string;
            href: string;
            icon: IconName;
            alert?: boolean;
        }[] = [
            {
                label: "Leads ativos",
                value: active,
                detail: "Cadastros ativos na prospecção",
                href: "/leads",
                icon: "business",
            },
            {
                label: "Potenciais clientes",
                value: potential,
                detail: percentage,
                href: "/leads?assessment=POTENTIAL",
                icon: "trending_up",
            },
            {
                label: "Site não informado",
                value: withoutWebsite,
                detail: "Sem site informado na base ativa",
                href: "/leads?site=missing",
                icon: "web_asset_off",
            },
            {
                label: "Não contatar",
                value: blocked,
                detail: "Restrições registradas na base ativa",
                href: "/leads?contact=blocked",
                icon: "block",
                alert: true,
            },
        ];

        function chip(
            label: string,
            icon: IconName,
            key: "site" | "group" | "contact",
            value: string,
        ) {
            const selected = filters[key] === value;

            return (
                <Link
                    href={leadUrl(filters, { [key]: selected ? "" : value, page: 1 })}
                    className={`${listing.chip} ${selected ? listing.selected : ""}`}
                    aria-label={`${selected ? "Remover" : "Aplicar"} filtro ${label}`}
                >
                    <CrmIcon name={icon} size={14} />
                    {label}
                    {selected && <span aria-hidden="true">×</span>}
                </Link>
            );
        }

        return (
            <section className={`${listing.page} ${presentation.page}`}>
                <div className={listing.titleRow}>
                    <div>
                        <p className="eyebrow">CRM · LEADS</p>
                        <h1>Leads</h1>
                        <p>Qualificação comercial e acompanhamento da prospecção.</p>
                    </div>
                    <Link
                        href="/leads/novo"
                        className={listing.primary}
                        title="Cadastro manual ainda visual, sem gravação"
                    >
                        <CrmIcon name="add" size={17} />
                        Novo lead · visual
                    </Link>
                </div>

                <section className={listing.metrics} aria-label="Indicadores da base ativa">
                    {cards.map((card) => (
                        <Link
                            key={card.label}
                            className={`${listing.metric} ${presentation.metricLink}`}
                            href={card.href}
                            aria-label={`${card.label}: ${card.value}. Filtrar leads.`}
                        >
                            <div>
                                <span className={listing.metricLabel}>{card.label}</span>
                                <span
                                    className={`${listing.metricValue} ${card.alert ? listing.danger : ""}`}
                                >
                                    {card.value.toLocaleString("pt-BR")}
                                </span>
                                <span className={listing.metricDetail}>{card.detail}</span>
                            </div>
                            <span
                                className={`${listing.metricIcon} ${card.alert ? listing.dangerIcon : ""}`}
                            >
                                <CrmIcon name={card.icon} />
                            </span>
                        </Link>
                    ))}
                </section>

                <section className={listing.filterCard}>
                    <form method="get" action="/leads">
                        <div className={listing.searchRow}>
                            <label className={listing.search}>
                                <CrmIcon name="search" />
                                <span className={listing.srOnly}>
                                    Buscar nome, telefone, segmento ou localização
                                </span>
                                <input
                                    name="q"
                                    defaultValue={filters.q}
                                    maxLength={200}
                                    placeholder="Buscar por nome, telefone, segmento ou localização..."
                                />
                            </label>
                            <div className={listing.actions}>
                                <button className={listing.primary} type="submit">
                                    Buscar
                                </button>
                                <Link className={listing.secondary} href="/leads">
                                    Limpar
                                </Link>
                                <Link className={listing.secondary} href="/importacoes">
                                    <CrmIcon name="upload_file" size={17} />
                                    Importações
                                </Link>
                                <button
                                    className={listing.secondary}
                                    type="button"
                                    disabled
                                    title="Exportação ainda não implementada"
                                >
                                    Exportar CSV · em breve
                                </button>
                            </div>
                        </div>

                        <div className={listing.filters}>
                            <label>
                                Segmento
                                <select name="segment" defaultValue={filters.segment}>
                                    <option value="">Todos os segmentos</option>
                                    {filters.segment && !segments.includes(filters.segment) && (
                                        <option value={filters.segment}>{filters.segment}</option>
                                    )}
                                    {segments.map((segment) => (
                                        <option key={segment} value={segment}>{segment}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Avaliação comercial
                                <select name="assessment" defaultValue={filters.assessment}>
                                    <option value="">Todas as avaliações</option>
                                    <option value="UNREVIEWED">Pendente de análise</option>
                                    <option value="POTENTIAL">Potencial cliente</option>
                                    <option value="NO_INTEREST">Sem interesse</option>
                                </select>
                            </label>
                            <label>
                                Registros
                                <select name="group" defaultValue={filters.group}>
                                    <option value="">Ativos</option>
                                    <option value="phone">Com telefone válido</option>
                                    <option value="research">Sem canal de contato válido</option>
                                    <option value="deleted">Excluídos ({deleted})</option>
                                </select>
                            </label>
                            <label>
                                Contato
                                <select name="contact" defaultValue={filters.contact}>
                                    <option value="">Todos</option>
                                    <option value="blocked">Não contatar</option>
                                    <option value="unblocked">Sem restrição registrada</option>
                                </select>
                            </label>
                            <label>
                                Site
                                <select name="site" defaultValue={filters.site}>
                                    <option value="">Todos</option>
                                    <option value="missing">Campo de site vazio</option>
                                    <option value="present">Com link informado</option>
                                </select>
                            </label>
                            <label>
                                Lote
                                <select name="batch" defaultValue={filters.batch}>
                                    <option value="">Todos os lotes</option>
                                    {batches.map((batch) => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.filename}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button className={listing.secondary} type="submit">
                                Aplicar filtros
                            </button>
                        </div>
                    </form>
                    <div className={listing.chips}>
                        {chip("Site não informado", "web_asset_off", "site", "missing")}
                        {chip("Com telefone", "call", "group", "phone")}
                        {chip("Restrição: não contatar", "block", "contact", "blocked")}
                    </div>
                </section>

                <section className={listing.tableCard}>
                    <LeadsTable rows={rows} />
                    <footer className={listing.pagination}>
                        <span>
                            {total
                                ? `${(current - 1) * 25 + 1}–${Math.min(current * 25, total)} de ${total}`
                                : "0 resultados"}
                            {" · 25 por página"}
                        </span>
                        <nav aria-label="Paginação dos leads">
                            {current > 1 ? (
                                <Link href={leadUrl(filters, { page: current - 1 })}>
                                    Anterior
                                </Link>
                            ) : (
                                <span aria-disabled="true">Anterior</span>
                            )}
                            <span>Página {current} de {pages}</span>
                            {current < pages ? (
                                <Link href={leadUrl(filters, { page: current + 1 })}>
                                    Próxima
                                </Link>
                            ) : (
                                <span aria-disabled="true">Próxima</span>
                            )}
                        </nav>
                    </footer>
                </section>

                <p className={listing.footnote}>
                    Os indicadores consideram somente leads ativos, independentemente
                    dos filtros. Sem restrição registrada não significa autorização
                    de contato. Site vazio significa site não informado no cadastro.
                </p>
            </section>
        );
    } catch {
        return (
            <section className={`${listing.page} ${presentation.page}`}>
                <div className={listing.titleRow}>
                    <div>
                        <p className="eyebrow">CRM · LEADS</p>
                        <h1>Leads</h1>
                    </div>
                </div>
                <div className={listing.filterCard} role="alert">
                    Não foi possível consultar os leads. Confira conexão,
                    permissões e a aplicação do Pacote 19.
                </div>
                <Link className={listing.secondary} href="/importacoes">
                    Voltar às importações
                </Link>
            </section>
        );
    }
}
