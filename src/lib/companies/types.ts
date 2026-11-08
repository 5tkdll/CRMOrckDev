export const assessments = { UNREVIEWED: "Não avaliado", POTENTIAL: "Potencial cliente", HAS_WEBSITE: "Já possui site — avaliar oportunidade", INSUFFICIENT_DATA: "Sem dados suficientes", DUPLICATE: "Duplicado", DISCARDED: "Descartado" } as const;
export type Assessment = keyof typeof assessments;
export type CompanyValues = {
  name: string; segment: string; address: string; neighborhood: string; city: string; state: string;
  phoneOriginal: string; instagram: string; website: string; assessment: string; doNotContact: string;
  doNotContactReason: string; notes: string; documentType: string; documentNumber: string;
  responsibleName: string; responsibleCpf: string; postalCode: string; addressNumber: string; addressComplement: string;
  useClientCpf: string;
};
export type CompanyData = {
  name: string; segment: string | null; address: string | null; neighborhood: string | null; city: string | null; state: string | null;
  phoneOriginal: string | null; phoneNormalized: string | null; instagram: string | null; website: string | null;
  assessment: Assessment; doNotContact: boolean; doNotContactReason: string | null; notes: string | null;
  documentType: string; documentNumber: string; responsibleName: string; responsibleCpf: string;
  postalCode: string | null; addressNumber: string | null; addressComplement: string | null;
};
export type Duplicate = { id: string; name: string; archived: boolean; phone: string | null; location: string; website: string | null; blocked: boolean };
export type CompanyFormState = { message: string; errors?: Partial<Record<keyof CompanyValues, string>>; duplicates?: Duplicate[]; exactDocument?: boolean };
