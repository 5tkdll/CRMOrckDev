import type { Prisma } from "@/generated/prisma/client";

export type LeadFilters = {
    q: string;
    group: string;
    assessment: string;
    contact: string;
    site: string;
    batch: string;
    segment: string;
    page: number;
};

export const activeLeads: Prisma.LeadWhereInput;
export const missingWebsite: Prisma.LeadWhereInput;
export function parseLeadFilters(
    params: Record<string, string | string[] | undefined>,
): LeadFilters;
export function leadWhere(filters: LeadFilters): Prisma.LeadWhereInput;
export function leadUrl(filters: LeadFilters, patch?: Partial<LeadFilters>): string;
export function restrictionPatch(
    raw: Record<string, unknown>,
    previous: { doNotContact: boolean; doNotContactReason: string | null },
): { doNotContact: boolean; doNotContactReason: string | null };
