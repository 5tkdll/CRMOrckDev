import Link from "next/link";
import {
    getCompanyListing,
    type ListingFilters,
} from "@/server/companies/listing";
import { safeHttpUrl } from "@/lib/companies/validation.mjs";
import { CrmIcon } from "@/components/ui/crm-icon";
import styles from "./listing.module.css";
import clean from "./listing-clean.module.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const raw = await searchParams;
    const filters: ListingFilters = {};

    for (const key of [
        "q",
        "archive",
        "page",
        "segment",
        "city",
        "phone",
    ] as const) {
        const value = raw[key];

        if (typeof value === "string") {
            filters[key] = value.slice(0, key === "q" ? 100 : 120);
        }
    }

    const data = await getCompanyListing(filters);
    const { items, total, page, pages, overview } = data;
    const [active] = overview;
    const hasPhoneFilter = filters.phone === "yes";

    function href(patch: Partial<ListingFilters>) {
        const query = new URLSearchParams();

        for (const [key, value] of Object.entries({ ...filters, ...patch })) {
            if (value) {
                query.set(key, value.slice(0, 120));
            }
        }

        return `/empresas?${query}`;
    }

    return (
        <section className={`${styles.page} ${clean.page}`}>
            <div className={styles.titleRow}>
                <div>
                    <p className="eyebrow">CRM · EMPRESAS</p>
                    <h1>Empresas</h1>
                    <p>Cadastro completo, contatos e dados das empresas.</p>
                </div>
                <Link href="/empresas/nova" className={styles.primary}>
                    <CrmIcon name="add" size={17} />
                    Nova empresa
                </Link>
            </div>

            <section
                className={`${styles.metrics} ${clean.metrics}`}
                aria-label="Indicadores cadastrais"
            >
                <div className={styles.metric}>
                    <div>
                        <span className={styles.metricLabel}>
                            Empresas cadastradas
                        </span>
                        <span className={styles.metricValue}>
                            {active.toLocaleString("pt-BR")}
                        </span>
                        <span className={styles.metricDetail}>
                            Cadastros ativos na base
                        </span>
                    </div>
                    <span className={styles.metricIcon}>
                        <CrmIcon name="business" />
                    </span>
                </div>
            </section>

            <section className={styles.filterCard}>
                <form method="get" action="/empresas">
                    <div className={styles.searchRow}>
                        <label className={styles.search}>
                            <CrmIcon name="search" />
                            <span className={styles.srOnly}>
                                Buscar nome, telefone, documento ou segmento
                            </span>
                            <input
                                name="q"
                                maxLength={100}
                                defaultValue={filters.q ?? ""}
                                placeholder="Buscar por nome, telefone, documento ou segmento..."
                            />
                        </label>
                        <div className={styles.actions}>
                            <button className={styles.primary} type="submit">
                                Buscar
                            </button>
                            <Link href="/empresas" className={styles.secondary}>
                                Limpar
                            </Link>
                            <Link href="/importacoes" className={styles.secondary}>
                                <CrmIcon name="upload_file" size={17} />
                                Importações
                            </Link>
                            <button
                                type="button"
                                disabled
                                title="Exportação ainda não implementada"
                                className={styles.secondary}
                            >
                                Exportar CSV · em breve
                            </button>
                        </div>
                    </div>

                    <div className={styles.filters}>
                        <label>
                            Segmento
                            <select
                                name="segment"
                                defaultValue={filters.segment ?? ""}
                            >
                                <option value="">Todos os segmentos</option>
                                {filters.segment &&
                                    !data.segments.includes(filters.segment) && (
                                        <option value={filters.segment}>
                                            {filters.segment}
                                        </option>
                                    )}
                                {data.segments.map((segment) => (
                                    <option key={segment} value={segment}>
                                        {segment}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Cidade
                            <select name="city" defaultValue={filters.city ?? ""}>
                                <option value="">Todas as cidades</option>
                                {filters.city &&
                                    !data.cities.includes(filters.city) && (
                                        <option value={filters.city}>
                                            {filters.city}
                                        </option>
                                    )}
                                {data.cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Cadastro
                            <select
                                name="archive"
                                defaultValue={filters.archive ?? "active"}
                            >
                                <option value="active">Ativos</option>
                                <option value="archived">Arquivados</option>
                                <option value="all">Todos</option>
                            </select>
                        </label>

                        {hasPhoneFilter && (
                            <input type="hidden" name="phone" value="yes" />
                        )}

                        <button type="submit" className={styles.secondary}>
                            Aplicar filtros
                        </button>
                    </div>
                </form>

                <div className={styles.chips}>
                    <Link
                        href={href({
                            phone: hasPhoneFilter ? "" : "yes",
                            page: "1",
                        })}
                        className={`${styles.chip} ${hasPhoneFilter ? styles.selected : ""}`}
                        aria-label={
                            hasPhoneFilter
                                ? "Remover filtro com telefone"
                                : "Aplicar filtro com telefone"
                        }
                    >
                        <CrmIcon name="call" size={14} />
                        Com telefone
                        {hasPhoneFilter && <span aria-hidden="true">×</span>}
                    </Link>
                </div>
            </section>

            <section className={styles.tableCard}>
                <div className={styles.tableScroll}>
                    <table className={`${styles.table} ${clean.table}`}>
                        <caption className={styles.srOnly}>
                            Empresas encontradas pelos filtros atuais
                        </caption>
                        <colgroup>
                            <col style={{ width: "25%" }} />
                            <col style={{ width: "24%" }} />
                            <col style={{ width: 160 }} />
                            <col style={{ width: "17%" }} />
                            <col style={{ width: 110 }} />
                            <col style={{ width: 110 }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col">Nome da empresa</th>
                                <th scope="col">Segmento &amp; localização</th>
                                <th scope="col">Telefone</th>
                                <th scope="col">Presença digital</th>
                                <th scope="col">Cadastro</th>
                                <th scope="col">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((company) => {
                                const initials = company.name
                                    .split(/\s+/)
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((word) => word[0])
                                    .join("")
                                    .toUpperCase();
                                const web = company.website
                                    ? safeHttpUrl(company.website)
                                    : null;
                                const instagram = company.instagram
                                    ? safeHttpUrl(company.instagram)
                                    : null;
                                const location = [
                                    company.neighborhood,
                                    [company.city, company.state]
                                        .filter(Boolean)
                                        .join("/"),
                                ]
                                    .filter(Boolean)
                                    .join(", ");

                                return (
                                    <tr key={company.id}>
                                        <td>
                                            <div
                                                className={`${styles.companyName} ${clean.companyName}`}
                                            >
                                                <span className={styles.initials}>
                                                    {initials}
                                                </span>
                                                <div>
                                                    <Link
                                                        href={`/empresas/${company.id}`}
                                                    >
                                                        {company.name}
                                                    </Link>
                                                    <span className={styles.shortId}>
                                                        ID: {company.id
                                                            .slice(0, 8)
                                                            .toUpperCase()}
                                                    </span>
                                                    {company.archivedAt && (
                                                        <span className={styles.archived}>
                                                            Arquivado
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.segment}>
                                                {company.segment ?? "Não informado"}
                                            </span>
                                            <span
                                                className={`${styles.location} ${clean.location}`}
                                            >
                                                <CrmIcon
                                                    name="location_on"
                                                    size={12}
                                                />
                                                {location || "Local não informado"}
                                            </span>
                                        </td>
                                        <td>
                                            {company.phoneOriginal ? (
                                                <span className={styles.phone}>
                                                    {company.phoneOriginal}
                                                </span>
                                            ) : (
                                                <span className={styles.muted}>
                                                    Não informado
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.digital}>
                                                {web ? (
                                                    <a
                                                        href={web}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.digitalLink}
                                                    >
                                                        <CrmIcon
                                                            name="open_in_new"
                                                            size={13}
                                                        />
                                                        Abrir site
                                                    </a>
                                                ) : (
                                                    <span className={styles.muted}>
                                                        Não informado
                                                    </span>
                                                )}
                                                {instagram && (
                                                    <a
                                                        href={instagram}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.digitalLink}
                                                    >
                                                        Instagram
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.date}>
                                                {new Intl.DateTimeFormat("pt-BR", {
                                                    timeZone: "America/Sao_Paulo",
                                                }).format(company.createdAt)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <Link
                                                    href={`/empresas/${company.id}`}
                                                    className={styles.openButton}
                                                >
                                                    Abrir
                                                    <CrmIcon
                                                        name="open_in_new"
                                                        size={13}
                                                    />
                                                </Link>
                                                <Link
                                                    href={`/empresas/${company.id}`}
                                                    className={styles.iconButton}
                                                    aria-label={`Editar ${company.name}`}
                                                    title="Abrir para editar"
                                                >
                                                    <CrmIcon name="edit" size={15} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {!items.length && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className={styles.empty}>
                                            <CrmIcon name="business" size={30} />
                                            <h2>Nenhuma empresa encontrada</h2>
                                            <p>Cadastre um cliente ou ajuste os filtros.</p>
                                            <Link
                                                href="/empresas/nova"
                                                className={styles.primary}
                                            >
                                                Novo cadastro
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <footer className={styles.pagination}>
                    <span>
                        {total
                            ? `${(page - 1) * 20 + 1}–${Math.min(page * 20, total)} de ${total}`
                            : "0 resultados"}
                        {" · 20 por página"}
                    </span>
                    <nav aria-label="Paginação das empresas">
                        {page > 1 ? (
                            <Link href={href({ page: String(page - 1) })}>
                                Anterior
                            </Link>
                        ) : (
                            <span aria-disabled="true">Anterior</span>
                        )}
                        <span>Página {page} de {pages}</span>
                        {page < pages ? (
                            <Link href={href({ page: String(page + 1) })}>
                                Próxima
                            </Link>
                        ) : (
                            <span aria-disabled="true">Próxima</span>
                        )}
                    </nav>
                </footer>
            </section>

            <p className={styles.footnote}>
                O indicador considera somente cadastros ativos,
                independentemente dos filtros da listagem.
            </p>
        </section>
    );
}
