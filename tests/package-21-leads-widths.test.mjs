import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const source = readFileSync(
    new URL("../src/components/visual-crm/leads-table.tsx", import.meta.url),
    "utf8",
);
const css = readFileSync(
    new URL("../src/app/(crm)/leads/leads-presentation.module.css", import.meta.url),
    "utf8",
);
const colgroup = source.match(/                    <colgroup>[\s\S]*?                    <\/colgroup>/)[0];
const columns = [...colgroup.matchAll(/<col style=\{\{ width: (?:"([^"]+)"|(\d+)) \}\} \/>/g)]
    .map((match) => match[1] ?? Number(match[2]));

function width(column, tableWidth) {
    if (typeof column === "number") return column;
    const calc = column.match(/^calc\(([\d.]+)% - ([\d.]+)px\)$/);
    assert.ok(calc, "A largura deve ser fixa ou calculada explicitamente.");
    return tableWidth * Number(calc[1]) / 100 - Number(calc[2]);
}

for (const tableWidth of [1360, 1440, 1600, 1920]) {
    test(`as nove colunas ocupam exatamente ${tableWidth}px, sem sobra automática`, () => {
        const widths = columns.map((column) => width(column, tableWidth));
        assert.equal(widths.length, 9);
        assert.ok(widths.every((value) => value >= 64));
        assert.ok(Math.abs(widths.reduce((sum, value) => sum + value, 0) - tableWidth) < 0.001);
        assert.equal(widths[8], 192);
    });
}

test("a coluna de ações comporta Abrir e três ícones sem depender de encolhimento", () => {
    const openButton = 57;
    const iconButtons = 3 * 28;
    const gaps = 3 * 6;
    const cellPadding = 2 * 10;
    assert.ok(openButton + iconButtons + gaps + cellPadding <= columns[8]);
    assert.ok(columns[8] > 140);
});

test("os botões não encolhem nem quebram de linha", () => {
    assert.match(css, /\.page \.tableActions\s*\{[^}]*flex-wrap:\s*nowrap/s);
    assert.match(css, /\.page \.tableActions button\s*\{[^}]*flex:\s*0 0 auto/s);
    assert.match(css, /button:not\(:first-child\)\s*\{[^}]*width:\s*28px/s);
    assert.match(css, /\.page \.tableActions\s*\{[^}]*gap:\s*6px/s);
});

test("a última célula não recorta o botão excluir", () => {
    assert.match(css, /td:last-child\s*\{[^}]*overflow:\s*visible/s);
    assert.ok(source.includes('title="Excluir lead"'));
    assert.ok(source.includes('name="trash"'));
});

test("células usam espaçamento horizontal menor sem alterar a altura base", () => {
    assert.match(css, /table th\s*\{[^}]*padding:\s*12px 10px/s);
    assert.match(css, /table td\s*\{[^}]*padding:\s*13px 10px/s);
});

test("badge de site pode quebrar linha em sua própria coluna", () => {
    assert.match(css, /td:nth-child\(4\) span\s*\{[^}]*max-width:\s*100%/s);
    assert.match(css, /td:nth-child\(4\) span\s*\{[^}]*white-space:\s*normal/s);
});

test("o restante do componente é idêntico ao arquivo conferido no GitHub", () => {
    const previous = `                    <colgroup>
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: 140 }} />
                        <col style={{ width: 120 }} />
                        <col style={{ width: 65 }} />
                        <col style={{ width: 140 }} />
                        <col style={{ width: 150 }} />
                        <col style={{ width: 95 }} />
                        <col style={{ width: 140 }} />
                    </colgroup>`;
    const restored = source.replace(colgroup, previous);
    const buffer = Buffer.from(restored, "utf8");
    const hash = createHash("sha1")
        .update(`blob ${buffer.length}\0`)
        .update(buffer)
        .digest("hex");
    assert.equal(hash, "deef085dc5a8cd9e7700a6faa59118507f56ba77");
});

test("cores dos temas foram preservadas e não há overrides globais de ações", () => {
    assert.ok(css.includes('--leads-text: #0b1c30;'));
    assert.ok(css.includes('--leads-text: #e5e7eb;'));
    assert.ok(css.includes(':global(html[data-crm-theme="dark"]) .page'));
    assert.ok(!css.includes('!important'));
});
