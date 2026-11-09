"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, styles as s } from "./primitives";
import { CrmIcon } from "@/components/ui/crm-icon";
import { RecordDialog, RecordFields } from "./record-dialog";
import { normalize, safeLink } from "@/lib/csv-import/core.mjs";
import type { Values } from "@/lib/csv-import/core.mjs";
import { isDeleted, restoreAssessment } from "@/lib/csv-import/lead-lifecycle.mjs";
import { saveLead, changeLeadVisibility } from "@/server/leads/actions";
import { startSalesFlow } from "@/server/sales/actions";
import listing from "@/app/(crm)/empresas/listing.module.css";
import presentation from "@/app/(crm)/leads/leads-presentation.module.css";
import u from "./workspace.module.css";

export type LeadItem = {
    id: string;
    version: string;
    createdAt?: string;
    values: Values;
    websiteUrl: string;
    instagramUrl: string;
    websiteKind: string;
    phoneValid: boolean;
    rating: number | null;
    needsResearch: boolean;
    assessment: string;
    doNotContact: boolean;
    doNotContactReason: string;
    filename: string;
    line: number;
    raw: string;
    batchId: string;
};

const labels: Record<string, string> = {
    UNREVIEWED: "Pendente de análise",
    POTENTIAL: "Potencial cliente",
    NO_INTEREST: "Sem interesse",
};

