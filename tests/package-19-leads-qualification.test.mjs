import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
    activeLeads,
    missingWebsite,
    parseLeadFilters,
    leadWhere,
    leadUrl,
    restrictionPatch,
} from "../src/lib/leads-view.mjs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const previous = { doNotContact: true, doNotContactReason: "Solicitou não receber contato" };

test("visão padrão usa leads ativos", () => {
    assert.deepEqual(leadWhere(parseLeadFilters({})), { AND: [activeLeads] });
});

test("site vazio considera nulo e string vazia", () => {
    assert.deepEqual(missingWebsite, { OR: [{ website: null }, { website: "" }] });
    assert.ok(leadWhere(parseLeadFilters({ site: "missing" })).AND.includes(missingWebsite));
});

test("potencial, contato e site são combináveis", () => {
    const where = leadWhere(parseLeadFilters({
        assessment: "POTENTIAL", contact: "blocked", site: "missing",
    }));
    assert.ok(where.AND.some((part) => part.assessment === "POTENTIAL"));
    assert.ok(where.AND.some((part) => part.doNotContact === true));
    assert.ok(where.AND.includes(missingWebsite));
});

test("busca OR não sobrescreve OR de site vazio", () => {
    const where = leadWhere(parseLeadFilters({ q: "fictício", site: "missing" }));
    assert.equal(where.AND.filter((part) => part.OR).length, 2);
});

for (const [legacy, expected] of [
    ["potential", { assessment: "POTENTIAL" }],
    ["no-interest", { assessment: "NO_INTEREST" }],
    ["blocked", { contact: "blocked" }],
    ["no-website", { site: "missing" }],
]) {
    test(`link antigo ${legacy} permanece utilizável`, () => {
        const filters = parseLeadFilters({ group: legacy });
        for (const [key, value] of Object.entries(expected)) assert.equal(filters[key], value);
        assert.equal(filters.group, "");
    });
}

for (const value of ["constructor", "__proto__", "INVALID", ["POTENTIAL"]]) {
    test(`parâmetro inválido é ignorado: ${String(value)}`, () => {
        const filters = parseLeadFilters({ group: value, assessment: value, contact: value, site: value });
        assert.equal(filters.group, "");
        assert.equal(filters.assessment, "");
        assert.equal(filters.contact, "");
        assert.equal(filters.site, "");
    });
}

test("paginação preserva todos os filtros", () => {
    const filters = parseLeadFilters({
        q: "Empresa fictícia", assessment: "POTENTIAL", contact: "blocked",
        site: "missing", segment: "Comércio", group: "phone",
    });
    const url = new URL(leadUrl(filters, { page: 2 }), "https://crm.invalid");
    for (const key of ["q", "assessment", "contact", "site", "segment", "group"]) {
        assert.equal(url.searchParams.get(key), filters[key]);
    }
    assert.equal(url.searchParams.get("page"), "2");
});

test("filtro de excluídos preserva a classificação original", () => {
    const where = leadWhere(parseLeadFilters({ group: "deleted", assessment: "POTENTIAL" }));
    assert.ok(where.AND.some((part) => part.assessment === "DELETED:POTENTIAL"));
});

test("análise pendente não transforma categorias antigas em sem interesse", () => {
    const where = leadWhere(parseLeadFilters({ assessment: "UNREVIEWED" }));
    assert.ok(where.AND.some((part) => part.assessment?.notIn?.includes("NO_INTEREST")));
});

test("site preenchido exige valor não nulo e não vazio", () => {
    const where = leadWhere(parseLeadFilters({ site: "present" }));
    assert.ok(where.AND.some((part) => part.website?.not === null));
    assert.ok(where.AND.some((part) => part.website?.not === ""));
});

test("telefone válido não admite normalização vazia", () => {
    const where = leadWhere(parseLeadFilters({ group: "phone" }));
    assert.ok(where.AND.some((part) => part.phoneNormalized?.not === ""));
});

