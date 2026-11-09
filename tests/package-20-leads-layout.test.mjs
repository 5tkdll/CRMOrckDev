import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const page = read("src/app/(crm)/leads/page.tsx");
const table = read("src/components/visual-crm/leads-table.tsx");
const css = read("src/app/(crm)/leads/leads-presentation.module.css");

test("página reutiliza o CSS da listagem aprovada, não cria outra grade de cards", () => {
    assert.ok(page.includes('from "../empresas/listing.module.css"'));
    assert.ok(page.includes("className={listing.metrics}"));
    assert.ok(!page.includes("u.metricRow"));
    assert.ok(!page.includes('from "./leads.module.css"'));
});

test("os quatro indicadores possuem ícone e descrição", () => {
    for (const label of ["Leads ativos", "Potenciais clientes", "Site não informado", "Não contatar"]) {
        assert.ok(page.includes(label));
    }
    for (const icon of ["business", "trending_up", "web_asset_off", "block"]) {
        assert.ok(page.includes(`icon: "${icon}"`));
    }
    for (const part of ["listing.metricLabel", "listing.metricValue", "listing.metricDetail", "listing.metricIcon", "listing.danger", "listing.dangerIcon"]) {
        assert.ok(page.includes(part));
    }
});

test("percentual de potencial usa a base ativa e protege divisão por zero", () => {
    assert.ok(page.includes("const percentage = active"));
    assert.ok(page.includes("potential / active * 100"));
    assert.ok(page.includes("Sem leads ativos"));
});

test("busca e ações usam as mesmas linhas da referência", () => {
    assert.ok(page.includes("className={listing.searchRow}"));
    assert.ok(page.includes("className={listing.search}"));
    assert.ok(page.includes("className={listing.actions}"));
    assert.ok(page.includes('name="q"'));
    assert.ok(page.includes('type="submit"'));
});

test("filtros voltaram à faixa horizontal original", () => {
    assert.ok(page.includes("className={listing.filters}"));
    assert.ok(!css.includes("grid-template-columns"));
    assert.ok(!page.includes("styles.filters"));
});

test("todos os filtros combináveis foram preservados", () => {
    for (const name of ["assessment", "contact", "site", "group", "batch", "segment"]) {
        assert.ok(page.includes(`name="${name}"`));
    }
    assert.ok(page.includes("const where = leadWhere(filters)"));
});

test("chips rápidos preservam os outros filtros e reiniciam a página", () => {
    assert.ok(page.includes("leadUrl(filters, { [key]: selected ? \"\" : value, page: 1 })"));
    assert.ok(page.includes("className={listing.chips}"));
    assert.ok(page.includes('chip("Site não informado", "web_asset_off", "site", "missing")'));
    assert.ok(page.includes('chip("Com telefone", "call", "group", "phone")'));
    assert.ok(page.includes('chip("Restrição: não contatar", "block", "contact", "blocked")'));
});

test("paginação fica no rodapé da tabela como na referência", () => {
    assert.ok(page.includes("className={listing.pagination}"));
    assert.ok(page.includes("(current - 1) * 25 + 1"));
    assert.ok(page.includes("Math.min(current * 25, total)"));
    assert.ok(page.includes("aria-disabled=\"true\""));
});

test("avatares e identificação curta foram trazidos para Leads", () => {
    for (const part of ["listing.initials", "listing.shortId", "listing.companyName", "lead.id.slice(0, 8).toUpperCase()"]){
        assert.ok(table.includes(part));
    }
});

test("segmento e localização aparecem juntos sem descartar dados", () => {
    assert.ok(table.includes("Segmento & localização"));
    assert.ok(table.includes("listing.segment"));
    assert.ok(table.includes("listing.location"));
    assert.ok(table.includes("lead.values.location"));
});

test("telefone, presença digital e badges usam o visual original", () => {
    for (const part of ["listing.phone", "listing.digital", "listing.digitalLink", "listing.siteMissing", "listing.assessment", "listing.potential", "listing.contactBadge", "listing.blocked"]) {
        assert.ok(table.includes(part));
    }
});

test("Google continua separado da análise comercial", () => {
    assert.match(table, /"Google"\s*,\s*"Análise comercial"/);
    assert.ok(table.includes("lead.rating.toLocaleString"));
    assert.ok(!table.includes("Pesquisar dados"));
    assert.ok(!table.includes('value="HAS_WEBSITE"'));
});

test("ações de edição, oportunidade, exclusão e restauração foram preservadas", () => {
    for (const part of ["startSalesFlow(lead.id)", "changeLeadVisibility(", "setRemoving(lead)", "onClick={() => edit(lead)}", "listing.openButton", "listing.iconButton"]) {
        assert.ok(table.includes(part));
    }
});

test("a restrição mantém o bloqueio da abertura de oportunidade", () => {
    assert.ok(table.includes("disabled={busy || lead.doNotContact}"));
});

test("payload do popup conserva análise, versão e restrição", () => {
    for (const part of ["version: editing.version", "doNotContact: blocked", "doNotContactReason: reason", "setBlocked(event.target.value", "(blocked && !reason.trim())"]) {
        assert.ok(table.includes(part));
    }
    assert.ok(!table.includes('type="checkbox"'));
});

test("consulta de cadastro usa data real e identificação é opcional para chamadas antigas", () => {
    assert.ok(page.includes("createdAt: lead.createdAt.toISOString()"));
    assert.ok(table.includes("createdAt?: string"));
    assert.ok(table.includes('timeZone: "America/Sao_Paulo"'));
    assert.ok(table.includes("Number.isFinite(created.getTime())"));
});

test("tabela tem nove colunas e estado vazio compatível", () => {
    assert.equal((table.match(/<col style=/g) || []).length, 9);
    assert.ok(table.includes("colSpan={9}"));
    assert.ok(table.includes('scope="col"'));
});

test("ajustes CSS são locais e incluem o tema escuro", () => {
    assert.ok(css.includes('.page .tableWrap table th'));
    assert.ok(css.includes(':global(html[data-crm-theme="dark"]) .page'));
    assert.ok(!css.includes("!important"));
});

test("botões ainda sem execução não prometem operações implementadas", () => {
    assert.ok(page.includes("Novo lead · visual"));
    assert.ok(page.includes("Cadastro manual ainda visual, sem gravação"));
    assert.ok(page.includes("Exportação ainda não implementada"));
});

test("pacote visual não executa gravações nem mistura indicadores com Empresas", () => {
    assert.ok(page.includes("db.lead.count"));
    assert.ok(page.includes("AND: [activeLeads, missingWebsite]"));
    assert.ok(!page.includes("db.company"));
    assert.ok(!page.includes(".update("));
    assert.ok(!page.includes("$executeRaw"));
});
