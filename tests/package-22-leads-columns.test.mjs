import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(
    new URL("../src/app/(crm)/leads/leads-presentation.module.css", import.meta.url),
    "utf8",
);
const rules = [...css.matchAll(/th:nth-child\((\d)\)\s*\{\s*width:\s*([^;]+);/g)]
    .map((match) => ({ index: Number(match[1]), width: match[2] }));

function pixels(value, tableWidth) {
    if (/^\d+px$/.test(value)) return parseFloat(value);
    const calc = value.match(/^calc\(([\d.]+)% - ([\d.]+)px\)$/);
    assert.ok(calc);
    return tableWidth * Number(calc[1]) / 100 - Number(calc[2]);
}

for (const tableWidth of [1360, 1440, 1600, 1920]) {
    test(`distribuição completa, sem sobra, em tabela de ${tableWidth}px`, () => {
        assert.equal(rules.length, 9);
        const values = rules.map((rule) => pixels(rule.width, tableWidth));
        assert.ok(Math.abs(values.reduce((sum, value) => sum + value, 0) - tableWidth) < 0.001);
        assert.ok(values.every((value) => value >= 64));
        assert.equal(values[3], 156);
        assert.equal(values[8], 192);
        const previousSegmentWidth = tableWidth * 0.55 - 507.1;
        assert.ok(Math.abs(previousSegmentWidth - values[1] - 40) < 0.001);
    });
}

test("cabeçalho controla a largura sem interferência das larguras inline antigas", () => {
    assert.match(css, /table colgroup\s*\{\s*display:\s*none/);
    assert.match(css, /table th\s*\{\s*box-sizing:\s*border-box/);
    assert.match(css, /table\s*\{[^}]*table-layout:\s*fixed/s);
});

test("segmento e endereço usam uma linha e reticências", () => {
    assert.match(css, /td:nth-child\(2\) > span:first-child\s*\{[^}]*white-space:\s*nowrap;[^}]*text-overflow:\s*ellipsis/s);
    assert.match(css, /\.location\s*\{\s*display:\s*block;[^}]*white-space:\s*nowrap;[^}]*text-overflow:\s*ellipsis/s);
});

test("site não informado não quebra em duas linhas", () => {
    assert.match(css, /td:nth-child\(4\) span\s*\{[^}]*white-space:\s*nowrap/s);
    assert.match(css, /td:nth-child\(4\) svg\s*\{\s*flex-shrink:\s*0/);
});

test("reserva e proteção dos botões permanecem", () => {
    assert.match(css, /\.tableActions button\s*\{[^}]*flex:\s*0 0 auto/s);
    assert.match(css, /td:last-child\s*\{\s*overflow:\s*visible/);
    assert.ok(57 + 3 * 28 + 3 * 6 + 2 * 10 <= 192);
});

test("alteração continua limitada ao escopo da página e preserva ambos os temas", () => {
    assert.ok(css.includes(':global(html[data-crm-theme="dark"]) .page'));
    assert.ok(css.includes('--leads-text: #e5e7eb;'));
    assert.ok(css.includes('--leads-text: #0b1c30;'));
    assert.ok(!css.includes('!important'));
});