test("página inválida usa um e página excessiva é limitada", () => {
    for (const page of ["-1", "0", "abc", "Infinity"]) {
        assert.equal(parseLeadFilters({ page }).page, 1);
    }
    assert.equal(parseLeadFilters({ page: "999999999" }).page, 100000);
});

test("lote inválido é ignorado sem criar consulta malformada", () => {
    assert.equal(parseLeadFilters({ batch: "invalido" }).batch, "");
});

test("ausência dos novos campos preserva restrição existente", () => {
    assert.deepEqual(restrictionPatch({}, previous), previous);
});

test("marcar não contatar exige motivo", () => {
    assert.throws(() => restrictionPatch({ doNotContact: true, doNotContactReason: " " }, previous));
});

test("motivo válido é normalizado", () => {
    assert.deepEqual(restrictionPatch({ doNotContact: true, doNotContactReason: " Solicitou pausa " }, previous), {
        doNotContact: true, doNotContactReason: "Solicitou pausa",
    });
});

test("retirada explícita não apaga o motivo anterior", () => {
    assert.deepEqual(restrictionPatch({ doNotContact: false, doNotContactReason: "" }, previous), {
        doNotContact: false, doNotContactReason: previous.doNotContactReason,
    });
});

for (const payload of [
    { doNotContact: "false", doNotContactReason: "Motivo" },
    { doNotContact: true },
    { doNotContactReason: "Motivo" },
    { doNotContact: true, doNotContactReason: "x".repeat(1001) },
]) {
    test(`restrição malformada recusada: ${Object.keys(payload).join(",")}/${typeof payload.doNotContact}`, () => {
        assert.throws(() => restrictionPatch(payload, previous));
    });
}

test("cards consultam a tabela leads, não empresas", () => {
    const source = read("src/app/(crm)/leads/page.tsx");
    for (const text of ["Leads ativos", "Potenciais clientes", "Site não informado", "Não contatar"]) {
        assert.ok(source.includes(text));
    }
    assert.ok(source.includes("db.lead.count"));
    assert.ok(!source.includes("db.company"));
    assert.ok(source.includes("AND: [activeLeads, missingWebsite]"));
});

test("todos os controles de prospecção são renderizados separadamente", () => {
    const source = read("src/app/(crm)/leads/page.tsx");
    for (const name of ["q", "assessment", "contact", "site", "segment", "group", "batch"]) {
        assert.ok(source.includes(`name="${name}"`));
    }
});

test("contato, Google e análise não se substituem", () => {
    const source = read("src/components/visual-crm/leads-table.tsx");
    for (const text of ['"Google"', '"Análise comercial"', '"Contato"', "lead.doNotContactReason"]) {
        assert.ok(source.includes(text));
    }
    assert.ok(source.includes("colSpan={9}"));
    assert.ok(!source.includes("Pesquisar dados"));
    assert.ok(!source.includes('value="HAS_WEBSITE"'));
});

test("popup permite editar restrição sem checkbox genérico", () => {
    const source = read("src/components/visual-crm/leads-table.tsx");
    assert.ok(source.includes("doNotContact: blocked"));
    assert.ok(source.includes("doNotContactReason: reason"));
    assert.ok(source.includes("setBlocked(event.target.value"));
    assert.ok(!source.includes('type="checkbox"'));
});

test("salvamento conserva trava, versão e proteção da origem", () => {
    const source = read("src/server/leads/actions.ts");
    for (const text of ["await requireUser()", "pg_advisory_xact_lock", "restrictionPatch(raw, old)", "updatedAt: new Date(input.version)", "...restriction"]) {
        assert.ok(source.includes(text));
    }
    assert.ok(!source.includes(".csvEntry.update"));
    assert.ok(!source.includes(".company.update"));
});

test("oportunidade continua bloqueada para lead com restrição", () => {
    const source = read("src/components/visual-crm/leads-table.tsx");
    assert.ok(source.includes("disabled={busy || lead.doNotContact}"));
    assert.ok(source.includes("startSalesFlow(lead.id)"));
});
