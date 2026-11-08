import type { CompanyFormState } from "./types";
export type CompanySaveResult = { ok: true; id: string } | { ok: false; state: CompanyFormState };
export function readCompanySaveResult(value: unknown): CompanySaveResult;
