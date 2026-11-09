import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
    new URL("../src/app/(crm)/empresas/page.tsx", import.meta.url),
    "utf8",
);
const css = readFileSync(
    new URL("../src/app/(crm)/empresas/listing-clean.module.css", import.meta.url),
    "utf8",
);

for (const text of [
    "Potenciais clientes",
    "Site não identificado",
    "Não contatar",
    "Avaliação comercial",
    "Restrição de contato",
    "Sem restrição registrada",
]) {
    test(`listagem não exibe ${text}`, () => {
        assert.ok(!source.toLowerCase().includes(text.toLowerCase()));
    });
}

for (const name of ["assessment", "contact", "site"]) {
    test(`controle ${name} não é renderizado`, () => {
        assert.ok(!source.includes(`name="${name}"`));
    });
}

test("parâmetros antigos não voltam como filtros ocultos", () => {
    const allowed = source.match(/for \(const key of \[([\s\S]*?)\] as const\)/);
    assert.ok(allowed);
    for (const name of ["assessment", "contact", "site"]) {
        assert.ok(!allowed[1].includes(`"${name}"`));
    }
});

test("resta somente um card cadastral, sem classificar empresas", () => {
    assert.equal((source.match(/className=\{styles\.metric\}/g) || []).length, 1);
    assert.ok(source.includes("Empresas cadastradas"));
    assert.ok(!source.includes("company.assessment"));
    assert.ok(!source.includes("company.doNotContact"));
});

test("tabela tem seis cabeçalhos e seis colunas", () => {
    assert.equal((source.match(/<th scope="col">/g) || []).length, 6);
    assert.equal((source.match(/<col style=/g) || []).length, 6);
    assert.ok(source.includes("colSpan={6}"));
});

test("busca, filtros cadastrais e ações são preservados", () => {
    for (const part of [
        'name="q"',
        'name="segment"',
        'name="city"',
        'name="archive"',
        'name="phone"',
        'href="/empresas/nova"',
        'href="/importacoes"',
        "safeHttpUrl(company.website)",
        "safeHttpUrl(company.instagram)",
        "company.archivedAt",
        "company.phoneOriginal",
    ]) {
        assert.ok(source.includes(part), part);
    }
});

test("consulta continua na camada autenticada existente", () => {
    assert.ok(source.includes("await getCompanyListing(filters)"));
    for (const forbidden of [".update(", ".delete(", ".create(", "$executeRaw"]) {
        assert.ok(!source.includes(forbidden));
    }
});

test("paginação preserva tamanho de vinte registros", () => {
    assert.ok(source.includes("(page - 1) * 20 + 1"));
    assert.ok(source.includes("Math.min(page * 20, total)"));
    assert.ok(source.includes("page: String(page - 1)"));
    assert.ok(source.includes("page: String(page + 1)"));
});

test("ajustes de largura são locais e não alteram as cores do tema", () => {
    assert.ok(css.includes(".page .metrics"));
    assert.ok(css.includes(".page .table"));
    assert.ok(css.includes("table-layout: fixed"));
    assert.ok(!css.includes(":global"));
    assert.ok(!css.includes("color:"));
    assert.ok(!css.includes("background:"));
});