export function LeadsTable({ rows }: { rows: LeadItem[] }) {
    const router = useRouter();
    const running = useRef(false);
    const [editing, setEditing] = useState<LeadItem | null>(null);
    const [values, setValues] = useState<Values | null>(null);
    const [assessment, setAssessment] = useState("UNREVIEWED");
    const [blocked, setBlocked] = useState(false);
    const [reason, setReason] = useState("");
    const [removing, setRemoving] = useState<LeadItem | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const validation = useMemo(() => values ? normalize(values) : null, [values]);

    async function run(work: () => Promise<void>) {
        if (running.current) return;
        running.current = true;
        setBusy(true);
        setError("");
        try {
            await work();
        } catch {
            setError("Falha de comunicação. Consulte o estado salvo antes de repetir.");
        } finally {
            running.current = false;
            setBusy(false);
        }
    }

    function edit(row: LeadItem) {
        const classification = restoreAssessment(row.assessment);
        setEditing(row);
        setValues({ ...row.values });
        setAssessment(labels[classification] ? classification : "UNREVIEWED");
        setBlocked(row.doNotContact);
        setReason(row.doNotContactReason);
        setError("");
    }

    return (
        <div className={u.scope}>
            {notice && (
                <p role="status" className={`${u.notice} ${presentation.feedback}`}>
                    {notice}
                </p>
            )}
            {error && !editing && !removing && (
                <p role="alert" className={`${u.errorLine} ${presentation.feedback}`}>
                    {error}
                </p>
            )}
            <div className={`${listing.tableScroll} ${presentation.tableWrap}`}>
                <table className={u.compact} style={{ minWidth: 1360 }}>
                    <caption className={listing.srOnly}>
                        Leads encontrados pelos filtros atuais
                    </caption>
                    <colgroup>
                        <col style={{ width: "calc(45% - 414.9px)" }} />
                        <col style={{ width: "calc(55% - 507.1px)" }} />
                        <col style={{ width: 136 }} />
                        <col style={{ width: 116 }} />
                        <col style={{ width: 64 }} />
                        <col style={{ width: 154 }} />
                        <col style={{ width: 160 }} />
                        <col style={{ width: 100 }} />
                        <col style={{ width: 192 }} />
                    </colgroup>
                    <thead>
                        <tr>
                            {[
                                "Nome do lead",
                                "Segmento & localização",
                                "Telefone",
                                "Presença digital",
                                "Google",
                                "Análise comercial",
                                "Contato",
                                "Cadastro",
                                "Ações",
                            ].map((column) => (
                                <th key={column} scope="col">
                                    {column === "Contato" ? "Restrição de contato" : column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((lead) => {
                            const deleted = isDeleted(lead.assessment);
                            const initials = lead.values.name
                                .split(/\s+/)
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase();
                            const created = lead.createdAt ? new Date(lead.createdAt) : null;

                            return (
                                <tr key={lead.id}>
                                    <td>
                                        <div className={`${listing.companyName} ${presentation.rowName}`}>
                                            <span className={listing.initials}>{initials}</span>
                                            <div>
                                                <button
                                                    type="button"
                                                    className={presentation.nameButton}
                                                    disabled={busy}
                                                    onClick={() => edit(lead)}
                                                >
                                                    {lead.values.name}
                                                </button>
                                                <span className={listing.shortId}>
                                                    ID: {lead.id.slice(0, 8).toUpperCase()}
                                                </span>
                                                {deleted && (
                                                    <span className={listing.archived}>Excluído</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={listing.segment}>
                                            {lead.values.segment || "Não informado"}
                                        </span>
                                        <span className={`${listing.location} ${presentation.location}`}>
                                            <CrmIcon name="location_on" size={12} />
                                            {lead.values.location || "Local não informado"}
                                        </span>
                                    </td>
                                    <td>
                                        {lead.values.phone ? (
                                            <span className={listing.phone}>{lead.values.phone}</span>
                                        ) : (
                                            <span className={listing.muted}>Não informado</span>
                                        )}
                                        {lead.values.phone && !lead.phoneValid && (
                                            <p className={u.muted}>Revisar telefone</p>
                                        )}
                                    </td>
                                    <td>
                                        <div className={listing.digital}>
                                            {safeLink(lead.websiteUrl) ? (
                                                <a
                                                    href={safeLink(lead.websiteUrl)}
                                                    className={listing.digitalLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <CrmIcon name="open_in_new" size={13} />
                                                    {lead.websiteKind === "SOCIAL" ? "Rede social" : "Abrir site"}
                                                </a>
                                            ) : (
                                                <span className={listing.siteMissing}>
                                                    <CrmIcon name="web_asset_off" size={13} />
                                                    {lead.values.website ? "Link a revisar" : "Site não informado"}
                                                </span>
                                            )}
                                            {safeLink(lead.instagramUrl) && (
                                                <a
                                                    href={safeLink(lead.instagramUrl)}
                                                    className={listing.digitalLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Instagram
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td title="Nota importada do CSV; não é análise comercial">
                                        <span className={listing.date}>
                                            {lead.rating !== null
                                                ? `${lead.rating.toLocaleString("pt-BR")} / 5`
                                                : "—"}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`${listing.assessment} ${lead.assessment === "POTENTIAL" ? listing.potential : ""}`}
                                        >
                                            <span className={listing.dot} />
                                            {deleted ? "Excluído" : labels[lead.assessment] ?? "Pendente de análise"}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`${listing.contactBadge} ${lead.doNotContact ? listing.blocked : ""}`}
                                            title={lead.doNotContact
                                                ? lead.doNotContactReason
                                                : "Sem restrição registrada; não significa autorização de contato"}
                                        >
                                            <CrmIcon name={lead.doNotContact ? "block" : "help"} size={14} />
                                            {lead.doNotContact ? "Não contatar" : "Sem restrição registrada"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={listing.date}>
                                            {created && Number.isFinite(created.getTime())
                                                ? new Intl.DateTimeFormat("pt-BR", {
                                                    timeZone: "America/Sao_Paulo",
                                                }).format(created)
                                                : "—"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={`${listing.rowActions} ${presentation.tableActions}`}>
                                            <button
                                                type="button"
                                                className={listing.openButton}
                                                disabled={busy}
                                                onClick={() => edit(lead)}
                                            >
                                                Abrir
                                                <CrmIcon name="open_in_new" size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                className={listing.iconButton}
                                                title="Editar lead"
                                                aria-label={`Editar ${lead.values.name}`}
                                                disabled={busy}
                                                onClick={() => edit(lead)}
                                            >
                                                <Icon name="edit" size={15} />
                                            </button>
                                            {!deleted && (
                                                <button
                                                    type="button"
                                                    className={listing.iconButton}
                                                    disabled={busy || lead.doNotContact}
                                                    title="Interesse confirmado — abrir oportunidade"
                                                    aria-label={`Abrir oportunidade de ${lead.values.name}`}
                                                    onClick={() => void run(async () => {
                                                        const result = await startSalesFlow(lead.id);
                                                        if (!result.ok) {
                                                            setError(result.error);
                                                            return;
                                                        }
                                                        router.push("/oportunidades?flow=" + result.id);
                                                    })}
                                                >
                                                    <Icon name="arrow" size={15} />
                                                </button>
                                            )}
                                            {deleted ? (
                                                <button
                                                    type="button"
                                                    className={listing.iconButton}
                                                    title="Restaurar lead"
                                                    aria-label={`Restaurar ${lead.values.name}`}
                                                    disabled={busy}
                                                    onClick={() => void run(async () => {
                                                        const result = await changeLeadVisibility(
                                                            lead.id, lead.version, false,
                                                        );
                                                        if (!result.ok) {
                                                            setError(result.error);
                                                            return;
                                                        }
                                                        setNotice("Lead restaurado.");
                                                        router.refresh();
                                                    })}
                                                >
                                                    <Icon name="back" size={15} />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={listing.iconButton}
                                                    title="Excluir lead"
                                                    aria-label={`Excluir ${lead.values.name}`}
                                                    disabled={busy}
                                                    onClick={() => {
                                                        setRemoving(lead);
                                                        setError("");
                                                    }}
                                                >
                                                    <Icon name="trash" size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!rows.length && (
                            <tr>
                                <td colSpan={9}>
                                    <div className={listing.empty}>
                                        <CrmIcon name="business" size={30} />
                                        <h2>Nenhum lead encontrado</h2>
                                        <p>Ajuste os filtros ou importe um arquivo CSV.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editing && values && (
                <RecordDialog
                    title={isDeleted(editing.assessment) ? "Consultar lead excluído" : "Editar lead"}
                    busy={busy}
                    onClose={() => setEditing(null)}
                    footer={(
                        <>
                            <button
                                className={s.button}
                                type="button"
                                disabled={busy}
                                onClick={() => setEditing(null)}
                            >
                                Fechar
                            </button>
                            {!isDeleted(editing.assessment) && (
                                <button
                                    className={s.primary}
                                    type="button"
                                    disabled={busy || !!validation?.errors.length || (blocked && !reason.trim())}
                                    onClick={() => void run(async () => {
                                        const result = await saveLead(editing.id, JSON.stringify({
                                            values,
                                            assessment,
                                            version: editing.version,
                                            doNotContact: blocked,
                                            doNotContactReason: reason,
                                        }));
                                        if (!result.ok) {
                                            setError(result.error);
                                            return;
                                        }
                                        setNotice("Lead e qualificação atualizados. Origem do CSV preservada.");
                                        setEditing(null);
                                        router.refresh();
                                    })}
                                >
                                    Salvar alterações
                                </button>
                            )}
                        </>
                    )}
                >
                    {error && <p role="alert" className={u.errorLine}>{error}</p>}
                    <RecordFields
                        values={values}
                        disabled={busy || isDeleted(editing.assessment)}
                        onChange={setValues}
                    />
                    <label className={u.field}>
                        Análise comercial
                        <select
                            value={assessment}
                            disabled={busy || isDeleted(editing.assessment)}
                            onChange={(event) => setAssessment(event.target.value)}
                        >
                            <option value="UNREVIEWED">Selecione — análise pendente</option>
                            <option value="POTENTIAL">Potencial cliente</option>
                            <option value="NO_INTEREST">Sem interesse</option>
                        </select>
                    </label>
                    <label className={u.field}>
                        Restrição de contato
                        <select
                            value={blocked ? "blocked" : "none"}
                            disabled={busy || isDeleted(editing.assessment)}
                            onChange={(event) => setBlocked(event.target.value === "blocked")}
                        >
                            <option value="none">Sem restrição registrada</option>
                            <option value="blocked">Não contatar</option>
                        </select>
                    </label>
                    <label className={u.field}>
                        Motivo da restrição{blocked ? " *" : " — registro anterior"}
                        <textarea
                            maxLength={1000}
                            rows={3}
                            value={reason}
                            disabled={busy || !blocked || isDeleted(editing.assessment)}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Informe por que o lead não deve ser contatado"
                        />
                    </label>
                    <p className={u.muted}>
                        Retirar a restrição não registra autorização de contato e não apaga
                        o motivo anterior. A análise comercial não muda a restrição.
                    </p>
                    <p className={u.muted}>
                        Demonstrou interesse após o contato? Use a seta da lista para abrir
                        a negociação em Oportunidades.
                    </p>
                    {!!validation?.errors.length && (
                        <ul className={u.issues}>
                            {validation.errors.map((text, index) => <li key={index}>{text}</li>)}
                        </ul>
                    )}
                    <details>
                        <summary>Validação dos dados informados</summary>
                        <ul className={u.issues}>
                            {validation?.warnings.map((text, index) => <li key={index}>{text}</li>)}
                        </ul>
                    </details>
                    <div className={u.compare}>
                        <strong>Origem preservada</strong>
                        <p>{editing.filename} · linha {editing.line}</p>
                    </div>
                    <details>
                        <summary>Linha original do CSV</summary>
                        <pre className={u.raw}>{editing.raw}</pre>
                    </details>
                </RecordDialog>
            )}

            {removing && (
                <RecordDialog
                    title="Excluir lead"
                    busy={busy}
                    onClose={() => setRemoving(null)}
                    footer={(
                        <>
                            <button
                                type="button"
                                className={s.button}
                                disabled={busy}
                                onClick={() => setRemoving(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className={s.dangerButton}
                                disabled={busy}
                                onClick={() => void run(async () => {
                                    const result = await changeLeadVisibility(
                                        removing.id, removing.version, true,
                                    );
                                    if (!result.ok) {
                                        setError(result.error);
                                        return;
                                    }
                                    setRemoving(null);
                                    setNotice("Lead excluído. Restaure pelo filtro Excluídos.");
                                    router.refresh();
                                })}
                            >
                                Excluir lead
                            </button>
                        </>
                    )}
                >
                    {error && <p role="alert" className={u.errorLine}>{error}</p>}
                    <p>Excluir <strong>{removing.values.name}</strong> da lista principal?</p>
                    <p className={u.muted}>
                        O vínculo com a importação permanece para evitar reimportação automática.
                    </p>
                </RecordDialog>
            )}
        </div>
    );
}
