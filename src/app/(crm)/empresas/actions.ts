"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/server/db/client";
import { requireUser } from "@/server/auth/session";
import { parseCompany, validId } from "@/lib/companies/validation.mjs";
import { readCompanySaveResult, type CompanySaveResult } from "@/lib/companies/save-result.mjs";
import type { CompanyFormState, Duplicate } from "@/lib/companies/types";
import type { Prisma } from "@/generated/prisma/client";
function timestamp(v: FormDataEntryValue | null) {
  if (typeof v !== "string" || v.length > 40 || !/^\d{4}-\d{2}-\d{2}T/.test(v)) return null;
  const d = new Date(v); return Number.isFinite(d.getTime()) ? d : null;
}
type Match = { id: string; name: string; archivedAt: Date | null; phoneOriginal: string | null; city: string | null; state: string | null; website: string | null; doNotContact: boolean };
function describe(c: Match): Duplicate { return { id: c.id, name: c.name, archived: !!c.archivedAt, phone: c.phoneOriginal, location: [c.city, c.state].filter(Boolean).join(" / "), website: c.website, blocked: c.doNotContact }; }
const matchSelect = { id: true, name: true, archivedAt: true, phoneOriginal: true, city: true, state: true, website: true, doNotContact: true } as const;
export async function saveCompany(_previous: CompanyFormState, form: FormData): Promise<CompanyFormState> {
  await requireUser();
  const rawId = form.get("id");
  if (rawId !== null && rawId !== "" && !validId(rawId)) return { message: "Identificador inválido." };
  const id = typeof rawId === "string" && rawId !== "" ? rawId : null;
  const updatedAt = id ? timestamp(form.get("updatedAt")) : null;
  if (id && !updatedAt) return { message: "Versão inválida. Recarregue o cadastro." };
  const parsed = parseCompany(Object.fromEntries(form.entries()));
  if (!parsed.ok) return { message: "Revise os campos indicados. Seus dados foram mantidos.", errors: parsed.errors };
  let outcome: CompanySaveResult;
  try {
    const raw = await getDb().$transaction(async (tx): Promise<CompanySaveResult> => {
      if (id) {
        const current = await tx.company.findUnique({ where: { id }, select: { updatedAt: true, archivedAt: true } });
        if (!current || current.archivedAt || current.updatedAt.getTime() !== updatedAt!.getTime()) return { ok: false, state: { message: "Registro alterado ou arquivado. Preserve suas alterações e recarregue o cadastro." } };
      }
      const sameDocument = await tx.company.findFirst({ where: { documentType: parsed.data.documentType, documentNumber: parsed.data.documentNumber, ...(id ? { id: { not: id } } : {}) }, select: matchSelect });
      if (sameDocument) return { ok: false, state: { message: "Este CPF/CNPJ já está cadastrado. Abra o registro existente.", errors: { documentNumber: "Documento já cadastrado." }, duplicates: [describe(sameDocument)], exactDocument: true } };
      const signals: Prisma.CompanyWhereInput[] = [{ name: { equals: parsed.data.name, mode: "insensitive" } }];
      if (parsed.data.phoneNormalized) signals.push({ phoneNormalized: parsed.data.phoneNormalized });
      if (parsed.data.website) signals.push({ website: parsed.data.website });
      const duplicates = await tx.company.findMany({ where: { ...(id ? { id: { not: id } } : {}), OR: signals }, take: 10, select: matchSelect });
      if (duplicates.length && form.get("acknowledgeDuplicates") !== "on") return { ok: false, state: { message: "Revise as possíveis duplicidades. Para salvar separadamente, confirme abaixo.", duplicates: duplicates.map(describe) } };
      if (id) {
        const changed = await tx.company.updateMany({ where: { id, updatedAt: updatedAt!, archivedAt: null }, data: parsed.data });
        if (changed.count !== 1) return { ok: false, state: { message: "Outra edição foi salva. Recarregue antes de tentar novamente." } };
        return { ok: true, id };
      }
      const created = await tx.company.create({ data: parsed.data, select: { id: true } });
      return { ok: true, id: created.id };
    });
    outcome = readCompanySaveResult(raw);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return { message: "Este documento já foi cadastrado por outra solicitação. Consulte a listagem.", errors: { documentNumber: "Documento já cadastrado." }, exactDocument: true };
    console.error("COMPANY_SAVE_FAILED");
    return { message: "Não foi possível concluir a confirmação. Consulte o cadastro antes de repetir e confira a conexão." };
  }
  if (!outcome.ok) return outcome.state;
  revalidatePath("/empresas"); revalidatePath(`/empresas/${outcome.id}`); revalidatePath("/conta");
  redirect(`/empresas/${outcome.id}?saved=1`);
}
export async function setCompanyArchived(_previous: CompanyFormState, form: FormData): Promise<CompanyFormState> {
  await requireUser();
  const id = form.get("id"), updatedAt = timestamp(form.get("updatedAt")), operation = form.get("operation");
  if (!validId(id) || !updatedAt || !["archive", "restore"].includes(String(operation))) return { message: "Operação inválida. Recarregue o cadastro." };
  try {
    const changed = await getDb().company.updateMany({ where: { id, updatedAt, archivedAt: operation === "archive" ? null : { not: null } }, data: { archivedAt: operation === "archive" ? new Date() : null } });
    if (changed.count !== 1) return { message: "Registro alterado ou indisponível. Recarregue a página." };
  } catch { console.error("COMPANY_ARCHIVE_FAILED"); return { message: "Não foi possível concluir. Consulte o registro antes de repetir." }; }
  revalidatePath("/empresas"); revalidatePath(`/empresas/${id}`);
  redirect(`/empresas/${id}?${operation === "archive" ? "archived" : "restored"}=1`);
}
