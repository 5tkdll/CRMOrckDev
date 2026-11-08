import type { CompanyValues, CompanyData } from "./types";
export function validId(value: unknown): value is string;
export function normalizePhone(value: string): string;
export function safeHttpUrl(value: string): string | null;
export function normalizeWebsite(value: string): string | null;
export function parseCompany(raw: Record<string, unknown>): { ok: true; values: CompanyValues; data: CompanyData } | { ok: false; values: CompanyValues; errors: Partial<Record<keyof CompanyValues, string>> };
