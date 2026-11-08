import { readFileSync, writeFileSync } from "node:fs";
const path = "prisma/schema.prisma";
const text = readFileSync(path, "utf8");
const match = text.match(/model Company\s*\{[\s\S]*?\n\}/);
if (!match) throw new Error("Modelo Company nao encontrado. Nenhum arquivo alterado.");
const additions = `  // company-identification-v1
  documentType String? @db.VarChar(4)
  documentNumber String? @db.VarChar(14)
  responsibleName String? @db.VarChar(200)
  responsibleCpf String? @db.VarChar(11)
  postalCode String? @db.VarChar(8)
  addressNumber String? @db.VarChar(30)
  addressComplement String? @db.VarChar(200)
  @@unique([documentType, documentNumber])
`;
const names = ["documentType", "documentNumber", "responsibleName", "responsibleCpf", "postalCode", "addressNumber", "addressComplement"];
if (match[0].includes("// company-identification-v1")) {
  if (!names.every(n => new RegExp(`\\b${n}\\b`).test(match[0])) || !match[0].includes("@@unique([documentType, documentNumber])")) throw new Error("Patch parcial detectado. Revisar manualmente.");
  console.log("Patch ja aplicado; nenhuma alteracao.");
} else {
  if (names.some(n => new RegExp(`\\b${n}\\b`).test(match[0]))) throw new Error("Campos ja existem sem marcador. Revisar antes de aplicar.");
  const updated = match[0].replace(/\n\}$/, "\n" + additions + "}");
  writeFileSync(path, text.replace(match[0], updated), "utf8");
  console.log("Company atualizado no schema; banco NAO alterado. Revise git diff e valide Prisma.");
}
