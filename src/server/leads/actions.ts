"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { normalize } from "@/lib/csv-import/core.mjs";
import {
    isDeleted,
    markDeleted,
    restoreAssessment,
    validateEdit,
} from "@/lib/csv-import/lead-lifecycle.mjs";
import { restrictionPatch } from "@/lib/leads-view.mjs";

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

class EditError extends Error {}

function failure(error: unknown) {
    console.error(
        "Lead operation failed",
        error instanceof Error ? error.name : "Unknown",
    );
    return {
        ok: false as const,
        error: error instanceof EditError
            ? error.message
            : "Não foi possível salvar. Confira a conexão e tente novamente sem fechar a edição.",
    };
}

function refresh() {
    for (const path of ["/leads", "/importacoes", "/oportunidades", "/dashboard"]) {
        revalidatePath(path);
    }
}

export async function saveLead(id: string, payload: string) {
    await requireUser();

    try {
        if (!uuid.test(id)) {
            throw new EditError("Registro inválido.");
        }
        let input;
        try {
            input = validateEdit(payload);
        } catch (error) {
            throw new EditError(error instanceof Error ? error.message : "Dados inválidos.");
        }
        const raw = JSON.parse(payload) as Record<string, unknown>;
        const checked = normalize(input.values);
        if (checked.errors.length) {
            throw new EditError(checked.errors.join(" "));
        }

        await getDb().$transaction(async (tx) => {
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(781309001)::text`;
            const old = await tx.lead.findUnique({ where: { id } });
            if (!old) {
                throw new EditError("Lead não encontrado.");
            }
            if (isDeleted(old.assessment)) {
                throw new EditError("Este lead foi excluído. Restaure antes de editar.");
            }
            let restriction;
            try {
                restriction = restrictionPatch(raw, old);
            } catch (error) {
                throw new EditError(error instanceof Error ? error.message : "Restrição inválida.");
            }
            const n = checked.data;
            const updated = await tx.lead.updateMany({
                where: { id, updatedAt: new Date(input.version) },
                data: {
                    name: n.name,
                    phoneOriginal: n.phone || null,
                    phoneNormalized: n.phoneNormalized || null,
                    instagram: n.instagram || null,
                    instagramUrl: n.instagramUrl || null,
                    website: n.website || null,
                    websiteUrl: n.websiteUrl || null,
                    websiteDomain: n.websiteDomain || null,
                    websiteKind: n.websiteKind,
                    location: n.location || null,
                    segment: n.segment || null,
                    googleRating: n.ratingValue,
                    sourceUrl: n.sourceUrl || null,
                    researchedAt: n.researchedAt || null,
                    notes: n.notes || null,
                    needsResearch: n.needsResearch,
                    assessment: input.assessment,
                    ...restriction,
                },
            });
            if (updated.count !== 1) {
                throw new EditError(
                    "Este lead mudou em outra aba. Feche e atualize a página antes de editar novamente.",
                );
            }
        });
        refresh();
        return { ok: true as const, warnings: checked.warnings };
    } catch (error) {
        return failure(error);
    }
}

export async function changeLeadVisibility(
    id: string,
    version: string,
    remove: boolean,
) {
    await requireUser();

    try {
        if (!uuid.test(id)
            || typeof version !== "string"
            || !Number.isFinite(Date.parse(version))
            || typeof remove !== "boolean") {
            throw new EditError("Solicitação inválida.");
        }
        await getDb().$transaction(async (tx) => {
            await tx.$queryRaw`SELECT pg_advisory_xact_lock(781309001)::text`;
            const lead = await tx.lead.findUnique({ where: { id } });
            if (!lead) {
                throw new EditError("Lead não encontrado.");
            }
            if (isDeleted(lead.assessment) === remove) {
                return;
            }
            const result = await tx.lead.updateMany({
                where: { id, updatedAt: new Date(version) },
                data: {
                    assessment: remove
                        ? markDeleted(lead.assessment)
                        : restoreAssessment(lead.assessment),
                },
            });
            if (result.count !== 1) {
                throw new EditError("O registro mudou. Atualize a página antes de continuar.");
            }
        });
        refresh();
        return { ok: true as const };
    } catch (error) {
        return failure(error);
    }
}
